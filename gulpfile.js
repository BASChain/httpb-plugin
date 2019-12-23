const gulp = require('gulp'),
  packageJson = require('./package.json'),
  autoprefixer = require('gulp-autoprefixer'),
  cssnano = require('cssnano'),
  del = require("del"),
  buffer = require('vinyl-buffer'),
  gutil = require('gulp-util'),
  gulpMultiProcess = require('gulp-multi-process'),
  livereload = require('gulp-livereload'),
  jsoneditor = require('gulp-json-editor')
  postcss = require('gulp-postcss'),
  sass = require('gulp-sass'),
  source = require('vinyl-source-stream'),
  sourcemaps = require('gulp-sourcemaps'),
  watch = require('gulp-watch'),
  rtlcss = require('gulp-rtlcss'),
  rename = require('gulp-rename'),
  merge = require('gulp-merge-json'),
  endOfStream = require('end-of-stream')

//WebExt
const webExt =require('web-ext').default

const livereloadJson = require('./.config/gulplivereload.json')
const projectJson = require('./.config/project.json')

const gulpPaths = Object.assign({
  TARGET:'firefox',
  BUILD:'./build',
  DEST:'./dist',
  SRC:'src',
  APP:"./addon",
},projectJson)

const browserPlatforms = [
  'firefox',
  'chrome',
]

const commonPlatforms = [
  ...browserPlatforms,
]

function comboTargetDest(){
  return `${gulpPaths.DEST}/${gulpPaths.TARGET}/`
}

function comboTargetBuild(){
  return `${gulpPaths.BUILD}/${gulpPaths.TARGET}/`
}


//Gulp Tasks
const copyTaskNames = []
const copyDevTaskNames = []

var packagePathName = packageJson.name || "basexer"

if(packageJson.version && packageJson.version.split('.').length > 0){
  packagePathName = packagePathName +'_' + packageJson.version.split('.').join('_');
}
console.log(packagePathName)
//add Task
createCopyTasks('locales',{
  source:`${gulpPaths.APP}/_locales/`,
  destinations:commonPlatforms.map(platform => `${gulpPaths.BUILD}/${packagePathName}_${platform}/_locales`)
})

createCopyTasks('icons',{
  source:`${gulpPaths.APP}/icons/`,
  destinations:commonPlatforms.map(platform => `${gulpPaths.BUILD}/${packagePathName}_${platform}/icons`)
})

createCopyTasks('vendor',{
  source:`${gulpPaths.APP}/vendor/`,
  destinations:commonPlatforms.map(platform => `${gulpPaths.BUILD}/${packagePathName}_${platform}/vendor`)
})

createCopyTasks('html',{
  source:`${gulpPaths.APP}/`,
  pattern:'**/*.html',
  devMode:true,
  destinations:commonPlatforms.map(platform => `${gulpPaths.BUILD}/${packagePathName}_${platform}`)
})

createCopyTasks('css',{
  source:`${gulpPaths.APP}/css/`,
  destinations:commonPlatforms.map(platform => `${gulpPaths.BUILD}/${packagePathName}_${platform}/css`)
})

createCopyTasks('js',{
  source:`${gulpPaths.APP}/js/`,
  pattern:'/**/*.js',
  destinations:commonPlatforms.map(platform => `${gulpPaths.BUILD}/${packagePathName}_${platform}/js`)
})



//merge manifest json task
createCopyMergeManifestTask(commonPlatforms)


//execute task setting
gulp.task('dev:copy',
  gulp.series(
    gulp.parallel(...copyDevTaskNames)
  )
)

gulp.task('dev:reload',function() {
  livereload.listen({"port":livereloadJson.livereloadOpts.port||39517})
})

gulp.task('dev:scss',createScssBuildTask({
  src:`${gulpPaths.SRC}/scss/style.scss`,
  dest:`${gulpPaths.APP}/css`,
  pattern:`${gulpPaths.SRC}/scss/**/*.scss`
}))

/**
 *
 * @DateTime 2019-12-11
 * @param    string   label taskName
 * @param    Json Object   opts  [source,destination,destinations,pattern,devMode=false]
 * @return   gulp instance
 */
function createCopyTasks (label, opts) {
  if(!opts.devOnly) {
    const copyTaskName = `copy:${label}`
    copyTask(copyTaskName,opts)
    copyTaskNames.push(copyTaskName)
  }
  const copyDevTaskName = `dev:copy:${label}`
  copyTask(copyDevTaskName,Object.assign({devMode:true},opts))
  copyDevTaskNames.push(copyDevTaskName)
}

