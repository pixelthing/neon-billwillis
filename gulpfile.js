const fs                = require('fs');
const open              = require('opener');
const path              = require('path');
const gulp              = require('gulp');
const jshint            = require('gulp-jshint');
const sass              = require('gulp-sass');
const sourcemaps        = require('gulp-sourcemaps');
const browserify        = require('browserify');
const vinylSource       = require('vinyl-source-stream');
const buffer            = require('vinyl-buffer');
const del               = require('del');
const watchify          = require('watchify');
const runSequence       = require('run-sequence');
const plumber           = require('gulp-plumber');
const mustache          = require('gulp-mustache');
const gutil             = require('gulp-util');
const gulpif            = require('gulp-if');
const cssmin            = require('gulp-cssmin');
const rename            = require('gulp-rename');
const forEach           = require('gulp-foreach');
const postcss           = require('gulp-postcss');
const concat            = require('gulp-concat');
const eventStream       = require('event-stream');
const svgstore          = require('gulp-svgstore');
const svgmin            = require('gulp-svgmin');
const inject            = require('gulp-inject');
const compression       = require('compression');
const merge             = require('lodash.merge');
const autoprefixer      = require('autoprefixer');
const mkdirp            = require('mkdirp');
const express           = require('express');
const reload            = require('express-reload');
const uglify            = require('gulp-uglify');
const pump              = require('pump');

// store our default options here.
var options = {
    dev: true,
    root: 'dist',
    devServer: {
        port: 3000,
        ui: 8002,
        weinre: 9092
    },
    autoprefixer: {
        browsers: ['last 2 versions','iOS > 6','not Android <= 4.4'],
        remove: false
    }
};

function errorHandler(err) {
    console.log(err.toString());
    this.emit('end');
}

/**
 * Task: default
 * builds the website, launches a dev-server and start watching for changes. We've removed the pattern library build for speed.
 */
gulp.task('default', function() {
    runSequence(['cleanDist'],['buildFull', 'serve', 'watchAll']);
});

/**
 * Task: prod
 * just like default, but creates a different folder with uglified, cssminified and compressed files.
 */
gulp.task('prod', function() {
    options.dev = false;
    options.root = 'prod';
    runSequence(['cleanProd'],['buildFull', 'serve', 'watchAll']);
});

/**
 * Task: watch tasks
 * all the watches, collected into one task
 */
gulp.task('watchAll', function() {
    gulp.watch(['src/*/**/*.scss'], ['styles']);
    gulp.watch(['src/**/*.js'], ['jshint']); // note: we use watchify for the js
    gulp.watch(['src/static/**/*'], ['copyImgs','copyIcons','copyjsExtra',]);
    gulp.watch(['src/modules/**/static/**/*'], ['copyModuleStatic']);
    //gulp.watch(['src/static/js-es6/sw.js'], ['copySW']);
    gulp.watch(['src/static/js/**/*.js'], ['scriptsStatic', 'pages']);
    gulp.watch(['src/static/**/*.svg'], ['svgstore', 'pages']);
    gulp.watch(['src/**/*.mustache', 'src-pages/**/*.mustache', 'src/**/*.json', 'src-pages/**/*.json'], ['pages']);
    gulp.watch(['src/*.html'], ['copyRoot']);
});

/**
 * Task: clean
 * removes the dist folder
 */
gulp.task('cleanDist', del.bind(null, 'dist', { dot: true }));



/**
 * Task: clean
 * removes the dist folder
 */
gulp.task('cleanProd', del.bind(null, 'prod', { dot: true }));



/**
 * Task: build
 * build a site. simple... innit.
 */
gulp.task('build', function() {
    runSequence([
        'copyImgs',
        'copyMovs',
        'copyIcons',
        'copyJsExtra',
        'copyRoot',
        'copyFlickity',
        'pages',
        'svgstore',
        'scripts',
        'scriptsStatic',
        'styles'
    ]);
});
gulp.task('buildFull', function() {
    runSequence([
        'copyImgs',
        'copyIcons',
        'copyJsExtra',
        'copyRoot',
        'copyFlickity',
        'pages',
        'svgstore',
        'scripts',
        'scriptsStatic',
        'styles'
    ]);
});

