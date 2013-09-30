/*jshint asi:true, laxcomma:true, devel:true */

"use strict";

angular.module('gmcadmin.controllers', [
]).controller('NavCtrl', [
  '$scope'
, '$location'
, function ($scope, $location) {
    $scope.navClass = function (nav) {
      return $location.path() == nav ? 'active' : ''
    }
  }
])
.controller('ServerCtrl', [
  '$scope'
, '$timeout'
, function ($scope, $timeout) {
    $scope.socket = null
    $scope.connected = false

    $scope.serverStats = {}
    $scope.settingsStats = {}

    var socketInit = function () {
      $scope.socket = new WebSocket('ws://' + location.host + ':8000/ws/socket')
      $scope.socket.onopen = function (evt) {
        $scope.$apply(function () {
          $scope.connected = true
          $scope.update()
        })
      }
      $scope.socket.onclose = function (evt) {
        $scope.$apply(function () {
          $scope.connected = false
        })
      }
      $scope.socket.onmessage = function (evt) {
        $scope.$apply(function () {
          try {
            var data = JSON.parse(evt.data)
            switch (data.Cmd) {
              case 'server':
                $scope.serverStats = data.Data
                break
              case 'settings':
                $scope.settingsStats = data.Data
                break
            }
          } catch (exc) {
            console.log(exc)
          }
        })
      }
    }

    $scope.update = function () {
      if ($scope.connected) {
        $scope.socket.send('server')
        $scope.socket.send('settings')
      }
    }
    $scope.updateInterval = setInterval(function () {
      $scope.update()
    }, 60 * 1000)

    $scope.$on('$routeChangeStart', function () {
      if ($scope.connected) {
        $scope.socket.close()
      }
    })

    $timeout(function () {
      socketInit()
    }, 0)

  }
])
.controller('SlabCtrl', [
  '$scope'
, function ($scope) {
  }
])
