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

angular.module('popupOptsApp',[]).controller('PopupCtrl',['$scope',function($s) {
  var storage = chrome.storage.local;
  storage.set({disabled: true});

  storage.get({disabled:false},function(obj) {
    console.log("get>>>>",obj);
    $s.disabled = obj.disabled;
    $s.$apply();
  });

  $s.toggleDisabled = function() {
    console.log('set before',$s.disabled)
    storage.get({disabled:false},function(obj) {
      console.log('set after',obj)
      storage.set({disabled: !obj.disabled});
      $s.disabled = !obj.disabled;
      $s.$apply();
    });
  }

  console.log('init>>',$s.disabled)
  $s.disabled = false
  storage.get({logging:false},function(obj){
    $s.logging = obj.logging;
    $s.$apply();
  });

  $s.toggleLogging = function() {
    storage.get({logging:false},function(obj){
      storage.set({logging:!obj.logging});
      $s.logging = !obj.logging;
      $s.$apply();
    });
  }

  $s.enableNotifications = false;

  storage.get({enableNotifications:false},function(obj){
    $s.enableNotifications = obj.enableNotifications;
    $s.$apply();
  });

  $s.toggleNotifications = function() {
    storage.get({enableNotifications:false},function(obj){
      storage.set({enableNotifications: !obj.enableNotifications});
      $s.enableNotifications = !obj.enableNotifications;
      $s.apply();
    });
  }

}]);