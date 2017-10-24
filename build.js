var fs = require('fs')
var path = require('path')
var mkdirp = require('mkdirp')
var browserify = require('browserify')
var html = require('bel')
var colors = require('colors')
// var tinyify = require('tinyify')
var exorcist = require('exorcist')
var minify = require('html-minifier').minify
var concat = require('concat-stream')

var b = browserify({debug: true})
var entry = 'index.js'
var basedir = path.dirname(entry)
var outdir = path.join(basedir, 'dist')
var mapfile  = path.join(outdir, 'bundle.js.map')
var concatStream = concat(gotBundle)

function gotBundle (buf) {
  fs.writeFile(path.join(outdir, 'bundle.js'), buf, () => {
    console.log('create bundle.js'.green)
  })
}

mkdirp(outdir, () => {
  b.add(entry)
   .transform('sheetify', { use: [ 'sheetify-inline', 'sheetify-cssnext' ] })
   .plugin('css-extract', { out: path.join(outdir, 'bundle.css') })
// .plugin('tinyify')
   .bundle()
   .pipe(exorcist(mapfile))
   .pipe(concatStream)

  console.log('create bundle.css'.green)

  var indexHtml = html`
    <!doctype html>
    <html lang="en" dir="ltr">
    <head>
      <title>choo-scriber</title>
      <link rel="stylesheet" href="bundle.css">
      <meta charset="utf-8">
    </head>
    <body>
      <div></div>
      <script src="bundle.js"></script>
    </body>
    </html>
  `

  fs.writeFile(path.join(outdir, 'index.html'), minify(indexHtml, {collapseWhitespace: true}), () => {
    console.log('create index.html'.green)
  })
})