gulp.task('copyIcons', () => gulp
    .src('src/static/icons/*')
    .pipe(gulp.dest(options.root + '/static/icons')));
    
gulp.task('copyImgs', () => gulp
    .src('src/static/imgs/*')
    .pipe(gulp.dest(options.root + '/static/imgs')));
    
gulp.task('copyJsExtra', () => gulp
    .src('src/static/js-e6/*')
    .pipe(gulp.dest(options.root + '/static/js-e6')));
    
gulp.task('copyMovs', () => gulp
    .src('src/static/movs/*')
    .pipe(gulp.dest(options.root + '/static/movs')));

gulp.task('copyRoot', () => gulp
    .src('src/*.html')
    .pipe(gulp.dest(options.root + '/')));

gulp.task('copyFlickity', () => gulp
    .src('node_modules/flickity/dist/flickity.pkgd.min.js')
    .pipe(gulp.dest(options.root + '/static/js')));


/**
 * Task: pages
 * builds the pages to the output folder
 */
gulp.task('pages', function() {
    let streams = [''].map((site) => {
        // for now, we just use one json file for all the data,
        // if we need something smarter like reading a file matching the template name
        // we can create that later.
        var dataPath = require.resolve(`./src-pages/data.json`);
        // delete the cache, since we don't want to restart gulp whenever
        // we change the data.
        delete require.cache[dataPath];
        let globalData = require(dataPath);

        return gulp
            .src(`src-pages/${site}/**/*.mustache`)
            .pipe(plumber({ errorHandler }))
            .pipe(forEach((stream, file) => {
                
                // parent parent directory data
                var dir2DataPath = path.resolve(path.dirname(file.path),'../../') + '/data.json';
                let dir2Data = {};
                try {
                    delete require.cache[dir2DataPath];
                    dir2Data = require(dir2DataPath);
                }
                catch(e) {}
                
                // parent directory data
                var dir1DataPath = path.resolve(path.dirname(file.path),'../') + '/data.json';
                let dir1Data = {};
                try {
                    delete require.cache[dir1DataPath];
                    dir1Data = require(dir1DataPath);
                }
                catch(e) {}

                // this directory data
                var dir0DataPath = path.dirname(file.path) + '/data.json';
                let dir0Data = {};
                try {
                    delete require.cache[dir0DataPath];
                    dir0Data = require(dir0DataPath);
                }
                catch(e) {}

                // template data
                var fileDataPath = path.format({
                    dir: path.dirname(file.path),
                    name: path.basename(file.path, '.mustache'),
                    ext: '.json'
                });
                let templateData = {};
                try {
                    delete require.cache[fileDataPath];
                    templateData = require(fileDataPath);
                }
                catch(e) {}

                return stream.pipe(mustache(merge({}, globalData, dir2Data, dir1Data, dir0Data, templateData), { extension: '.html' }));
            }))
            .pipe(gulp.dest(`./` + options.root + `/${site}`));
    });
    return eventStream
        .merge(streams);
});



/**
 * Task: scripts
 * handles processing of our scritps.
 */
gulp.task('scripts', ['verify-static', 'jshint'], function() {

    let bundles = [
        'src/index.js'
    ];

    // define our bundle
    let bundleCreator = browserify({
        entries: bundles,
        cache: {},
        packageCache: {},
        paths: ['./src']
    })
    .transform('babelify', {
        presets: ['env']
    })
    .plugin('factor-bundle', {
        outputs: bundles.map((file) => path.join('./' + options.root + '/static/', path.basename(file)))
    });
    bundleCreator = watchify(bundleCreator);
    bundleCreator.on('update', update);

    // function that bundles
    function bundleBuild() {
        return bundleCreator
            .bundle()
                .on('error', ( error ) => {
                    console.error( error.toString() );
                })
            .pipe(vinylSource('shared.js'))
            .pipe(buffer())
            .pipe(sourcemaps.init())
            .pipe(gulpif(!options.dev, uglify()))
            .pipe(sourcemaps.write('./', { sourceRoot: '/src' }))
            .pipe(gulp.dest('./' + options.root + '/static'));
    }

    // whenever the bundle changes reload the browser
    // and print a message
    function update() {
        const start = Date.now();
        bundleBuild().on('end', () => {
            gutil.log(`Updating '${gutil.colors.cyan('scripts')}' took ${gutil.colors.magenta((Date.now() - start) + 'ms')}`);
        })
    }

    return bundleBuild();
});



