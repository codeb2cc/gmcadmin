package tests

import (
	"code.google.com/p/go.net/websocket"
	"encoding/json"
	"github.com/codeb2cc/gomemcache/memcache"
	"github.com/robfig/revel"
)

var (
	mcServer = "127.0.0.1:11211"
	mcClient *memcache.Client
)

type AppTest struct {
	revel.TestSuite
}

func (t *AppTest) Before() {
	println("Set up")
	mcClient = memcache.New(mcServer)
}

func (t AppTest) TestIndex() {
	t.Get("/")
	t.AssertOk()
	t.AssertContentType("text/html")
}

func (t AppTest) TestCacheGet() {
	foo := &memcache.Item{Key: "foo", Value: []byte("bar"), Flags: 1}
	err := mcClient.Set(foo)
	t.Assert(err == nil)

	t.Get("/cache?key=foo")
	t.AssertOk()
	t.AssertContentType("application/json")

	var r interface{}
	err = json.Unmarshal(t.ResponseBody, &r)
	t.Assert(err == nil)

	m := r.(map[string]interface{})
	item := m["Data"].(map[string]interface{})
	t.AssertEqual(item["Key"], "foo")
	t.AssertEqual(item["Value"], "bar")
}

func (t AppTest) TestWebSocket() {
	ws := t.WebSocket("/ws/socket")

	var r interface{}
	cmds := []string{"server", "settings", "slabs", "items"}

	for _, cmd := range cmds {
		websocket.Message.Send(ws, cmd)
		websocket.JSON.Receive(ws, &r)
		m := r.(map[string]interface{})
		t.AssertEqual(m["Status"], "success")
	}

	ws.Close()
}

func (t *AppTest) After() {
	println("Tear down")
}
