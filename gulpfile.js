const gulp = require("gulp")

const fs = require('fs');
const path = require('path');

const pdf = require('html-pdf');

const browserSync = require('browser-sync').create()
const reload = browserSync.reload

const pug = require('gulp-pug')
const plumber = require('gulp-plumber')

const sass = require('gulp-sass')
const autoprefixer = require('gulp-autoprefixer')
const minifyCSS = require('gulp-minify-css')
const filter = require('gulp-filter')

const rollup = require('rollup')
const babel = require('rollup-plugin-babel')
const uglify = require('rollup-plugin-uglify')
const jsx = require('rollup-plugin-jsx')

const clean = require('gulp-clean')

const NODE_ENV = process.env.NODE_ENV

/**
 * 常用变量设置
 */
const sassSrc = ["./src/css/main.scss", "./src/css/pdf.scss"]
const cssDest = "./dist/css"

const jsSrc = "./src/js/main.js"
const jsDest = "./dist/js"

const pugSrc = "./src/pug/*.pug"
const pugDest = "./dist"

const pdfHtmlSrc = "./dist/index.html"
const pdfSrc = "./dist/resume.pdf"

/**
 * Set Dev And Production Mode
 */
gulp.task('default', ['dev'])

gulp.task('dev', ['pug', 'sass', 'js', 'dev-server'], () => {
    console.info("Start Development!");

    // listen the change of your file
    gulp.watch('src/pug/**/*.pug', ['pug-watch'])
    gulp.watch('src/css/**/*.scss', ['sass'])
    gulp.watch('src/js/**/*.js', ['js-watch'])

})

gulp.task('prod', ['pug', 'sass', 'js'], () => {
    // gulp.src(["./dist/pdf.html", "./dist/css/pdf.css"])
    //     .pipe(clean());
})

/**
 * Watch Task
 */
gulp.task('pug-watch', ['pug'], () => {
    reload();
})

gulp.task('js-watch', ['js'], () => {
    reload();
})


/**
 * pug Compile
 */
gulp.task('pug', () => {
    console.info("start compile pug");
    console.info("NODE_ENV ===", NODE_ENV);

    return gulp.src(pugSrc)
        .pipe(plumber())
        .pipe(pug({}))
        .pipe(gulp.dest(pugDest))
})

/**
 * Sass Compile
 */

// the supported browser list for less compile
const devBroswerList = ['> 1%', 'last 2 versions', 'Firefox >= 20']
const publishBroswerList = ['> 1%', 'last 2 versions', 'Firefox >= 20']



gulp.task('sass', () => {
    console.info("start compile sass");
    console.info("NODE_ENV ===", NODE_ENV);

    if (NODE_ENV === "development") {
        return gulp.src(sassSrc)
            .pipe(sass({ sourcemap: true }).on('error', sass.logError))
            .pipe(autoprefixer({
                browsers: devBroswerList
            }))
            .pipe(gulp.dest(cssDest))
            .pipe(filter('**/*.css'))
            .pipe(reload({ stream: true }))

    } else {
        return gulp.src(sassSrc)
            .pipe(sass().on('error', sass.logError))
            .pipe(autoprefixer({
                browsers: publishBroswerList
            }))
            .pipe(minifyCSS())
            .pipe(gulp.dest(cssDest))
    }

});


/**
 * Js Compile through rollup
 */


gulp.task('js', () => {
    console.info("start compile js");
    console.info("NODE_ENV ===", NODE_ENV);

    return rollup.rollup({
        entry: jsSrc,
        plugins: [
            babel(),
            (NODE_ENV === 'production' && uglify()),
        ]
    }).then(function (bundle) {
        bundle.write({
            format: "umd",
            moduleName: "library",
            dest: jsDest + "/main.js",
            sourceMap: (NODE_ENV === "development")
        });
    })
});


/**
 * Clean Every thing generated
 */
gulp.task('clean', () => {
    gulp.src([cssDest, jsDest, "./dist/*.html"])
        .pipe(clean());
})


/**
 * BrowserSync Dev Server
 */
gulp.task('dev-server', () => {

    // 静态文件服务器
    browserSync.init({
        server: {
            baseDir: "./dist"
        }
    })
})


/**
 * TODO 生成pdf相关
 */
console.log(path.resolve(__dirname, "./dist"))
const options = {
    format: 'Letter',
    "header": {
        "height": "45mm",
        "contents": '<div style="text-align: center;">@Created By Maoyiwei</div>'
    },
    base: "file:///" + path.resolve(__dirname, "./dist")
};

gulp.task('pdf', () => {
    const html = fs.readFileSync(pdfHtmlSrc, 'utf8');

    pdf.create(html, options).toFile(pdfSrc, function (err, res) {
        if (err) return console.log(err);
        console.log(res);
    });
})

