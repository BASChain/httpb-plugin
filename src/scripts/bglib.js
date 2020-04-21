const $ = require('jquery')

const { Info , BrowerInfo , BindThisProperties } = require('./runtime')

const { init } = require('./bas-companion.js')
const {
  Networks,
  getNetwork,
  StorageHelper
} = require('./utils')

class Basexer {
  constructor(){
    BindThisProperties.call(this,Info)
    this.BwInfo = new BrowerInfo()
    this.networks = Networks
    this.storage = StorageHelper
  }

  async loadCompanion() {
    await init.call(this)
  }

  network(chainId) {
    return getNetwork(chainId)
  }
}

global.basexer = new Basexer()
global.basexer.loadCompanion()