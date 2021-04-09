const { src, dest, parallel, series, watch } = require('gulp');
const browserSync = require('browser-sync').create();
const concat = require('gulp-concat');
const uglify = require('gulp-uglify-es').default;
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const cleancss = require('gulp-clean-css');
const imagemin = require('gulp-imagemin');
const newer = require('gulp-newer');
const del = require('del');
var gulp = require("gulp");
var babel = require("gulp-babel");

function browsersync() {
	browserSync.init({
		server: { baseDir: 'app/' },
		notify: false,
		online: true
	})
}

function scripts() {
	return src([
		'app/js/app.js'
	])
		.pipe(babel({
			presets: ["@babel/preset-env"]
		}))
		.pipe(concat('app.min.js'))
		.pipe(uglify())
		.pipe(dest('app/js/'))
		.pipe(browserSync.stream())
}

function styles() {
	return src([
		'app/sass/main.scss'
	])
		.pipe(sass())
		.pipe(concat('app.min.css'))
		.pipe(autoprefixer({ overrideBrowserslist: [">0.1%"], grid: true }))
		.pipe(cleancss(({ level: { 1: { specialComents: 0 } }/*, format: 'beautify'*/ })))
		.pipe(dest('app/css/'))
		.pipe(browserSync.stream())
}

function images() {
	return src('app/images/src/**/*')
		.pipe(newer('app/images/dest/'))
		.pipe(imagemin())
		.pipe(dest('app/images/dest/'))
}

function cleanimg() {
	return del('app/images/dest/**/*', { force: true })
}

function cleandist() {
	return del('dist/**/*', { force: true })
}

function buildCopy() {
	return src([
		'app/css/**/*.min.css',
		'app/js/**/*.min.js',
		'app/images/dest/**/*',
		'app/fonts/**/*',
		'app/**/*.html',
	], { base: 'app' })
		.pipe(dest('dist'));
}

function startwatch() {
	watch(['app/sass/*.scss', 'app/sass/*.css'], styles);
	watch(['app/**/*.js', '!app/**/*.min.js'], scripts);
	watch('app/**/*.html').on('change', browserSync.reload);
	watch('app/images/src/**/*', images);
}

exports.browsersync = browsersync;
exports.scripts = scripts;
exports.styles = styles;
exports.images = images;
exports.cleandist = cleandist;
exports.cleanimg = cleanimg;
exports.build = series(cleandist, styles, scripts, images, buildCopy);

exports.default = parallel(styles, scripts, browsersync, startwatch);

