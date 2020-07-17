'use strict'

//const DEF_DOH_DOMAIN = 'http://mdns.baschain.org:8053/dns-query?name=nbs'
const TRA_TYPE = 10
const TRA_DATA = "TraditionSystemName"
const ALIAS_DATA = "AliasName"
const Networks = require('../utils/networks.js')

const IsIPv4OrIPv6 = (ip) => {
  return /^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$|^([\da-fA-F]{1,4}:){6}((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$|^::([\da-fA-F]{1,4}:){0,4}((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$|^([\da-fA-F]{1,4}:):([\da-fA-F]{1,4}:){0,3}((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$|^([\da-fA-F]{1,4}:){2}:([\da-fA-F]{1,4}:){0,2}((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$|^([\da-fA-F]{1,4}:){3}:([\da-fA-F]{1,4}:){0,1}((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$|^([\da-fA-F]{1,4}:){4}:((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$|^([\da-fA-F]{1,4}:){7}[\da-fA-F]{1,4}$|^:((:[\da-fA-F]{1,4}){1,6}|:)$|^[\da-fA-F]{1,4}:((:[\da-fA-F]{1,4}){1,5}|:)$|^([\da-fA-F]{1,4}:){2}((:[\da-fA-F]{1,4}){1,4}|:)$|^([\da-fA-F]{1,4}:){3}((:[\da-fA-F]{1,4}){1,3}|:)$|^([\da-fA-F]{1,4}:){4}((:[\da-fA-F]{1,4}){1,2}|:)$|^([\da-fA-F]{1,4}:){5}:([\da-fA-F]{1,4})?$|^([\da-fA-F]{1,4}:){6}:$/.test(ip)
}
class DohHandler {
  constructor(opts){
    _initDohHandler.call(this,opts)
  }

  getQueryUrl (alias){
    //punycode transfer
    const dnsQuery = `${this.QSchema}://${this.QDomain}:${this.QPort}/dns-query?name=`
    console.log('DNSQuery>>>',dnsQuery)
    return dnsQuery + alias
  }

  getQueryUrlByNW(alias,chainId){

  }

  setQDomain(chainId){
    if(!chainId)chainId = 3
    let nw = Networks.find(item => item.chainId === parseInt(chainId) && item.enabled)
    if(!nw) nw = Networks.find(item => item.chainId === 3 && item.enabled)

    this.QDomain = nw.dns
  }

  getNetwork(chainId){
    let nw = Networks.find(item => item.chainId === parseInt(chainId) && item.enabled)
    if(!nw) nw = Networks.find(item => item.chainId === 3 && item.enabled)

    return nw
  }

  parseData(json) {
    if(!json || json.Status != 0)return false

    let origin = QuestionName(json.Question[0].name.toString())

    if(!json.Answer) return false;

    let answer = json.Answer
    if(isAliasName(answer)){
      return tradDomainDot(answer[0].data)
    }

    let tradResults = json.Answer.filter(item => IsTraditionDomain(item))
    if(tradResults.length > 0){
      return origin
    }

    let resultArr = json.Answer.filter(item => IsIPv4OrIPv6(item.data))
    if(resultArr.length==0)return false

    return resultArr[0].data
  }
}



function isAliasName(answer){
  if(!answer || !answer.length)return false;

  return answer.find(item => item.type == 10 && item.data.startsWith(ALIAS_DATA)) ? true : false
}

const QuestionName = (name) => {
  return name.endsWith('.') ? name.substring(0,name.length-1) : name
}

const IsTraditionDomain = (item) => {
  return item && item.type == TRA_TYPE && item.data.startsWith(TRA_DATA)
}

/**
 * trim end dot : test. => test
 * @param {*} name
 */
const tradDomainDot = (name) => {
  if (name === undefined) return ''
  return name.endsWith('.') ? name.substring(0, name.length - 1) : name
}

function _initDohHandler(opts){
  this.QSchema = 'http'
  this.QDomain = 'extr.baschain.cn'
  this.QPort = 8053
  this.QPreUri = `${this.QSchema}://${this.QDomain}:${this.QPort}/dns-query?name=`
  this.isMatch = (ip) =>{return IPv46Regex.test(ip)}
}



module.exports = DohHandler