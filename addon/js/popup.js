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
}]);

function getVersion(){
  let v = '0000';
  if(browser&&browser.runtime){
    v = browser.runtime.getManifest().version
  }
  return v
}