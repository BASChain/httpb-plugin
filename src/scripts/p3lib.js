//const Web3 = require('web3')
const browser = require('webextension-polyfill')

const { Info , BrowerInfo , BindThisProperties } = require('./runtime')

class P3Ctx {
  constructor(browser){
    BindThisProperties.call(this,Info)
    this.BwInfo = new BrowerInfo()
    this.runtime = browser.runtime
    console.log('load P3');
  }
}

global.P3Ctx = window.P3Ctx = new P3Ctx(browser);