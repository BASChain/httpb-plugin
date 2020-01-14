/**
 *     ____  ___   _____
 *    / __ )/   | / ___/
 *   / __  / /| | \__ \
 *  / /_/ / ___ |___/ /
 * /_____/_/  |_/____/
 *
 * Copyright (c) 2020 BAS,bas-devteam@gmail.com
 * E-mail :front-devgmail.com
 * git@flash:BASChain/httpb-plugin.git
 *
 */
'use strict'

const pkgJson = require('./package.json'),
  projectJson = require('./.config/project.json'),
  assign = require('lodash.assign'),
  browserify = require('browserify'),
  buffer = require('vinyl-buffer'),
  chmod = require('gulp-chmod'),
  DateFormat = require('fast-date-format'),
  del = require('del'),
  dotenv = require('dotenv'),
  envify = require('envify/custom'),
  gulp = require('gulp'),
  gutil = require('gulp-util'),
  jsoneditor = require('gulp-json-editor'),
  livereload = require('gulp-livereload'),
  merge = require('gulp-merge-json'),
  path = require('path'),
  pify = require('pify'),
  rename = require('gulp-rename'),
  shell = require('shelljs'),
  source = require('vinyl-source-stream'),
  sourcemaps = require('gulp-sourcemaps'),
  terser = require('gulp-terser-js'),
  watch = require('gulp-watch'),
  watchify = require('watchify'),
  zip = require('gulp-zip')

const endOfStream = pify(require('end-of-stream'))

/* ==================== Global Constants Defined ======================  */

const envArgs = dotenv.config({
  path:path.resolve(process.cwd(),'.config/.env'),
  encoding:'utf8'
})

if(envArgs.error){
  throw envArgs.error
}

// env checked end



const liveOpts = {
  port:36489
}

const gulpPaths = Object.assign({
  APP:'addon',
  BUILD:'build',
  DEST:'dist',
  CONFIG:'.config',
  EXTFILE:'version-info.json'
},projectJson)

const browserPlatforms = [
  'firefox'
]
const commonPlatforms = [...browserPlatforms]
/* ==================== Common Contants Defined ======================  */
const ExtInfoFile = () =>{
  return `${gulpPaths.CONFIG}/${gulpPaths.EXTFILE}`
}

const ExtInfoDest = () => {
  return `${gulpPaths.SRC}/scripts/runtime/`
}

const NodeEnv = ()=> {
  return process.env.NODE_ENV ||'development'
}

const GetTarget = () => {
  return process.env.DEST_TARGET || 'firefox'
}

const GetAuthor = () => {
  return process.env.EXT_AUTHOR || pkgJson.author || ''
}

const IsPreRelease = ()=>{
  return NodeEnv() == 'development'
}

const ExtName = () => {
  return process.env.EXT_NAME || pkgJson.name
}

const ExtVersion = () => {
  return process.env.EXT_VER || pkgJson.version
}

const GetCopySrc = (subPaths) => {
  return subPaths ? `${gulpPaths.APP}/${subPaths}/` : `${gulpPaths.APP}/`
}

const BuildTargets = (subPaths) => {
  let destTargets = [...browserPlatforms]
  return destTargets.map(target => subPaths ? `${gulpPaths.BUILD}/${target}/${subPaths}` : `${gulpPaths.BUILD}/${target}/`)
}

const ModuleJsSrc = (subpath,name) => {
  let rootDir = gulpPaths.SRC
  if(typeof subpath === 'string'){
    rootDir = `${gulpPaths.SRC}/${subpath}`
  }
  return `${rootDir}/${name}.js`
}



var dateFormat = new DateFormat('YYDDDD')
if(IsPreRelease()){
  dateFormat = new DateFormat('MMDDDD-HHmm')
}
console.log('CurrentBuildMode:[',NodeEnv(),'],Version:[',ExtVersion(),']')
/* ==================== Early Tasks Defined ======================  */
gulp.task('clean',()=>{
  return del([`${gulpPaths.BUILD}/**`])
})

gulp.task('dev:reload',function() {
  livereload.listen(liveOpts)
})


/* ----------------- Edit ExtInfo ------------------------ */
gulp.task('set:extinfo',() =>{
  const _src = ExtInfoFile()
  return gulp.src(_src)
    .pipe(jsoneditor((json) =>{
      //console.log(JSON.stringify(json));
      return editExtInfo(json)
    }))
    .pipe(rename('info.json'))

    .pipe(gulp.dest(ExtInfoDest(),{overwrite:true}))
})

