/*jshint asi:true, laxcomma:true, devel:true */

"use strict";

angular.module('gmcadmin', [
  'ngRoute'
, 'gmcadmin.filters'
, 'gmcadmin.services'
, 'gmcadmin.directives'
, 'gmcadmin.controllers'
])
.config(['$routeProvider', function ($routeProvider) {
  $routeProvider.when('/server', { templateUrl: '/tpl/server.html', controller: 'ServerCtrl' })
  $routeProvider.when('/slab', { templateUrl: '/tpl/slab.html', controller: 'SlabCtrl' })
  $routeProvider.when('/live', { templateUrl: '/tpl/live.html', controller: 'LiveCtrl' })
  $routeProvider.when('/tool', { templateUrl: '/tpl/tool.html', controller: 'ToolCtrl' })
  $routeProvider.when('/error', { templateUrl: '/tpl/error.html', controller: 'ErrorCtrl' })
  $routeProvider.otherwise({ redirectTo: '/server' })

  NProgress.start()
}])
.constant('CONF', {
  'websocket': 'ws://localhost.com:8000/ws/socket'
, 'serverInterval': 60 * 1000
, 'slabInterval': 60 * 1000
, 'liveInterval': 10 * 1000
})

