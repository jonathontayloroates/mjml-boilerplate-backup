const { dest, parallel, series, src, watch } = require('gulp');

const browserSync = require('browser-sync').create();
const exec = require('child_process').exec;
const del = require('del');
const copy = require('gulp-copy');
const hb = require('gulp-hb');

const config = require('./package.json').config;

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
	return src('src/assets/**/*')
		.pipe(copy('dist', {
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
		.pipe(hb()
		.partials(config.paths.src + '/partials/*.hbs')
		.helpers(config.paths.src + '/helpers/*.js')
		.data(config.paths.src + '/data/*.json'))
		.pipe(dest(config.paths.tmp));
}

function watchDist() {
	watch(config.paths.dist + '/*.html').on('add', function() {
		sync();
	});
}

function watchSrc() {
	watch(config.paths.src + '/*/*.(hbs|json|mjml)', series(clearTmp, handlebars));

}

function watchTmp() {
	watch(config.paths.tmp + '/*.mjml', series(clearDist, mjml));
}

exports.default = series(clearDist, clearTmp, parallel(assets, handlebars), mjml, serve, parallel(watchDist, watchSrc, watchTmp));
exports.handlebars = series(clearTmp, handlebars);
exports.mjml = series(clearDist, mjml);
