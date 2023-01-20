const { dest, parallel, series, src, watch } = require('gulp');

const browserSync = require('browser-sync').create();
const exec = require('child_process').exec;
const del = require('del');
const copy = require('gulp-copy');
const frontMatter = require('gulp-front-matter');
const hb = require('gulp-hb');
const rename = require("gulp-rename");
const sass = require('gulp-sass')(require('sass'));

const config = require('./package.json').config;
const data = require('./src/data/global.json');

async function mjml() {
  exec('npm run-script mjml -- --config.minify=' + config.mjml.minify.toString());

  await Promise.resolve();
}

async function serve() {
  browserSync.init({
    port: config.browserSync.port,
    server: {
      baseDir: config.paths.dist,
      directory: config.browserSync.server.directory.toString()
    },
    ui: {
      port: config.browserSync.port++
    }
  });

  await Promise.resolve();
}

async function sync() {
  browserSync.reload();

  await Promise.resolve();
}

function assets() {
  del(config.paths.dist + '/img/*');

  return src(config.paths.src + '/assets/img/*')
  .pipe(copy(config.paths.dist, {
    prefix: 2
  }));
}

function clearDist() {
  return del([
    config.paths.dist + '/*',
    '!' + config.paths.dist + '/.gitkeep'
  ]);
}

function clearTmp() {
  return del([
    config.paths.tmp + '/*',
    '!' + config.paths.tmp + '/.gitkeep'
  ]);
}

function handlebars() {
  return src(config.paths.src + '/layouts/*.mjml')
  .pipe(frontMatter({
    property: 'data.frontMatter'
  }))
  .pipe(hb()
  .data(config.paths.src + '/data/*.json')
  .data(data)
  .helpers(config.paths.src + '/helpers/*.js')
  .partials(config.paths.src + '/assets/css/*hbs')
  .partials(config.paths.src + '/partials/*.hbs'))
  .pipe(dest(config.paths.tmp));
}

function css() {
  return src(config.paths.src + '/assets/scss/**/*.scss')
  .pipe(sass({ includePaths: 'node_modules' })
  .on('error', sass.logError))
  .pipe(rename((path) => {
    path.extname += '.hbs'
  }))
  .pipe(dest(config.paths.src + '/assets/css'));
}

function watchDist() {
  watch(config.paths.dist + '/**/*').on('all', () => {
    sync();
  });
}

function watchSrc() {
  watch(config.paths.src + '/**/*.(hbs|mjml)', series(clearTmp, handlebars));
  watch(config.paths.src + '/assets/scss/**/*', css);
  watch(config.paths.src + '/assets/img/*', assets);
}

function watchTmp() {
  watch(config.paths.tmp + '/**/*.(hbs|mjml)', mjml);
}

exports.default = series(clearDist, clearTmp, css, parallel(assets, handlebars), mjml, serve, parallel(watchDist, watchSrc, watchTmp));
