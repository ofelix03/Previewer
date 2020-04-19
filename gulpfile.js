var { src, dest, series } = require("gulp");
var jsmin = require("gulp-jsmin");
var rename = require("gulp-rename");
var cleanCSS = require("gulp-clean-css");

function minifyJS() {
  return src("dist/previewer.js")
    .pipe(jsmin())
    .pipe(rename({ suffix: ".min" }))
    .pipe(dest("dist"));
}

function minifyCSS() {
  return src("src/*.css")
    .pipe(cleanCSS())
    .pipe(rename({ suffix: ".min" }))
    .pipe(dest("dist"));
}

exports.default = series(minifyCSS, minifyJS);
