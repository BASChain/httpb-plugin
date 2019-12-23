const path = pkgJson = require('./package.json'),
  projectJson = require('./.config/project.json')

const NAME = process.env.PUB_NAME || pkgJson.name || "basexer"

const verSuffix = pkgJson.version && pkgJson.version.split('.').length>0 ? pkgJson.version.split('.').join('_') : "1_0_0"
const BROWSER_TARGET = process.env.DEST_TARGET ||'firefox'
console.log(NAME,'>>>',BROWSER_TARGET)
const WebExtConfig = {
  verbose:true,
  sourceDir:`${projectJson.BUILD}/${NAME}_${verSuffix}_${BROWSER_TARGET}`,
  artifactsDir:`${projectJson.DEST}/${BROWSER_TARGET}`,
  run:{
    browserConsole:true
  },
  build:{
    overwriteDest: true
  }
}

module.exports = WebExtConfig