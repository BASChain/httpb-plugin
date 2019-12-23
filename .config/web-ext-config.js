const pkgJson = require('../pakage.json')
const projectJson = require('./project.json')

const B_TARGET = process.env.BUILD_TARGET ||'firefox'
console.log(B_TARGET)
const verSuffix = pkgJson.version && pkgJson.version.split('.').length>0 ? pkgJson.version.split('.').join('_') : "1"
const SubPathName = `${pkgJson.name}_${verSuffix}_${B_TARGET}`
const Path = {
  artifactsDir:`${projectJson.BUILD}/${SubPathName}`
}


var WebExtCfg = {
  verbose:true,
  sourceDir:`${projectJson.BUILD}/${SubPathName}`,
  artifactsDir:`${projectJson.DEST}/${B_TARGET}`,
  build:{
    overwriteDest:true
  },
  run:{
    target:""
  }
}

module.exports = WebExtCfg