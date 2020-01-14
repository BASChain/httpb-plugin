/**
 *     ____  ___   _____
 *    / __ )/   | / ___/
 *   / __  / /| | \__ \
 *  / /_/ / ___ |___/ /
 * /_____/_/  |_/____/
 *
 * Copyright (c) 2019 BAS,bas-devteam@gmail.com
 * E-mail :front-devgmail.com
 * git@flash:BASChain/httpb-plugin.git
 *
 */
'use strict'
const BAS_MODE = "BAS"
const DNS_MODE = "DNS"

angular.module('popupApp',[]).controller('p3Ctrl',['$scope',function($s){
  var storage = chrome.storage.local;
  storage.set({"enable_bas":false})
  $s.mode = BAS_MODE

  storage.get({"enable_bas":false},function(obj){
    //console.log('mode',JSON.stringify(obj,null,2))
    $s.mode = 'v0.0.4'
    $s.$apply()
  })

/*  $s.chanageMode = function(){
    storage.get({"enable_bas":false},function(obj) {
      storage.set({"enable_bas" : !obj["enable_bas"] })
      $s.mode = (!obj["enable_bas"]) ? BAS_MODE : DNS_MODE
      //console.log('>>>',$s.mode)
      $s.$apply();
    })
  }*/
}]);