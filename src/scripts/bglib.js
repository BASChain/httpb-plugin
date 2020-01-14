const $ = require('jquery')

const { Info , BrowerInfo , BindThisProperties } = require('./runtime')

const { init } = require('./bas-companion.js')

class Basexer {
  constructor(){
    BindThisProperties.call(this,Info)
    this.BwInfo = new BrowerInfo()
  }

  async loadCompanion() {
    await init.call(this)
  }
}

global.basexer = new Basexer()
global.basexer.loadCompanion()