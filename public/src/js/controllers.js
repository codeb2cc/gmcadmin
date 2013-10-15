/*jshint asi:true, laxcomma:true, devel:true */

"use strict";

angular.module('gmcadmin.controllers', [])
.controller('NavCtrl', [
  '$scope'
, '$location'
, function ($scope, $location) {
    $scope.navClass = function (nav) {
      return $location.path() === nav ? 'active' : ''
    }
  }
])
.controller('ServerCtrl', [
  'CONF'
, '$scope'
, '$timeout'
, '$location'
, 'socketClient'
, function (CONF, $scope, $timeout, $location, socketClient) {
    $scope.serverStats = null
    $scope.settingsStats = null
    $scope.slabsStats = null

    if (!Modernizr.websockets) {
      $location.path('/error')
      return
    }

    socketClient.callbacks.message = function (evt, data) {
      NProgress.inc(0.3)
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
            for (var k in data.Data) {
              slab = data.Data[k]
              slab.Index = parseInt(k, 10)
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
      NProgress.start()
      socketClient.send('server')
      socketClient.send('settings')
      socketClient.send('slabs')
    }

    $scope.$on('$routeChangeStart', function () {
      clearInterval($scope.updateInterval)
    })

    $timeout(function () {
      $scope.updateInterval = setInterval(function () {
        $scope.update()
      }, CONF.serverInterval)
      $scope.update()
    }, 0)
  }
])
.controller('SlabCtrl', [
  'CONF'
, '$scope'
, '$timeout'
, '$location'
, 'socketClient'
, function (CONF, $scope, $timeout, $location, socketClient) {
    $scope.slabsStats = null
    $scope.itemsStats = null
    $scope.slabIndex = null

    $scope.slabHeaders = [
      ['Index', '#']
    , ['ChunkSize', 'Chunk Size']
    , ['UsedChunks', 'Used Chunks']
    , ['FreeChunks', 'Free Chunks']
    , ['TotalChunks', 'Total Chunks']
    , ['Malloced', 'Malloced']
    , ['Wasted', 'Wasted']
    , ['MemRequested', 'Requested']
    ]

    $scope.slabOrder = 'Index'
    $scope.slabReverse = false

    if (!Modernizr.websockets) {
      $location.path('/error')
      return
    }

    socketClient.callbacks.message = function (evt, data) {
      NProgress.inc(0.45)
      $scope.$apply(function () {
        switch (data.Cmd) {
          case 'slabs':
            var slab = null
            for (var k in data.Data) {
              slab = data.Data[k]
              slab.Index = parseInt(k, 10)
              slab.Malloced = slab.TotalChunks * slab.ChunkSize
              slab.Wasted = (slab.Malloced < slab.MemRequested) ? ((slab.TotalChunks - slab.UsedChunks) * slab.ChunkSize) : (slab.Malloced - slab.MemRequested)
            }
            $scope.slabsStats = []
            $scope.slabIndex = 0
            angular.forEach(data.Data, function (val, key) {
              // Convert to array for sorting
              $scope.slabsStats.push(val)
            })
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

    $scope.sort = function (order) {
      if ($scope.slabOrder === order) {
        $scope.slabReverse = !$scope.slabReverse
      } else {
        $scope.slabOrder = order
      }
    }

    $scope.update = function () {
      NProgress.start()
      socketClient.send('slabs')
      socketClient.send('items')
    }

    $scope.activeSlab = function (evt, index) {
      $scope.slabIndex = index
    }

    $scope.$on('$routeChangeStart', function () {
      clearInterval($scope.updateInterval)
    })

    $timeout(function () {
      $scope.updateInterval = setInterval(function () {
        $scope.update()
      }, CONF.slabInterval)
      $scope.update()
    }, 0)
  }
])
.controller('LiveCtrl', [
  'CONF'
, '$scope'
, '$timeout'
, '$location'
, 'socketClient'
, function (CONF, $scope, $timeout, $location, socketClient) {
    $scope.serverStats = null
    $scope.slabsStats = null

    if (!Modernizr.websockets) {
      $location.path('/error')
      return
    }

    $scope.memStatsLive = {
      chartType: 'areaspline'
    , plotOptions: { areaspline: { stacking: 'normal' } }
    , colors: ['#C84D64', '#4968AB']
    , dataLabels: ['Wasted', 'Used']
    , maxLength: 30
    , unit: ' MB'
    , watch: 'memStatsData'
    }
    $scope.memStatsData = []

    $scope.IOStatsLive = {
      chartType: 'spline'
    , colors: ['#03A64A', '#1B80BF']
    , dataLabels: ['Read', 'Write']
    , maxLength: 30
    , unit: ' KB/s'
    , watch: 'IOStatsData'
    }
    $scope.IOStatsData = []

    $scope.connStatsLive = {
      chartType: 'areaspline'
    , colors: ['#FF9900']
    , dataLabels: ['Connections']
    , maxLength: 30
    , watch: 'connStatsData'
    }
    $scope.connStatsData = []

    $scope.itemStatsLive = {
      chartType: 'areaspline'
    , colors: ['#FF9900']
    , dataLabels: ['Items']
    , maxLength: 30
    , watch: 'itemStatsData'
    }
    $scope.itemStatsData = []

    $scope.reqStatsLive = {
      chartType: 'spline'
    , colors: [
        '#48C636'
      , '#1290EE'
      , '#FF3602'
      , '#E8B90A'
      , '#A110E8'
      , '#FF89E0'
      , '#393939'
      ]
    , dataLabels: ['Get', 'Set', 'Delete', 'Cas', 'Incr/Decr', 'Touch', 'Flush']
    , maxLength: 30
    , unit: ' q/s'
    , watch: 'reqStatsData'
    }
    $scope.reqStatsData = []

    $scope.hitRateStatsLive = {
      chartType: 'spline'
    , colors: [
        '#48C636'
      , '#FF3602'
      , '#E8B90A'
      , '#A110E8'
      , '#FF89E0'
      ]
    , dataLabels: ['Get', 'Delete', 'Cas', 'Incr/Decr', 'Touch']
    , maxValue: 100
    , maxLength: 30
    , unit: ' %'
    , watch: 'hitRateStatsData'
    }
    $scope.hitRateStatsData = []

    $scope.ERStatsLive = {
      chartType: 'spline'
    , colors: [
        '#D60000'
      , '#FFC801'
      , '#93C700'
      , '#0E99DA'
      ]
    , dataLabels: ['Evictions', 'Evicted Unfetched', 'Reclaimed', 'Expired Unfetched']
    , maxLength: 30
    , watch: 'ERStatsData'
    }
    $scope.ERStatsData = []

    var unitResize = function (value, unit) {
      var scales = {
        '%': 0.01
      , 'K': 1024
      , 'M': 1024 * 1024
      , 'G': 1024 * 1024 * 1024
      , 'T': 1024 * 1024 * 1024 * 1024
      }
      if (isNaN(value) || !isFinite(value)) {
        return 0
      }
      if (!unit) {
        return parseFloat(value.toFixed(1))
      }
      else {
        return parseFloat((value / scales[unit]).toFixed(1))
      }
    }

    socketClient.callbacks.message = function (evt, data) {
      NProgress.inc(0.45)
      $scope.$apply(function () {
        var time = (new Date()).getTime()
        switch (data.Cmd) {
          case 'server':
            if ($scope.serverStats) {
              var deltaT = time - $scope.serverStats._time
              $scope.IOStatsData = [
                unitResize((data.Data.BytesRead - $scope.serverStats.BytesRead) / deltaT, 'K')
              , unitResize((data.Data.BytesWritten - $scope.serverStats.BytesWritten) / deltaT, 'K')
              ]

              var deltaGet = data.Data.CmdGet - $scope.serverStats.CmdGet
              var deltaSet = data.Data.CmdSet - $scope.serverStats.CmdSet
              var deltaDelete = data.Data.DeleteMisses + data.Data.DeleteHits - $scope.serverStats.DeleteMisses - $scope.serverStats.DeleteHits
              var deltaCas = data.Data.CasMisses + data.Data.CasHits - $scope.serverStats.CasMisses - $scope.serverStats.CasHits
              var deltaIncrDecr = data.Data.IncrMisses + data.Data.IncrHits + data.Data.DecrMisses + data.Data.DecrHits - $scope.serverStats.IncrMisses - $scope.serverStats.IncrHits - $scope.serverStats.DecrMisses - $scope.serverStats.DecrHits
              var deltaTouch = data.Data.CmdTouch - $scope.serverStats.CmdTouch
              var deltaFlush = data.Data.CmdFlush - $scope.serverStats.CmdFlush
              var deltaEvictions = data.Data.Evictions - $scope.serverStats.Evictions
              var deltaEvictedUnfetched = data.Data.EvictedUnfetched - $scope.serverStats.EvictedUnfetched
              var deltaReclaimed = data.Data.Reclaimed - $scope.serverStats.Reclaimed
              var deltaExpiredUnfetched = data.Data.ExpiredUnfetched - $scope.serverStats.ExpiredUnfetched
              $scope.reqStatsData = [
                unitResize(deltaGet / deltaT)
              , unitResize(deltaSet / deltaT)
              , unitResize(deltaDelete / deltaT)
              , unitResize(deltaCas / deltaT)
              , unitResize(deltaIncrDecr / deltaT)
              , unitResize(deltaTouch / deltaT)
              , unitResize(deltaFlush / deltaT)
              ]
              $scope.hitRateStatsData = [
                unitResize((data.Data.GetHits - $scope.serverStats.GetHits) / deltaGet, '%')
              , unitResize((data.Data.DeleteHits - $scope.serverStats.DeleteHits) / deltaDelete, '%')
              , unitResize((data.Data.CasHits - $scope.serverStats.CasHits) / deltaCas, '%')
              , unitResize((data.Data.IncrHits + data.Data.DecrHits - $scope.serverStats.IncrHits - $scope.serverStats.DecrHits) / deltaIncrDecr, '%')
              , unitResize((data.Data.TouchHits - $scope.serverStats.TouchHits) / deltaTouch, '%')
              ]
              $scope.ERStatsData = [
                unitResize(deltaEvictions / deltaT)
              , unitResize(deltaEvictedUnfetched / deltaT)
              , unitResize(deltaReclaimed / deltaT)
              , unitResize(deltaExpiredUnfetched / deltaT)
              ]
            }
            $scope.connStatsData = [ data.Data.CurrConnections ]
            $scope.itemStatsData = [ data.Data.CurrItems ]
            $scope.serverStats = data.Data
            $scope.serverStats._time = time
            break
          case 'slabs':
            var slab = null
            var mallocedMem = 0
            var wastedMem = 0
            for (var k in data.Data) {
              slab = data.Data[k]
              slab.Index = parseInt(k, 10)
              slab.Malloced = slab.TotalChunks * slab.ChunkSize
              slab.Wasted = (slab.Malloced < slab.MemRequested) ? ((slab.TotalChunks - slab.UsedChunks) * slab.ChunkSize) : (slab.Malloced - slab.MemRequested)
              mallocedMem += slab.Malloced
              wastedMem += slab.Wasted
            }
            $scope.slabsStats = data.Data
            $scope.memStatsData = [ unitResize(wastedMem, 'M'), unitResize(mallocedMem, 'M') ]
            break
        }
      })
    }

    $scope.ready = function () {
      var readyState = $scope.serverStats !== null &&
            $scope.slabsStats !== null
      return readyState
    }

    $scope.update = function () {
      NProgress.start()
      socketClient.send('server')
      socketClient.send('slabs')
    }

    $scope.$on('$routeChangeStart', function () {
      clearInterval($scope.updateInterval)
    })

    $timeout(function () {
      $scope.updateInterval = setInterval(function () {
        $scope.update()
      }, CONF.liveInterval)
      $scope.update()
    }, 0)
  }
])
.controller('ToolCtrl', [
  'CONF'
, '$scope'
, '$timeout'
, '$http'
, function (CONF, $scope, $timeout, $http) {
    NProgress.done()

    $scope.queryKey = ''
    $scope.queryResult = null
    $scope.queryFlag = -1

    $scope.allocateSize = 0
    $scope.allocateMem = 0
    $scope.allocateFlag = -1
    $scope.allocateResult = null

    $scope.queryState = function () {
      switch ($scope.queryFlag) {
        case 0:
          return [true, 'has-success']
        case 1:
          return [false, 'has-error']
        default:
          return [true, '']
      }
    }

    $scope.allocateState = function () {
      switch ($scope.allocateFlag) {
        case 0:
          return [false, 'has-success', 'Success']
        case 1:
          return [false, 'has-warn', 'Invalid Param']
        case 2:
          return [false, 'has-error', 'Failed']
        default:
          return [true, '', '']
      }
    }

    $scope.cacheGet = function () {
      if (this.queryKey) {
        NProgress.start()
        $http({ method: 'GET', url: '/cache?key=' + encodeURIComponent(this.queryKey) })
          .success(function (data, status, headers, config) {
            NProgress.done()
            if (status === 200 && data.Status === 'success') {
              $scope.queryFlag = 0
              $scope.queryResult = data.Data
            } else {
              $scope.queryFlag = 1
              $scope.queryResult = null
            }
          })
          .error(function (data, status, headers, config) {})
      }
    }

    $scope.allocateSlab = function () {
      if (this.allocateSize && this.allocateMem) {
        NProgress.start()
        $http({
          method: 'POST'
        , url: '/allocate'
        , data: 'size=' + encodeURIComponent(this.allocateSize) + '&mem=' + encodeURIComponent(this.allocateMem)
        , headers : {'Content-Type':'application/x-www-form-urlencoded; charset=UTF-8'}
        })
          .success(function (data, status, headers, config) {
            NProgress.done()
            if (status === 200) {
              switch (data.Status) {
                case 'success':
                  $scope.allocateFlag = 0
                  $scope.allocateResult = data.Data
                  break
                case 'invalid':
                  $scope.allocateFlag = 1
                  $scope.allocateResult = null
                  break
                case 'error':
                  $scope.allocateFlag = 2
                  $scope.allocateResult = null
                  break
              }
            } else {
              $scope.allocateFlag = 2
              $scope.allocateResult = null
            }
          })
          .error(function (data, status, headers, config) {})
      }
    }

    $scope.slabMin = 48
    $scope.slabFactor = 1.25
    $scope.slabMax = 1048576

    $scope.slabInfo = []

    $scope.calculateSlab = function () {
      if ($scope.slabMin && $scope.slabFactor && $scope.slabMax) {
        $scope.slabInfo = [ $scope.slabMin + 48 ]     // Minimum size plus sizeof(item)
        var i = 0
        var size = null
        while ($scope.slabInfo[i] < Math.ceil($scope.slabMax / $scope.slabFactor)) {
          size = $scope.slabInfo[i] * $scope.slabFactor
          if (size % 8) {   
            size += 8 - (size % 8)    // Always 8-bytes aligned
          }
          $scope.slabInfo.push(parseInt(size, 10))
          i += 1
        }

        // Set max slab size to max page size
        $scope.slabInfo.pop()
        $scope.slabInfo.push($scope.slabMax)
      }
    }

    var promise = null
    $scope.$watch(function () {
      return '' + $scope.slabMin + $scope.slabFactor + $scope.slabMax
    }, function () {
      $timeout.cancel(promise)
      promise = $timeout($scope.calculateSlab, 1500)
    })
  }
])
.controller('ErrorCtrl', [
  'CONF'
, '$scope'
, '$location'
, function (CONF, $scope, $location) {
    NProgress.remove()

    if (!Modernizr.websockets) {
      $scope.errorTitle = "Require Websocket Support"
      $scope.errorDetail = "WebSocket is a protocol providing full-duplex communications channels over a single TCP connection."
    } else {
      $location.path('/')
    }
  }
])
