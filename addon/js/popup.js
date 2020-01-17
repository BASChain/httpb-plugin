/**
 *     ____  ___   _____
 *    / __ )/   | / ___/
 *   / __  / /| | \__ \
 *  / /_/ / ___ |___/ /
 * /_____/_/  |_/____/
 *
 * Copyright (c) 2019 BAS,bas-devteam@gmail.com
 * E-mail :bas-ext@gmail.com
 * git@flash:BASChain/httpb-plugin.git
 *
 */
'use strict'
angular.module('popupApp', []).controller('PopupCtrl', ['$scope', function($s) {
  var storage = chrome.storage.local;
  $s.extVersion = getVersion()
  $s.extName = getName()
}]);

function getVersion(){
  let v = '0.0.5';
  if(browser&&browser.runtime){
    v = browser.runtime.getManifest().version
  }
  return v
}

function getName(){
  let n = 'BAS'
  if(browser&&browser.runtime){
    n = browser.runtime.getManifest().name
  }
  return n
}