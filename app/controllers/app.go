package controllers

import (
	"bytes"
	"encoding/base64"
	"fmt"
	"github.com/codeb2cc/gomemcache/memcache"
	"github.com/revel/revel"
	"math"
	"net"
	"unicode/utf8"
)

type App struct {
	*revel.Controller
}

type Response struct {
	Status string
	Data   interface{}
}

type CacheItem struct {
	Key      string
	Value    string
	Encoding string
}

func parseItem(i *memcache.Item) *CacheItem {
	item := &CacheItem{Key: i.Key}

	if utf8.Valid(i.Value) {
		item.Value = string(i.Value)
		item.Encoding = "string"
	} else {
		item.Value = base64.StdEncoding.EncodeToString(i.Value)
		item.Encoding = "base64"
	}

	return item
}

func (c App) Index() revel.Result {
	c.RenderArgs["serverData"] = mcServers
	return c.RenderTemplate("index.html")
}

func (c App) GetCache() revel.Result {
	var server, cacheKey string
	c.Params.Bind(&server, "server")
	c.Params.Bind(&cacheKey, "key")

	response := Response{"error", nil}
	mcClient, ok := mcClients[server]
	if !ok {
		return c.RenderJson(response)
	}

	if cacheKey != "" {
		item, err := mcClient.Get(cacheKey)
		if err == nil {
			response.Status = "success"
			response.Data = parseItem(item)
		} else {
			response.Status = "miss"
		}
	}

	return c.RenderJson(response)
}

type AllocationResult struct {
	DataSize uint64
	SlabId   int
	SlabSize uint64
	SlabNum  uint64
	PageSize uint64
	PageNum  uint64
	Malloced uint64
}

func (c App) AllocateSlab() revel.Result {
	var server string
	var dataSize, memSize uint64
	c.Params.Bind(&server, "server")
	c.Params.Bind(&dataSize, "size")
	c.Params.Bind(&memSize, "mem")

	response := Response{"error", nil}
	mcClient, ok := mcClients[server]
	if !ok || dataSize == 0 || memSize == 0 {
		return c.RenderJson(response)
	}

	// Validate execution
	addr, err := net.ResolveTCPAddr("tcp", server)
	stats, err := mcClient.StatsSettings(addr)
	if err != nil {
		revel.WARN.Print(err)
		return c.RenderJson(response)
	}
	if dataSize > stats.ItemSizeMax || memSize > stats.Maxbytes {
		return c.RenderJson(response)
	}

	r := &AllocationResult{DataSize: dataSize, SlabId: 1, SlabSize: uint64(stats.ChunkSize) + 48}
	// Memcached item size calculation. `64 + 1` represent the key lenght we use here. Check
	// `item_make_header` in memcached source for detail.
	itemSize := 48 + (64 + 1) + uint64(math.Min(40, float64(len(fmt.Sprintf(" %d %d\r\n", 0, dataSize))))) + (dataSize + 2) + 8
	for r.SlabSize < itemSize {
		r.SlabSize = uint64(math.Ceil(float64(r.SlabSize) * stats.GrowthFactor))
		r.SlabId += 1
		if r.SlabSize%8 != 0 {
			r.SlabSize += 8 - (r.SlabSize % 8) // Always 8-bytes aligned
		}
	}
	r.PageSize = stats.ItemSizeMax / r.SlabSize * r.SlabSize
	if r.PageSize == 0 {
		r.PageSize = stats.ItemSizeMax
	}
	r.PageNum = uint64(math.Max(float64(memSize/r.PageSize), 1))
	r.SlabNum = r.PageNum * (stats.ItemSizeMax / r.SlabSize)
	r.Malloced = r.PageSize * r.PageNum

	item := &memcache.Item{Value: bytes.Repeat([]byte{'#'}, int(r.DataSize))}

	const MaxConn int = 64

	accuCh := make(chan bool, int(r.SlabNum))

	// Allocate
	itemCh := make(chan memcache.Item)
	for i := 0; i < MaxConn; i++ {
		go func(ch <-chan memcache.Item, accu chan<- bool) {
			for item := range ch {
				err := mcClient.Set(&item)
				if err != nil {
					revel.WARN.Print(err)
				}
				accu <- true
			}
		}(itemCh, accuCh)
	}
	for i := 0; i < int(r.SlabNum); i++ {
		item.Key = fmt.Sprintf("%064d", i)
		itemCh <- *item
	}
	for i := 0; i < int(r.SlabNum); i++ {
		<-accuCh
	}

	// Release
	keyCh := make(chan string)
	for i := 0; i < MaxConn; i++ {
		go func(ch <-chan string, accu chan<- bool) {
			for key := range ch {
				err := mcClient.Delete(key)
				if err != nil {
					revel.WARN.Print(err)
				}
				accu <- true
			}
		}(keyCh, accuCh)
	}
	for i := 0; i < int(r.SlabNum); i++ {
		key := fmt.Sprintf("%064d", i)
		keyCh <- key
	}
	for i := 0; i < int(r.SlabNum); i++ {
		<-accuCh
	}

	response.Status = "success"
	response.Data = r

	return c.RenderJson(response)
}
