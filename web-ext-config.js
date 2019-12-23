const pkgJson = require('./package.json')

const ExtensionName = pkgJson.name ||'basexer'
var pkgPathName = ExtensionName

if(pkgJson.version && pkgJson.version.split('.').length>0){
  pkgPathName = pkgPathName + '_' + pkgJson.version.split('.').join('_')
}

module.exports = {
  verbose: true,
  build: {
    overwriteDest: true
  },
  run: {

  },
  artifactsDir:"dist/firefox",
  sourceDir: `build/${pkgPathName}_firefox`
}