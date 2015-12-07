import gulp from 'gulp';
import util from 'gulp-util';
import browserSync from 'browser-sync';
import webpack from 'webpack';
import deploy from 'gulp-gh-pages';
import webpackConfig from './webpack.config.js';

gulp.task('default', () => {
    gulp.start('webpack');
    gulp.start('watch', 'browser-sync');
});

gulp.task('browser-sync', () => {
    browserSync({
        server: {
            baseDir: 'public'
        }
    });
});

const execWebpack = (config) => {
    return webpack(config, (err, stats) => {
        if (err) {
            throw new util.PluginError('execWebpack', err);
        }

        return util.log('[execWebpack]', stats.toString({colors: true}));
    });
};

gulp.task('webpack', (callback) => {
    execWebpack(webpackConfig);
    return callback();
});

gulp.task('watch', () => {
    gulp.watch(
        ['./public/js/index.js', './lib/*.js', './test/*.js'],
        ['webpack']
    );
    gulp.watch(
        ['index.html', 'js/app.bundle.js', 'css/index.css'],
        {cwd: 'public'},
        browserSync.reload
    );
});

gulp.task('deploy', () => {
    return gulp.src('./public/**/*').pipe(deploy());
});
