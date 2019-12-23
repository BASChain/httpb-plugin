const webExt =require('web-ext').default
const pkgJson = require('./package.json')

const ExtensionName = pkgJson.name ||'basexer'
var pkgPathName = ExtensionName

if(pkgJson.version && pkgJson.version.split('.').length>0){
  pkgPathName = pkgPathName + '_' + pkgJson.version.split('.').join('_')
}