/**
 * Task: scripts
 * uglifies static scripts
 */
gulp.task('scriptsStatic', ['copyStatic'], function (cb) {
    pump([
            gulp.src( ['src/static/js/**/*.js', '!src/shared.js']),
            //uglify(),
            gulp.dest(options.root + '/static/js')
        ],
        cb
    );
});



/**
 * Task: verify-static
 * this is just a really dumb task that verifies that
 * the folder "dist/static" exists. A plugin in browserify "factor-bundle"
 * requires it.
 */
gulp.task('verify-static', (done) => mkdirp(path.resolve('./' + options.root + '/static'), done));



/**
 * Task: jshint
 * runs jshint on our javascript files
 */
gulp.task('jshint', function() {
    gulp
        .src(['src/**/*.js'])
        .pipe(plumber({ errorHandler }))
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'));
});



/**
 * Task: styles
 * builds the styles using sass and autoprefixer
 */
gulp.task('styles', function() {
    gulp
        .src([
            'src/shared.scss',
            'src/**/*.output.scss'
        ])
        .pipe(plumber({ errorHandler }))
        .pipe(sourcemaps.init())
        .pipe(sass())
        .pipe(postcss([ autoprefixer(options.autoprefixer) ]))
        .pipe(rename(function (path) {
            path.basename = path.basename.replace(".output","");
        }))
        .pipe(gulpif(!options.dev, cssmin()))
        .pipe(sourcemaps.write('./', { sourceRoot: '/src' }))
        .pipe(gulp.dest('./' + options.root + '/static')); // ONLY NON-BROWSERSYNC
});



/**
 * Task: svgstore
 * take a folder of svgs and create one minified sprite sheet out of it
 */
gulp.task('svgstore', function () {
    function fileContents (filePath, file) {
        return file.contents.toString();
    }

    var svgs = gulp
        .src('./src/static/icons/sprites/*.svg')
        .pipe(svgmin(function (file) {
            var prefix = path.basename(file.relative, path.extname(file.relative));
            return {
                plugins: [{
                    cleanupIDs: {
                        prefix: prefix + '-',
                        minify: true
                    }
                }]
            };
        }))
        .pipe(svgstore({ inlineSvg: true }));

    return gulp
        .src('./src/partials/svg-icons.mustache')
        .pipe(inject(svgs, { transform: fileContents }))
        .pipe(rename({
            suffix: "-ready"
        }))
        .pipe(gulp.dest('./src/partials'));
});



/**
 * Task: express server
 */
let  app = null;
gulp.task('serve', function() {
    function shouldCompress (req, res) {
        // if in dev - don't compress
        if (options.dev) {
            return false;
        }
        // don't compress responses with this request header
        if (req.headers['x-no-compression']) {
            return false;
        }
        // fallback to standard filter function
        return compression.filter(req, res)
    }
    app = express();
    //app.all('/customer-service', (req, res) => {
    //    if (req.query.question) {
    //        return res.sendFile(path.resolve(__dirname, './' + options.root + '/Kundservice/fraga-och-svar.html'));
    //    }
    //    return res.sendFile(path.resolve(__dirname, './' + options.root + '/Kundservice/index.html'));
    //});
    app.use(compression({filter: shouldCompress}));
    app.use(express.static(options.root));
    app.use(function(req, res, next) {
        console.log('GET ' + req.originalUrl)
        console.log('At %d', Date.now());
        next();
    });
    //app.use(function(req, res, next) {
    //    if(req.accepts('html') && res.status(404)) {
    //        //res.render('404.html');
    //        //res.redirect('404.html')
    //        return;
    //    }
    //});
    app.listen(3000, () => console.log('Server listening at port 3000'));
});

