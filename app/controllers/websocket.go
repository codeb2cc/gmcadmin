package controllers

import (
    "net"
    "sort"
    "encoding/json"
    "code.google.com/p/go.net/websocket"
    "github.com/robfig/revel"
    "github.com/codeb2cc/gomemcache/memcache"
)

type WebSocket struct {
    *revel.Controller
}

type Message struct {
    Status string
    Cmd string
    Data interface{}
}

var (
    cmdServerStats = "server"
    cmdSettingsStats = "settings"
    cmdSlabStats = "slabs"
    cmdItemStats = "items"
)

func (c WebSocket) Socket(host string, ws *websocket.Conn) revel.Result {
    mcServer := revel.Config.StringDefault("memcached", "127.0.0.1:11211")
    mcClient := memcache.New(mcServer)
    addr, err := net.ResolveTCPAddr("tcp", mcServer)

    if err != nil {
        revel.ERROR.Printf("Cannot resolve memcached address %s", mcServer)
        return nil
    }

    // Stuff websocket events into a channel
    message := make(chan string)
    go func() {
        var msg string
        for {
            err := websocket.Message.Receive(ws, &msg)
            if err != nil {
                close(message)
                return
            }
            message <- msg
        }
    }()

    // Listen
    for {
        msg, ok := <-message
        if !ok {
            return nil
        }

        response := Message{"error", "", nil}
        switch msg {
        case cmdServerStats:
            response.Cmd = cmdServerStats
            if stats, err := mcClient.Stats(addr); err == nil {
                response.Status = "success"
                response.Data = stats
            } else {
                revel.WARN.Print(err)
            }
        case cmdSettingsStats:
            response.Cmd = cmdSettingsStats
            if stats, err := mcClient.StatsSettings(addr); err == nil {
                response.Status = "success"
                response.Data = stats
            } else {
                revel.WARN.Print(err)
            }
        case cmdSlabStats:
            response.Cmd = cmdSlabStats
            if stats, err := mcClient.StatsSlabs(addr); err == nil {
                var keys []int
                var values []interface{}
                for key := range stats {
                    keys = append(keys, key)
                }
                sort.Ints(keys)
                for _, key := range keys {
                    values = append(values, stats[key])
                }
                response.Status = "success"
                response.Data = values
            } else {
                revel.WARN.Print(err)
            }
        case cmdItemStats:
            response.Cmd = cmdItemStats
            if stats, err := mcClient.StatsItems(addr); err == nil {
                var keys []int
                var values []interface{}
                for key := range stats {
                    keys = append(keys, key)
                }
                sort.Ints(keys)
                for _, key := range keys {
                    values = append(values, stats[key])
                }
                response.Status = "success"
                response.Data = values
            } else {
                revel.WARN.Print(err)
            }
        default:
            revel.INFO.Print("Receive unknown message: ", msg)
        }

        jsonBytes, err := json.Marshal(response)
        if err != nil {
            revel.WARN.Print(err)
            return nil
        }

        if websocket.Message.Send(ws, string(jsonBytes)) != nil {
            // Disconnected
            revel.INFO.Print("Send message failed. Disconnect.")
            return nil
        }
    }

    return nil
}

