/*jshint asi:true, laxcomma:true, devel:true */

"use strict";

angular.module('gmcadmin.controllers', [
]).controller('NavCtrl', [
  '$scope'
, '$route'
, '$location'
, function ($scope) {
    console.log('NavCtrl')
  }
])
.controller('ServerCtrl', [
  '$scope'
, function ($scope) {
    console.log('ServerCtrl')
  }
])
.controller('SlabCtrl', [
  '$scope'
, function ($scope) {
    console.log('SlabCtrl')
  }
])
