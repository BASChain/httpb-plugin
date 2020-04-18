/**
 *     ____  ___   _____
 *    / __ )/   | / ___/
 *   / __  / /| | \__ \
 *  / /_/ / ___ |___/ /
 * /_____/_/  |_/____/
 *
 * Copyright (c) 2019 BAS,bas-devteam@gmail.com
 * E-mail :bas-ext@gmail.com
 * git@bas:BASChain/httpb-plugin.git
 *
 */
'use strict'
angular.module('popupApp', []).controller('PopupCtrl', ['$scope', function($s) {
  var storage = chrome.storage.local;
  $s.extVersion = getVersion()
  $s.extName = getName()
  $s.networks = getNetworks()
  //$s.chainId = $s.networks[0].value

  storage.get({chainId:''},function(obj){
    console.log('get from storage',obj)
    $s.chainId = obj.chainId || $s.networks[0].value
    $s.$apply()
  })

  // if(!$s.chainId){
  //   $s.chainId = 3;
  //   storage.set({chainId:3})
  // }

  //$s.chainId = 3;

  $s.networkChange = function() {
    const network = $s.chainId
    console.log('Current:',network)
    //p3ctx.Storage.set('chainId',network)
    storage.get({chainId:network},function(obj){
      storage.set({chainId:network})
      $s.chainId = network;
      $s.$apply()
    })
  }
  //const chainId = p3ctx.Storage.get('chainId') ||$s.networks[1].value
  //$s.selectChainId = chainId

}]);
function getNetworks(){
  return [
    {value:1,name:"Mainnet",i18n:"mainnet"},
    {value:3,name:"Ropsten",i18n:"ropsten"}
  ]
}

function getVersion(){
  let v = '0.1.1';
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