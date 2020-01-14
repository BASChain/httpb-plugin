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
console.log('CurrentBuildMode:[',NodeEnv(),'],Version:[',ExtVersion(),']')

var dateFormat = new DateFormat('YYDDDD')
if(isPreRelease()){
  dateFormat = new DateFormat('MMDDDD-HHmm')
}

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

/* ==================== Early Tasks Defined ======================  */
gulp.task('clean',()=>{
  return del([`${gulpPaths.build}/*`])
})

gulp.task('dev:reload',()=>{
  livereload.listen(liveOpts)
})

/* ----------------- Edit ExtInfo ------------------------ */
gulp.task('set:extinfo',() =>{
  const _src = ExtInfoFile()
  const _dest = ExtInfoDest()

  return gulp.src(_src)
    .pipe(jsoneditor((json) =>{

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
}
/* ----------------- Edit ExtInfo ------------------------ */


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
  if(typeof opts.devMode === undefined)opts.devMode = isDevMode()
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



/* ==================== Latest Tasks Defined ======================  */
gulp.task('default',gulp.series(TaskDefaultName()))


const TaskDefaultName = () => {
  return 'set:extinfo'
}
/* ==================== Common Methods Defined ======================  */
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

const isPreRelease = ()=>{
  return NodeEnv() == 'development'
}

const isDevMode = ()=>{
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