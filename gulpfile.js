const gulp = require('gulp');
const babel = require('gulp-babel');
const git = require('gulp-git')
const replace = require('gulp-replace');
const sourcemaps = require('gulp-sourcemaps');
runSequence = require('run-sequence');
const del = require('del');

var gitHash;

gulp.task('clean-debug', function() {
    del.sync(['build/debug']);
});

gulp.task('clean-release', function() {
    del.sync(['build/release']);
});

gulp.task('hash', function(cb) {
    return git.revParse({args:'--short HEAD'}, function(err, hash) {
        gitHash = hash;
        cb();
    });
});

gulp.task('build-debug', ['clean-debug'], () =>
    gulp.src('src/**/*.js')
        .pipe(sourcemaps.init())
        .pipe(babel())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('lib'))
);

gulp.task('build-release', ['clean-release'], () =>
    gulp.src('src/**/*.js')
        .pipe(babel())
        .pipe(gulp.dest('build/release/lib'))
);

gulp.task('prep-config', ['hash'], function() {
    return gulp.src('config.json')
        .pipe(replace('$GITHASH$', gitHash))
        .pipe(replace('9001', '8080'))
        .pipe(gulp.dest('build/release'));
});

gulp.task('copy-index', () =>
    gulp.src('index.js')
        .pipe(gulp.dest('build/release'))
);

gulp.task('copy-package', () =>
    gulp.src('package.json')
        .pipe(gulp.dest('build/release'))
);

gulp.task('release', function (callback) {
    runSequence(
        'build-release',
        'copy-index',
        'copy-package',
        'prep-config',
        function (error) {
            if (error) {
                console.log(error.message);
            } else {
                console.log('RELEASE FINISHED SUCCESSFULLY');
            }
            callback(error);
        });
});