/*jshint asi:true, laxcomma:true, devel:true */

"use strict";

angular.module('gmcadmin.filters', [
]).filter('second2time', function () {
  return function (value, flag) {
    var days = Math.floor(value / 60 / 60 / 24)
    var hours = Math.floor(value / 60 / 60 % 24)
    var mins = Math.floor(value / 60 % 60)

    var timeStr = null
    if (days + hours + mins === 0) {
      timeStr = value + ' secs'
    } else {
      timeStr = days + ' days ' + hours + ' hrs ' + mins + ' mins'
    }

    return timeStr
  }
}).filter('unitResize', function () {
  var units = ['b', 'K', 'M', 'G', 'T']
  return function (value, flag) {
    var i = 0
    var base = flag ? flag : 1024
    for (; i < units.length; i++) {
      if (value < base) { break }
      value /= base
    }
    return value.toFixed(1) + ' ' + units[i]
  }
})
