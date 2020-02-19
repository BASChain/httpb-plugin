const browser = require('webextension-polyfill')
const { createRuntimeInfo } = require('./runtime')
const {  EngineHandler, DohHandler } = require('./parsing-engine')
const punycode = require('punycode')

async function createCompanion(opts){
  const engineHandlerInst = new EngineHandler()
  const dohHandlerInst = new DohHandler()

  try{
    this.runtime = await createRuntimeInfo(browser)
    registingListeners()
    this.state = 'listening on httpb'
  }catch(e){
    this.state = 'stop listening httpb'
    this.lastError = e
    throw e
  }


  function registingListeners() {
    const beforeSendInfoSpec = ['blocking','requestHeaders']
    const requestUrlFilter = { urls: ['http://*/*','https://*/*'],types:['main_frame'] }
    const requestUrlTypesFilter = { urls: ['<all_urls>'] ,types:['main_frame']}

    browser.webRequest.onBeforeRequest.addListener(
      OnBeforeRequest,
      requestUrlTypesFilter,
      ['blocking', "requestBody"]
    )
  }

  async function OnBeforeRequest(details) {
    try{
      console.log('Request>>>'+JSON.stringify(details,null,2))
      console.log('incepterUrl>>>',details.url)
      //console.log(JSON.stringify(details,null,2));
      const searchData = engineHandlerInst.parseUrl(details.url,details.requestId)
      if(!searchData || !searchData.alias ||!searchData.matched) return

      let _alias = punycode.toASCII(searchData.alias)

      let queryURL = dohHandlerInst.getQueryUrl(_alias)

      console.log('BAS-DNSUrl:',dohHandlerInst.QPreUri,_alias);

      const response = await fetch(queryURL)
      //console.log(response);
      if(response.status!=200){
        return
      }
      const dnsJson = await response.json();
      console.log(dnsJson);
      if(dnsJson){
        let aliasOrIp = dohHandlerInst.parseData(dnsJson)
        if(!aliasOrIp)return
        let reURL = engineHandlerInst.buildRedirectUrl(searchData,aliasOrIp)

        if(reURL){
          console.log('BAS-RequestUrl:',reURL);
          return {redirectUrl:reURL}
        }
      }
      return;

    }catch(err){
      throw err.message
      return
    }
  }
}





module.exports.init = createCompanion