function editExtInfo(json){
  if(typeof json === undefined){
    json = {}
  }
  json.version = ExtVersion()
  json.buildTag = dateFormat.format(new Date())
  if(GetAuthor())json.author = GetAuthor()
  return json
}
/* ----------------- Edit ExtInfo END ------------------------ */


//Copy Tasks Begin
const copyTasksNames = []
const copyDevTasksNames = []

createCopyTask('locales',{
  source:GetCopySrc('_locales'),
  pattern:'**/*.json',
  destinations:BuildTargets('_locales')
})

createCopyTask('icons',{
  source:GetCopySrc('icons'),
  destinations:BuildTargets('icons')
})

createCopyTask('images',{
  source:GetCopySrc('images'),
  destinations:BuildTargets('images')
})

createCopyTask('css',{
  source:GetCopySrc('css'),
  destinations:BuildTargets('css')
})

createCopyTask('vendor',{
  source:GetCopySrc('vendor'),
  destinations:BuildTargets('vendor')
})

createCopyTask('html',{
  source:GetCopySrc(),
  pattern:'**/*.html',
  destinations:BuildTargets()
})

function createCopyTask(label,opts){
  if(typeof opts.devMode === 'undefined')opts.devMode = isDevMode()
  if(!opts.devOnly){
    const copyTaskName = `copy:${label}`
    copyTask(copyTaskName,opts)
    copyTasksNames.push(copyTaskName)
  }

  const copyDevTaskName = `dev:copy:${label}`
  copyTask(copyDevTaskName,opts)

  copyDevTasksNames.push(copyDevTaskName)
}

function copyTask(taskName,opts){
  const source = opts.source
  const destination = opts.destination
  const destinations = opts.destinations || [destination]
  const pattern = opts.pattern || '**/*'
  const devMode = opts.devMode



  return gulp.task(taskName,()=>{
    if(devMode){
      watch(source+pattern, (event) => {
        console.log('Copy watch',event.path)
        livereload.changed(event.path)
        performCopy()
      })
    }

    return performCopy()
  })

  function performCopy() {
    let stream = gulp.src(source+pattern, { base : source })

    destinations.forEach( dest => {
      stream = stream.pipe(gulp.dest(dest,{overwrite:true}))
    })

    return stream
  }
}

//Copy Tasks Begin
/* ------------------------ Bundle JS Begin ------------------------- */
const BuildJsModules = [
  'bglib',
  'p3lib'
]

const BuildJsModulesDestinations = browserPlatforms.map(target => `${gulpPaths.BUILD}/${target}/bundles`)


createTasks4BuildJSModules({
  taskPrefix:"dev:modules:bundle",
  jsModules: BuildJsModules ,
  devMode: isDevMode(),
  destinations:BuildJsModulesDestinations
})

function createTasks4BuildJSModules({
  taskPrefix, jsModules, devMode, destinations, bundleTaskOpts = {}
}) {
  const rootDir = `${gulpPaths.SRC}`

  bundleTaskOpts = Object.assign({
    devMode,
    sourceMapDir:'../sourcemaps',
    watch:isDevMode(),
    buildSourceMaps:!isDevMode(),
    minifyBuild:!isDevMode()
  },bundleTaskOpts)

  let subTasks = []

  BuildJsModules.forEach((modu) => {
    const label = `${taskPrefix}:${modu}`

    gulp.task(label,createTasks4Module(Object.assign({
      label:label,
      filename:`${modu}.js`,
      filepath:ModuleJsSrc('scripts',modu),
      destinations
    },bundleTaskOpts)))

    subTasks.push(label)
  })

  gulp.task(taskPrefix,gulp.parallel(...subTasks))
}


function createTasks4Module(opts) {
  const suffix = getBundleSuffix(opts.devMode)

  let bundler
  //console.log('<<<<',JSON.stringify(opts,null,2))
  return performBundle

  function performBundle() {
    if(!bundler){
      bundler = generateBrowserify(opts,performBundle)
      bundler.on('log',gutil.log)
    }

    let buildStream = bundler.bundle()

    buildStream.on('error',(err) => {
      beep()
      if(opts.watch) {
        console.warn(err.stack)
      }else{
        throw err
      }
    })

    buildStream = buildStream
      .pipe(source(opts.filename))
      .pipe(buffer())

    if(opts.buildSourceMaps){
      buildStream = buildStream
        .pipe(sourcemaps.init({loadMaps:true}))
    }

    if(opts.minifyBuild){
      buildStream = buildStream
        .pipe(terser({
          mangle:{
            reserved:['BAS','Basxer']
          }
        }))
    }

    buildStream = buildStream
      .pipe(rename({extname:suffix}))

    if(opts.buildSourceMaps) {
      if(opts.devMode) {
        buildStream = buildStream.pipe(sourcemaps.write())
      }else{
        buildStream = buildStream
          .pipe(sourcemaps.write(opts.sourceMapDir))
      }
    }

    opts.destinations.forEach( (dest) => {
      buildStream = buildStream.pipe(gulp.dest(dest))
    })

    return buildStream
  }
}

