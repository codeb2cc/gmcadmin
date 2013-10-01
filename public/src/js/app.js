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
  $routeProvider.otherwise({ redirectTo: '/server' })
}])
.constant('CONF', {
  'websocket': 'ws://localhost.com:8000/ws/socket'
})
