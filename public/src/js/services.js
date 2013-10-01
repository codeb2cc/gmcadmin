/*jshint asi:true, laxcomma:true, devel:true */

"use strict";

angular.module('gmcadmin.services', [])
.service('socketClient', ['CONF', function (CONF) {
  var socket = null
  var connected = false
  var pendingMsg = []

  var openHandler = function (evt) {
    connected = true
    process()   // Send pending message

    if ("function" === typeof client.callbacks.open) {
      client.callbacks.open(evt)
    }
  }

  var closeHandler = function (evt) {
    connected = false 

    if ("function" === typeof client.callbacks.close) {
      client.callbacks.close(evt)
    }
  }

  var errorHandler = function (evt) {
    connected = false 
    console.warn(evt)

    if ("function" === typeof client.callbacks.error) {
      client.callbacks.error(evt)
    }
  }

  var messageHandler = function (evt) {
    try {
      var data = JSON.parse(evt.data)
      if ("function" === typeof client.callbacks.message) {
        client.callbacks.message(evt, data)
      }
    } catch (exc) {
      console.warn(exc)
    }
  }

  var connect = function () {
    if (socket) {
      switch (socket.readyState) {
        case WebSocket.CONNECTING:
          return
        case WebSocket.OPEN:
          connected = false
          socket.close()
          break
      }
    }

    socket = new WebSocket(CONF.websocket)
    socket.onopen = openHandler
    socket.onclose = closeHandler
    socket.onerror = errorHandler
    socket.onmessage = messageHandler
  }

  var process = function () {
    var msg = null
    while (connected && (msg = pendingMsg.shift())) {
      try {
        socket.send(msg)
      } catch (exc) {
        console.warn(exc)
        // Reconnect?
      }
    }
  }

  var send = function (msg) {
    pendingMsg.push(msg)
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      connect()
    } else {
      process()
    }
  }

  var client = {
    send: send
  , callbacks: {} 
  }

  return client
}])