function generateBrowserify(opts,performBundle){
  const browerifyOpts = assign({},watchify.args,{
    plugin:[],
    transform:[],
    debug:opts.buildSourceMaps,
    entries:opts.filepath
  })

  let b = browserify(browerifyOpts)
    .transform('babelify')
    .transform('brfs')

  b.transform(envify({
    NODE_ENV:NodeEnv()
  }),{
    global:true
  })
  //console.log('>>>>>>>>>>>>>>>>>>',JSON.stringify(opts,null,2))
  if(opts.watch) {
    b = watchify(b)

    b.on('update',async (ids) => {
      const stream = performBundle()
      await endOfStream(stream)
      console.log('changed',ids)
      livereload.changed(`${ids}`)
    })
  }

  return b
}

/* ------------------------ Bundle JS End ------------------------- */
/* ------------------------ Mainfest Begin ------------------------- */

createCopyMergeManifestTask(commonPlatforms);

function createCopyMergeManifestTask(platforms) {

  const targets = platforms || commonPlatforms
  //console.log('>>>>>>>>>>>>>>>>>>',targets)
  targets.map(target => {
    let opts = {
      "devMode": isDevMode()
    }
    opts.src = `${gulpPaths.SRC}/${target}.manifest.json`
    opts.dest = BuildTargets()
    opts.target = target

    const label =  `manifest:merge:${target}`
    copyTasksNames.push(label)
    mergeManifestTask(label,opts);

    const devLabel =  `dev:manifest:merge:${target}`
    copyDevTasksNames.push(devLabel)
    mergeManifestTask(devLabel,opts);

  })
}

function mergeManifestTask(taskName,opts) {
  const commonSrc = `${gulpPaths.SRC}/common.manifest.json`
  let devMode = opts.devMode || isDevMode()


  return gulp.task(taskName,function () {
    return gulp.src([
      commonSrc,
      opts.src
    ])
    .pipe(merge())
    .pipe(rename('manifest.json'))
    .pipe(jsoneditor((json) => {
      json = ManifestEditor(json,opts.target,devMode)
      return json
    }))
    .pipe(gulp.dest(opts.dest,{overwrite:true}))
  })
}

function ManifestEditor(json,target,devMode){
  json.version = ExtVersion()
  if(GetAuthor())json.author = GetAuthor()

  const suffix = getBundleSuffix(devMode)
  const libs = BuildJsModules
    .filter(name => /^bg.*$/g.test(name))
    .map(filename => `bundles/${filename}${suffix}`)

  if(libs.length){
    if(!json.background) json.background = {}
    if(json.background.page) delete json.background.page

    json.background.scripts =
      json.background.scripts ? [...libs,...json.background.scripts] : [...libs]
  }

  switch (target) {
    case 'firefox':

      return json
/*    case 'chromium':
      if(isDevMode()) json.permissions = [...json.permissions,'developerPrivate']
      return json*/
    default:
      return json
  }

}
/* ------------------------ Mainfest End ------------------------- */


/* ==================== Latest Tasks Defined ======================  */
gulp.task('watch',async function(){
  livereload.listen(liveOpts)
})

gulp.task('dev:copy',
  gulp.series(gulp.parallel(...copyDevTasksNames))
)

gulp.task('copy',
  gulp.series(gulp.parallel(...copyTasksNames))
)

gulp.task('build:extension',
  gulp.series(
    'clean',
    'set:extinfo',
    gulp.parallel(
      'dev:modules:bundle',
      'copy'
    )
  )
)

gulp.task('dev:extension',
  gulp.series(
    'clean',
    'set:extinfo',
    gulp.parallel(
      'dev:modules:bundle',
      'dev:copy'
    ),
    'watch'
  )
)

gulp.task('default',gulp.series(TaskDefaultName()))


/* ------------------------ Common functions ------------------------- */
function getBundleSuffix(devMode){
  return devMode ? '-bundle.js' : '.min.js'
}

function TaskDefaultName() {
  return 'dev:extension'
}

function isDevMode(){
  return NodeEnv() == 'development'
}

function beep() {
  process.stdout.write('\x07')
}