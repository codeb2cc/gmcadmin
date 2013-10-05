package controllers

import (
    "github.com/robfig/revel"
    "github.com/codeb2cc/gomemcache/memcache"
)

type App struct {
    *revel.Controller
}

type Response struct {
    Status string
    Data interface{}
}

type CacheItem struct {
    Key string
    Value string
}

func parseItem (item *memcache.Item) *CacheItem {
    return &CacheItem{item.Key, string(item.Value)}
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
