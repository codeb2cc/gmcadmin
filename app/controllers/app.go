package controllers

import (
	"encoding/base64"
	"github.com/codeb2cc/gomemcache/memcache"
	"github.com/robfig/revel"
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
	return c.RenderTemplate("index.html")
}

func (c App) GetCache() revel.Result {
	var cacheKey string
	c.Params.Bind(&cacheKey, "key")

	response := Response{"error", nil}
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
