package controllers

import (
	"strings"
	"github.com/codeb2cc/gomemcache/memcache"
	"github.com/robfig/revel"
)

var (
	mcServers []string
	mcClients map[string]*memcache.Client
)

func init() {
	revel.OnAppStart(func() {
		mcServers = strings.Split(revel.Config.StringDefault("memcached", "127.0.0.1:11211"), "|")
		mcClients = make(map[string]*memcache.Client)
		for _, server := range mcServers {
			mcClients[server] = memcache.New(server)
		}
	})
}
