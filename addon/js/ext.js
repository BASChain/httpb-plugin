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
const apis = [
  'alarms',
  'bookmarks',
  'browserAction',
  'commands',
  'contextMenus',
  'cookies',
  'downloads',
  'events',
  'extension',
  'extensionTypes',
  'history',
  'i18n',
  'idle',
  'notifications',
  'pageAction',
  'runtime',
  'storage',
  'tabs',
  'webNavigation',
  'webRequest',
  'windows',
]

function BasexerInit (){
  const _this = this;

  apis.forEach(api =>{
    _this[api] = null

    try{
      if(chrome[api])_this[api] = chrome[api]
    }catch(e){}

    try{
      if(window[api])_this[api]=window[api]
    }catch(e){}

    try{
      if(browser[api])_this[api]=browser[api]
    }catch(e){}

    try{
      _this[api] = browser.extension[api]
    }catch(e){}
  })

  try{
    if(browser && browser.runtime){
      this.runtime = browser.runtime
    }
  }catch(e){}

  try{
    if(browser&&browser.browserAction){
      this.browserAction = browser.browserAction
    }
  }catch(e){}

  console.log('init ext instance')
}

var Basexer = new BasexerInit();