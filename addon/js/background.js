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
// Remark
// global Web3
// CommonUtils [base64,puncode,Basum,UriParser,web3Utils]


/* load workflow */
'use strict'
log.enabled =true
var storageArea = chrome.storage.local
const NoFoundDNSURL = chrome.runtime.getURL('dns-nofound.html')
const BASIP = "104.238.165.23"
var BasWeb3 = null,BasManager = null,UriParser = null;


initBasEns()

/* load workflow end */

function log(msg){
  if(log.enabled){
    console.log("Basexer Debugger",msg);
  }
}

/**
 * @DateTime 2019-12-19
 * @return   {[type]}   [description]
 */
async function initBasEns(){
  if(!chrome.runtime || !Web3 || !CommonUtils){
    log('no chrome.runtime please check permissions')
    return;
  }

  let Basum = CommonUtils.Basum,
  _ManagerContract = CommonUtils.Basum.Manager,
  _UriParser = CommonUtils.UriParser,
  _opts,_provideUrl,
  _web3;

  try{
    _provideUrl = Basum.getHttpsURI(Basum.projectId)
    _opts = Basum.getContractOps()
    _web3 = await new Web3(new Web3.providers.HttpProvider(_provideUrl))

    chrome.runtime.web3 = BasWeb3 = _web3;
    chrome.runtime.UriParser = UriParser =  _UriParser

    chrome.runtime.BasManager = BasManager = await new BasWeb3.eth.Contract(_ManagerContract.abi,_ManagerContract.address,_opts)

    chrome.runtime.BasEnabled = true
    setupHttbRedirectListener()
    log('initial Web3 contract completed.')
  }catch(e){
    log("load BAS err:"+e.message)
  }
}

async function reloadBasEns(){
  let Basum = CommonUtils.Basum,
  _ManagerContract = CommonUtils.Basum.Manager,
  _UriParser = CommonUtils.UriParser,
  _opts,_provideUrl,
  _web3;

  try{
    if(!chrome.runtime.web3 ||!BasWeb3){
       _provideUrl = Basum.getHttpsURI(Basum.projectId)
      _opts = Basum.getContractOps()
      _web3 = await new Web3(new Web3.providers.HttpProvider(_provideUrl))
      chrome.runtime.web3 = BasWeb3 = _web3;
    }

    if(!chrome.runtime.UriParser ||!UriParser){
      chrome.runtime.UriParser = UriParser = _UriParser
    }

    if(!chrome.runtime.BasManager || !BasManager){
      chrome.runtime.BasManager = BasManager = await new BasWeb3.eth.Contract(_ManagerContract.abi,_ManagerContract.address,_opts)
    }

    log('reload completed.')
  }catch(e){
    log("load BAS err:"+e.message)
  }
}

const promisity = (inner) =>
  new Promise((resolve,reject) => {
    inner((err,data) => {
      if(!err){
        resolve(data)
      }else{
        reject(err)
      }
    })
  });



function queryBasDNS(alias) {

  if(!chrome.runtime.BasManager){
    log('no BasManager')
    return
  }
  chrome.runtime.BasManager.methods.querystring(alias).call((err,data) => {
    if(!err){
      log(JSON.stringify(data))
    }else{
      log("Query BAS DNS:"+err.message)
    }
  })
}



/**
 * @DateTime 2019-12-02
 */
function monitorChanges(changes,namespace) {
  if(changes.disabled){
    console.log('changed>>>',changes.disabled)
    if(changes.disabled.newValue == true){
      log('Disabling extension,remove BAS listener.')
     // chrome.webRequest.onBeforeRequest.removeListener(checkRedirects);
    }else{
      log('Activing extension,add BAS listener.')
    }
  }

  if(changes.logging) {
    log('Logging settings have changed.')
    updateLogging()
  }
}

chrome.storage.onChanged.addListener(monitorChanges)

/* ========================== Icon start ================================ */
function setIcon(state) {
  //bas-disabled-19.png
  //bas-active-19.png
  var data = {
    path: {
      "19":`icons/png/${state}-19.png`,
      "38":`icons/png/${state}-38.png`,
    }
  }

  chrome.browserAction.setIcon(data,()=>{
    let err = chrome.runtime.lastError
    if(err)
      log('ERROR:',err.message)
  })
}

function updateIconState(){
  chrome.storage.local.get({disabled:false},function(obj){
    setIcon(obj.disabled ? 'bas-disabled':'bas-active')
  })
}
updateIconState()//first load
/* ========================== Icon end ================================ */


function setupHttbRedirectListener(){
   chrome.webRequest.onBeforeRequest.removeListener(checkRedirects)
   console.log('registing monitor')
   let filter = createFilter();
   //chrome "extraHeaders"
   //,"requestBody"
   chrome.webRequest.onBeforeRequest.addListener(checkRedirects, filter, ["blocking"]);
}


/* ========================== Logging start ================================ */
function updateLogging() {
  chrome.storage.local.get({logging:false},function(obj){
    log.enabled = obj.logging
  })
}
updateLogging()//first load

/* ========================== Logging end ================================ */

function createFilter(){
  return {
    urls:[
      "https://*/*",
      "http://*/*"
    ],
    types:['main_frame']
  }
}

var requestId = ""

async function checkRedirects(details) {
  console.log(JSON.stringify(details,null,2))

  let BlockingResponse = {}
  if(details.method != 'GET')return BlockingResponse;
  if(!BasManager || !UriParser ){
    await reloadBasEns()
  }

  try{
    let UriParserInst = new UriParser(BasManager);
    let basJson = UriParserInst.handleURL2Details(details)


    if(basJson && basJson.isHttb){
      let alias = CommonUtils.punycode.toASCII(basJson.bas.alias)
      let queryDNSData = await promisity(cb => BasManager.methods.queryByString(alias).call(cb))

      if(queryDNSData && typeof queryDNSData === 'object' && Object.keys(queryDNSData).length >5 ){
        let json = CommonUtils.Basum.parseBas(queryDNSData)
        if(json.bastype == 'IP'){
          let ip = json.ipv4 || json.net.isIPv6()
          //TODO cache
          basJson = UriParser.handleRedirectUrl(basJson,ip)
        }
      }
      console.log("BasDns>>>")
      console.log(JSON.stringify(basJson,null,2))
      if(basJson.redirectUrl){

        BlockingResponse.redirectUrl = basJson.redirectUrl
        console.log('>>>>',basJson.redirectUrl)
        return {redirectUrl:basJson.redirectUrl}
      }

    }
    console.log(JSON.stringify(BlockingResponse,null,2))

  }catch(e){
    log("Redirect Handler Error:"+e.message)
    //TODO force err
  }
  return BlockingResponse
}

/* ====================== runtime startup ========================== */
chrome.runtime.onStartup.addListener(handleStartup)

async function handleStartup(){
  console.log('>>>extension startup...')
  updateIconState()

}