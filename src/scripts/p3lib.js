//const Web3 = require('web3')
const browser = require('webextension-polyfill')
global.$ = global.jQuery = require('jquery')

const { Info , BrowerInfo , BindThisProperties } = require('./runtime')
const {
  Networks,
  getNetwork,
  StorageHelper
} = require('./utils')

class P3Ctx {
  constructor(browser){
    BindThisProperties.call(this,Info)
    this.BwInfo = new BrowerInfo()
    this.runtime = browser.runtime
    this.Storage = StorageHelper
    this.networks = Networks
    console.log('load P3');
  }

  network(chainId){
    return getNetwork(chainId)
  }
}

global.p3ctx = new P3Ctx(window.browser||'')