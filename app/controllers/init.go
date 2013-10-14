package controllers

import (
	"github.com/codeb2cc/gomemcache/memcache"
	"github.com/robfig/revel"
)

var (
	mcServer string
	mcClient *memcache.Client
)

func init() {
	revel.OnAppStart(func() {
		mcServer = revel.Config.StringDefault("memcached", "127.0.0.1:11211")
		mcClient = memcache.New(mcServer)
	})
}
