"use strict";

import "core-js/es6/promise";
import glob from "glob";
import { readFile, writeFile } from "fs";
import postcss from "postcss";
import cssImport from "postcss-import";
import cssnext from "postcss-cssnext";
import uncss from "uncss";
import cssnano from "cssnano";
import denodeify from "denodeify";
import { red } from "chalk";

const readFileAsync = denodeify(readFile);
const writeFileAsync = denodeify(writeFile);
const globAsync = denodeify(glob);
const uncssAsync = denodeify(uncss);

// const uncssIgnores = [
//   /\.modal(\-.*)?/,
//   /\.fade/,
//   /\.in/,
//   /\.es(m|p)/
// ];

export default function css(opts = {}) {
  return readFileAsync(opts.entry, "utf8")
  .then(css =>
    postcss([cssImport, cssnext]).process(css, {
      from: opts.entry,
      to: opts.out
    })
  )
  .then(result => result.css)
  .then(css => opts.uncss ? globAsync(opts.templates)
    .then(files => opts.minify ? uncssAsync([opts.index].concat(files), {
      ignore: opts.uncssRegex,
      raw: css,
      ignoreSheets: [opts.ignore]
    }) : css)
  : css)
  .then(css => opts.minify ? cssnano.process(css) : {css})
  .then(css => Promise.all([
    writeFileAsync(opts.out, css.css),
    opts.sourcemap ? writeFileAsync(`${opts.out}.map`, css.map) : Promise.resolve()
  ]).then(() => ({bytes: css.css.length})))
  .catch(e => {
    console.log(`\nCSS Error: ${red(e.message)}`);
  })
  .then(res => Object.assign({}, res, opts));
}
