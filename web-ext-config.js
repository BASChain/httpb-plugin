const pkgJson = require('./package.json'),
  projectJson = require('./.config/project.json'),
  DateFormat = require('fast-date-format'),
  dotenv = require('dotenv'),
  path = require('path')

const envArgs = dotenv.config({
  path:path.resolve(process.cwd(),'.config/.env'),
  encoding:'utf8'
})

if(envArgs.error){
  throw envArgs.error
}

const gulpPaths = Object.assign({
  APP:'addon',
  BUILD:'build',
  DEST:'dist',
  CONFIG:'.config',
  EXTFILE:'version-info.json'
},projectJson)

const verSuffix = pkgJson.version && pkgJson.version.split('.').length>0 ? pkgJson.version.split('.').join('_') : "1_0_0"
const BROWSER_TARGET = process.env.DEST_TARGET ||'firefox'

const SourceDir = (target) => {
  return `${gulpPaths.BUILD}/${target}`
}

const ArtifactsDir = (target) => {
  return `${gulpPaths.DEST}/${target}`
}

const Target = getTarget()

const WebExtConfig = {
  verbose:true,
  sourceDir:`${gulpPaths.BUILD}/${Target}`,
  artifactsDir:`${gulpPaths.DEST}/${Target}`,
  run:{

  },
  build:{
    overwriteDest: true
  }
}



function getExtName(){
  return process.env.EXT_NAME || pkgJson.name ||"basexer"
}

function getTarget(){
  return process.env.DEST_TARGET || 'firefox'
}

function getExtVersion(){
  return process.env.EXT_VER || pkgJson.version
}

module.exports = WebExtConfig