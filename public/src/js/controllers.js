/*jshint asi:true, laxcomma:true, devel:true */

"use strict";

angular.module('gmcadmin.controllers', [])
.controller('NavCtrl', [
  '$scope'
, '$location'
, function ($scope, $location) {
    $scope.navClass = function (nav) {
      return $location.path() == nav ? 'active' : ''
    }
  }
])
.controller('ServerCtrl', [
  'CONF'
, '$scope'
, '$timeout'
, 'socketClient'
, function (CONF, $scope, $timeout, socketClient) {
    $scope.serverStats = null
    $scope.settingsStats = null
    $scope.slabsStats = null

    socketClient.callbacks.message = function (evt, data) {
      $scope.$apply(function () {
        switch (data.Cmd) {
          case 'server':
            $scope.serverStats = data.Data
            break
          case 'settings':
            $scope.settingsStats = data.Data
            break
          case 'slabs':
            var slab = null
            for (var i = 0; i < data.Data.length; i++) {
              slab = data.Data[i]
              slab.Malloced = slab.TotalChunks * slab.ChunkSize
              slab.Wasted = (slab.Malloced < slab.MemRequested) ? ((slab.TotalChunks - slab.UsedChunks) * slab.ChunkSize) : (slab.Malloced - slab.MemRequested)
            }
            $scope.slabsStats = data.Data
            break
        }
      })
    }

    $scope.ready = function () {
      var readyState = $scope.serverStats !== null &&
            $scope.settingsStats !== null &&
            $scope.slabsStats !== null
      return readyState
    }

    $scope.update = function () {
      socketClient.send('server')
      socketClient.send('settings')
      socketClient.send('slabs')
    }

    $scope.updateInterval = setInterval(function () {
      $scope.update()
    }, 60 * 1000)

    $scope.$on('$routeChangeStart', function () {})

    $timeout(function () {
      $scope.update()
    }, 0)   // Initial
  }
])
.controller('SlabCtrl', [
  'CONF'
, '$scope'
, '$timeout'
, 'socketClient'
, function (CONF, $scope, $timeout, socketClient) {
    $scope.slabsStats = null
    $scope.itemsStats = null
    $scope.slabIndex = 0

    socketClient.callbacks.message = function (evt, data) {
      $scope.$apply(function () {
        switch (data.Cmd) {
          case 'slabs':
            var slab = null
            for (var i = 0; i < data.Data.length; i++) {
              slab = data.Data[i]
              slab.Malloced = slab.TotalChunks * slab.ChunkSize
              slab.Wasted = (slab.Malloced < slab.MemRequested) ? ((slab.TotalChunks - slab.UsedChunks) * slab.ChunkSize) : (slab.Malloced - slab.MemRequested)
            }
            $scope.slabsStats = data.Data
            break
          case 'items':
            $scope.itemsStats = data.Data
            break
        }
      })
    }

    $scope.ready = function () {
      var readyState = $scope.slabsStats !== null &&
            $scope.itemsStats !== null
      return readyState
    }

    $scope.update = function () {
      socketClient.send('slabs')
      socketClient.send('items')
    }

    $scope.activeSlab = function (evt, index) {
      $scope.slabIndex = index
      var tr = angular.element(evt.target).parentsUntil('tbody')
      tr.siblings().removeClass('active')
      tr.addClass('active')
    }

    $scope.updateInterval = setInterval(function () {
      $scope.update()
    }, 60 * 1000)

    $scope.$on('$routeChangeStart', function () {})

    $timeout(function () {
      $scope.update()
    }, 0)
  }
])
.controller('LiveCtrl', [
  '$scope'
, function ($scope) {
  }
])
