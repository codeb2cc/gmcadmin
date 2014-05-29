package controllers

import (
	"code.google.com/p/go.net/websocket"
	"encoding/json"
	"github.com/robfig/revel"
	"net"
	"strconv"
	"strings"
)

type WebSocket struct {
	*revel.Controller
}

type WebSocketMessage struct {
	Status string
	Cmd    string
	Data   interface{}
}

var (
	cmdServerStats   = "server"
	cmdSettingsStats = "settings"
	cmdSlabStats     = "slabs"
	cmdItemStats     = "items"
)

func (c WebSocket) Socket(host string, ws *websocket.Conn) revel.Result {
	mcServer := mcServers[0]
	mcClient := mcClients[mcServer]
	addr, _ := net.ResolveTCPAddr("tcp", mcServer)

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

		msgData := strings.SplitN(msg, "|", 2)
		response := WebSocketMessage{"error", "", nil}

		if len(msgData) == 2 {
			mcIndex, err := strconv.Atoi(msgData[1])
			if err != nil {
				return nil
			} else if 0 <= mcIndex && mcIndex < len(mcServers) {
				mcServer = mcServers[mcIndex]
				mcClient = mcClients[mcServer]
				addr, _ = net.ResolveTCPAddr("tcp", mcServer)
			} else {
				return nil
			}
		} else {
			return nil
		}

		switch msgData[0] {
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
				strMap := make(map[string]interface{})
				for i, value := range stats {
					strMap[strconv.Itoa(i)] = value
				}
				response.Status = "success"
				response.Data = strMap
			} else {
				revel.WARN.Print(err)
			}
		case cmdItemStats:
			response.Cmd = cmdItemStats
			if stats, err := mcClient.StatsItems(addr); err == nil {
				strMap := make(map[string]interface{})
				for i, value := range stats {
					strMap[strconv.Itoa(i)] = value
				}
				response.Status = "success"
				response.Data = strMap
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
