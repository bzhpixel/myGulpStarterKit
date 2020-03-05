"use strict";
const gulp = require('gulp');
const del = require('del');
const inject = require('gulp-inject');
const webserver = require('gulp-webserver');
const htmlclean = require('gulp-htmlclean');
const cleanCSS = require('gulp-clean-css');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const imagemin = require("gulp-imagemin");
const newer = require("gulp-newer");

const paths = {
    src: 'src/**/*',
    srcHTML: 'src/**/*.html',
    srcCSS: 'src/**/*.css',
    srcJS: 'src/**/*.js',

	tmp: 'tmp',
    tmpIndex: 'tmp/index.html',
    tmpCSS: 'tmp/**/*.css',
    tmpJS: 'tmp/**/*.js',

    dist: 'dist',
    distIndex: 'dist/index.html',
    distCSS: 'dist/**/*.css',
    distJS: 'dist/**/*.js'
};

/**
 * DEVELOPMENT
 */
function htmlFun(){
    return (gulp.src(paths.srcHTML)
        .pipe(gulp.dest(paths.tmp)
        ));
}

function cssFun(){
    return gulp.src(paths.srcCSS).pipe(gulp.dest(paths.tmp));
}

function jsFun(){
    return gulp.src(paths.srcJS).pipe(gulp.dest(paths.tmp));
}

// Optimize Images
function images() {
    return gulp
      .src(paths.src)
      //.pipe(newer(paths.tmp+'/img'))
      .pipe(
        imagemin([
          imagemin.gifsicle({ interlaced: true }),
          imagemin.mozjpeg({ progressive: true }),
          imagemin.optipng({ optimizationLevel: 5 }),
          imagemin.svgo({
            plugins: [
              {
                removeViewBox: false,
                collapseGroups: true
              }
            ]
          })
        ])
      )
      .pipe(gulp.dest(paths.tmp));
  }


function injectFun(){
    let css = gulp.src(paths.tmpCSS);
    let js = gulp.src(paths.tmpJS);
    return gulp.src(paths.tmpIndex)
      .pipe(inject( css, { relative:true } ))
      .pipe(inject( js, { relative:true } ))
      .pipe(gulp.dest(paths.tmp));
}

function server(){
    return gulp.src(paths.tmp)
    .pipe(webserver({
      port: 3000,
            livereload: true,
            open:true
    }));
}

function watchFiles(){
    gulp.watch(paths.src, gulp.series(copy,injectFun));
}
/**
 * DEVELOPMENT END
 */



/**
 * PRODUCTION
 */
function distHtml(){
    return gulp.src(paths.srcHTML)
    .pipe(htmlclean())
    .pipe(gulp.dest(paths.dist));
}

function distCss(){
    return gulp.src(paths.srcCSS)
    .pipe(concat('style.min.css'))
    .pipe(cleanCSS())
    .pipe(gulp.dest(paths.dist+'/css'));
}

function distJs(){
    return gulp.src(paths.srcJS)
    .pipe(concat('script.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest(paths.dist+'/js'));
}

function distImages() {
    return gulp
      .src(paths.src)
      .pipe(newer(paths.dist+'/img'))
      .pipe(
        imagemin([
          imagemin.gifsicle({ interlaced: true }),
          imagemin.mozjpeg({ progressive: true }),
          imagemin.optipng({ optimizationLevel: 5 }),
          imagemin.svgo({
            plugins: [
              {
                removeViewBox: false,
                collapseGroups: true
              }
            ]
          })
        ])
      )
      .pipe(gulp.dest(paths.dist));
  }

function distInject(){
    var css = gulp.src(paths.distCSS);
    var js = gulp.src(paths.distJS);
    return gulp.src(paths.distIndex)
      .pipe(inject( css, { relative:true } ))
      .pipe(inject( js, { relative:true } ))
      .pipe(gulp.dest(paths.dist));
}


/*
gulp.task('html:dist', function () {

});
gulp.task('css:dist', function () {

});
gulp.task('js:dist', function () {

});
gulp.task('copy:dist', ['html:dist', 'css:dist', 'js:dist']);
gulp.task('inject:dist', ['copy:dist'], function () {

});
gulp.task('build', ['inject:dist']);
*/
/**
 * PRODUCTION END
 */

function clean(){
    return del([paths.tmp, paths.dist]);
}




const html = gulp.series(htmlFun);
const css = gulp.series(cssFun);
const js = gulp.series(jsFun);
const copy = gulp.parallel(html, css, js, images);
const inject2 = gulp.series(copy, injectFun);
const serve = gulp.parallel(inject2, server);
const watch =gulp.series(copy,gulp.parallel(watchFiles, serve));

const copyDist = gulp.series(distHtml, distJs, distCss, distImages);

const build = gulp.series(copyDist, distInject);


exports.html = html;
exports.clean = clean;
exports.js = js;
exports.css = css;
exports.copy = copy;
exports.inject = inject2;
exports.serve = serve;
exports.watch = watch;
exports.default = gulp.series(copy, watch);
exports.build = build;