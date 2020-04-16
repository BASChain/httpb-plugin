const Networks = require('./networks.js')
const StorageHelper = require('./storage.js')

function  getNetwork(chainId) {
  if(typeof chainId === 'undefined')chainId = 3;
  let nw = Networks.find(item => item.chainId === parseInt(chainId) && item.enabled )
  if(!nw)nw = Networks.find(3)

  return nw
}

module.exports ={
  Networks,
  getNetwork,
  StorageHelper
}