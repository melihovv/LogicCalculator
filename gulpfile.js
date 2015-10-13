var gulp = require('gulp');
var util = require('gulp-util');
var browserSync = require('browser-sync');
var webpack = require("webpack");
var deploy = require('gulp-gh-pages');

var webpackConfig = require("./webpack.config.js");

gulp.task('default', function () {
    gulp.start('watch', 'browser-sync');
});

gulp.task('browser-sync', function () {
    browserSync({
        server: {
            baseDir: 'public'
        }
    });
});

gulp.task('webpack', function (callback) {
    execWebpack(webpackConfig);
    return callback();
});

gulp.task('watch', function () {
    gulp.watch(['./public/js/index.js', './lib/*.js'], ['webpack']);
    gulp.watch(['index.html', 'js/bundle.js', 'css/index.css'], {cwd: 'public'}, browserSync.reload);
});

gulp.task('deploy', function () {
    return gulp.src('./public/**/*')
        .pipe(deploy())
});

var execWebpack = function (config) {
    return webpack(config, function (err, stats) {
        if (err) {
            throw new util.PluginError("execWebpack", err);
        }

        return util.log("[execWebpack]", stats.toString({
            colors: true
        }));
    });
};
