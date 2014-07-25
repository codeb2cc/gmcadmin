package tests

import (
	"code.google.com/p/go.net/websocket"
	"encoding/json"
	"fmt"
	"github.com/codeb2cc/gomemcache/memcache"
	"github.com/revel/revel"
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
	t.AssertContentType("text/html; charset=utf-8")
}

func (t AppTest) TestCacheGet() {
	foo := &memcache.Item{Key: "foo", Value: []byte("bar"), Flags: 1}
	err := mcClient.Set(foo)
	t.Assert(err == nil)

	t.Get(fmt.Sprintf("/cache?key=foo&server=%s", mcServer))
	t.AssertOk()
	t.AssertContentType("application/json; charset=utf-8")

	var r interface{}
	err = json.Unmarshal(t.ResponseBody, &r)
	t.Assert(err == nil)

	m := r.(map[string]interface{})
	item := m["Data"].(map[string]interface{})
	t.AssertEqual(item["Key"], "foo")
	t.AssertEqual(item["Value"], "bar")
}

func (t AppTest) TestPreallocate() {
	data := map[string][]string{
		"server": []string{mcServer},
		"size":   []string{"1024"},
		"mem":    []string{"1000000"},
	}

	t.PostForm("/allocate", data)
	t.AssertOk()
	t.AssertContentType("application/json; charset=utf-8")

	var r interface{}
	err := json.Unmarshal(t.ResponseBody, &r)
	t.Assert(err == nil)

	// With memcached default settings(-f 1.25 -n 48)
	m := r.(map[string]interface{})
	t.AssertEqual(m["Status"], "success")
	item := m["Data"].(map[string]interface{})
	t.AssertEqual(item["DataSize"], float64(1024))
	t.AssertEqual(item["SlabSize"], float64(1184))
	t.AssertEqual(item["Malloced"], float64(1047840))
}

func (t AppTest) TestWebSocket() {
	ws := t.WebSocket("/ws/socket")

	var r interface{}
	cmds := []string{"server|0", "settings|0", "slabs|0", "items|0"}

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
