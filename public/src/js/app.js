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
  $routeProvider.otherwise({ redirectTo: '/server' })
}])

