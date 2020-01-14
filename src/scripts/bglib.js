const $ = require('jquery')

const { Info , BrowerInfo , BindThisProperties } = require('./runtime')

class Basexer {
  constructor(){
    BindThisProperties.call(this,Info)
    this.BwInfo = new BrowerInfo()
  }

  loadCompanion() {

  }
}

global.basexer = new Basexer()