function copyTask(taskName,opts){
  const source = opts.source
  const destination = opts.destination
  const destinations = opts.destinations || [destination]
  const pattern = opts.pattern ||'/**/*'
  const devMode = opts.devMode
  //console.log('opts.devMode',opts.devMode)
  return gulp.task(taskName,function() {
    if(devMode){
//      watch(pattern,async (event) => {
//        livereload.changed(event.path);
//      })
    }
    return preformCopy()
  })

  function preformCopy(){
    let stream = gulp.src(source + pattern,{base:source})

    //copy to destinations
    destinations.forEach(function(dest) {
      stream = stream.pipe(gulp.dest(dest))
    })

    return stream
  }
}

/*gulp.task('update:version',function(){
  return gulp.src(`${gulpPaths.SRC}/common.manifest.json`)
    pipe(jsoneditor((json) =>{
      if(packageJson.version)json.version = packageJson.version
      return json
    }))
    .pipe(gulp.dest(`${gulpPaths.SRC}/common.manifest.json`,{overwrite:true}))
})*/

function createCopyMergeManifestTask(platforms) {
  let targets = platforms || commonPlatforms
  targets.map(target => {
    let mergeTaskName = `copy:merge:${target}`
    let opts = {}
    opts.src = `${gulpPaths.SRC}/${target}.manifest.json`
    opts.dest = `${gulpPaths.BUILD}/${packagePathName}_${target}`
    mergeManifestTask(mergeTaskName,opts);
    copyTaskNames.push(mergeTaskName)

    let devMergeTaskName = `dev:copy:merge:${target}`
    mergeManifestTask(devMergeTaskName,opts);
    copyDevTaskNames.push(devMergeTaskName)
  })
}

function mergeManifestTask(taskName,opts) {
  const commonSrc = `${gulpPaths.SRC}/common.manifest.json`

  return gulp.task(taskName,function(){
    return gulp.src([
      commonSrc,
      opts.src
    ]).pipe(merge())
    .pipe(jsoneditor((json) =>{
      //console.log('>>>',JSON.stringify(packageJson))
      if(packageJson.version)json.version = packageJson.version
      if(packageJson.author)json.author = packageJson.author
      return json
    }))
    .pipe(rename('manifest.json'))
    .pipe(gulp.dest(opts.dest,{overwrite:true}))
  })
}

// copy merge manifest





//['src/scss/**/*.scss']
//
function createScssBuildTask ({src,dest,devMode,pattern }){
  return function(){
    if(devMode) {
      watch(pattern,async (event) =>{
        const stream = buildScss()
        await endOfStream(stream)
        console.log(`${event.path}`,'changed')
        livereload.changed(event.path);
      })
      return buildScssWithSourceMaps()
    }
    return buildScss()
  }

  function buildScssWithSourceMaps (){
    return gulp.src(src)
      .pipe(sourcemaps.init())
      .pipe(sass().on('error',sass.logError))
      .pipe(sourcemaps.write())
      .pipe(autoprefixer())
      .pipe(gulp.dest(dest))
      .pipe(rtlcss())
      .pipe(rename({suffix:'-rtl'}))
      .pipe(gulp.dest(dest))
  }

  function buildScss() {
    return gulp.src(src)
      .pipe(sass().on('error',sass.logError))
      .pipe(autoprefixer())
      .pipe(gulp.dest(dest))
      .pipe(rtlcss())
      .pipe(rename({suffix:'-rtl'}))
      .pipe(gulp.dest(dest))
  }
}

function scssTask(){
  return gulp
    .src(`${gulpPaths.SRC}/scss/**/*.scss`)
    .pipe(sourcemaps.init())
    .pipe(sass())
    .on('error',sass.logError)
    .pipe(postcss([autoprefixer(),cssnano()]))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(comboTargetBuild()));
}


//webext build sign
// exports.webextfox =async function BuildFirefoxDestop(){
//   return gulp.task('webext:fox',function(){
//     webExt.cmd.build({
//       overwriteDest: true,
//       sourceDir:`${gulpPaths.BUILD}/${packagePathName}_${target}`,
//       artifactsDir:`${gulpPaths.DEST}/${target}`
//     },{
//       shouldExitProgram: false
//     }).then((extensionRunner) =>{
//       console.log(extensionRunner);
//     })
//   })
// }



gulp.task('clean',function(){
  return del(`${gulpPaths.BUILD}/`)
})

gulp.task('dev:extension',
  gulp.series(
    'clean',
    'dev:scss',
    gulp.parallel(
      'dev:copy',
    )
  )
)

//{ start: true }
//"dev:reload"



exports.style = scssTask;

// ============================
// COMMON
// ============================
function gulpParallel(...args) {
  return function spawnGulpChildProcess(cb) {
    return gulpMultiProcess(args,cb,true)
  }
}

/**
 * Default Gulp Task
 */
gulp.task('default',gulp.series("dev:extension"));