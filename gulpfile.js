/// <binding AfterBuild='bundle_html' />
/* @preserve
  (c) 2019 lytical, inc. all rights are reserved.
  lytical(r) is a registered trademark of lytical, inc.
  please refer to your license agreement on the use of this file.
*/

const _cp = require('child_process');
const _del = require('del');
const _fs = require('fs');
const _path = require('path');
const gulp = require('gulp');
const del = require('del');
const pump = require('pump');
const uglify = require('gulp-uglify-es').default;

const bundle_file_nm = 'cli/html.js';
const target_dir = 'bin';

function clean() {
  return _del([bundle_file_nm, target_dir + '/**/*']);
}

function copy() {
  return gulp.src([
    'node/config.json',
    '**/*.md',
    '**/package.json',
    '**/*.ico',
    '**/*.png',
    '**/*.jpg',
    '**/*.css',
    '**/index.html',
    '!**/node_modules/**',
    '!**/bin/**',
    '!**/dist/**',
    '!**/obj/**'])
    .pipe(gulp.dest(target_dir));
}

function minify() {
  return new Promise((res, rej) => {
    pump(
      gulp.src([target_dir + '/**/*.js']),
      uglify({ mangle: { keep_fnames: true }, output: { comments: 'some' } }),
      gulp.dest(target_dir),
      function(err) {
        if(err) {
          rej(err);
        }
        else {
          res();
        }
      });
  });
}

function predeploy() {
  return del([
    target_dir + '/**/*.map',
    target_dir + '/**/*.dll',
    target_dir + '/tsconfig.tsbuildinfo'
  ]);
}

function get_html_files(pfx, dir, next, err, done) {
  let cnt = 0;
  _fs.readdir(dir, { withFileTypes: true }, (e, paths) => {
    if(e) {
      err(e);
    }
    else {
      for(let path of paths) {
        if(path.isFile()) {
          let p = _path.parse(path.name);
          if(p.ext === '.html') {
            next(pfx + p.name + p.ext);
          }
        }
        else if(path.isDirectory() && path.name !== 'node_modules') {
          ++cnt;
          get_html_files(
            pfx + path.name + '/',
            dir + '/' + path.name,
            next,
            err,
            () => {
              if(--cnt === 0) {
                done();
              }
            });
        }
      }
      if(cnt === 0) {
        done();
      }
    }
  });
}

function bundle_html() {
  return new Promise((res, rej) => {
    let js = 'define([';
    let is_1st = true;
    get_html_files(
      'text!',
      'cli',
      path => {
        if(is_1st) {
          is_1st = false;
          js += '\'' + path + '\'';
        }
        else {
          js += ',\'' + path + '\'';
        }
      },
      rej,
      () => {
        js += '],function(){});';
        _fs.writeFile(bundle_file_nm, js, err => {
          if(err) {
            rej(err);
          }
          else {
            _cp.exec('node node_modules/requirejs/bin/r.js -o name=html paths.text=node_modules/requirejs-text/text out=' +
              target_dir +
              '/cli/html.js baseUrl=cli',
              (err, stdout, stdin) => {
              console.info(stdout);
              console.info(stdin);
              _fs.unlink(bundle_file_nm, err1 => {
                if(err || err1) {
                  rej(err || err1);
                }
                else {
                  res();
                }
              });
            });
          }
        });
      });
  });
}

exports.copy = gulp.parallel(copy, bundle_html);
exports.bundle_html = bundle_html;
exports.clean = clean;
exports.minify = minify;
exports.predeploy = predeploy;
exports.deploy = gulp.series(predeploy, exports.copy, minify);