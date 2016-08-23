"use strict";

import "core-js/es6/promise";
import "core-js/fn/object/assign";
import { watch } from "graceful-fs";
import denodeify from "denodeify";
import { writeFile } from "fs";
import { dirname, join } from "path";
import { server } from "superstatic";
import { red } from "chalk";
import prettyBytes from "pretty-bytes";
import rc from "rc";

import javascript from "./javascript";
import css from "./css";
import serve from "./serve";

const writeFileAsync = denodeify(writeFile);

let watcher = {
  close() {}
};

export function run(program = {}) {
  const processes = [];
  const conf = rc("polyamorous", {
    public: "public",
    src: {
      js: "src/js/entry.js",
      css: "src/css/entry.css",
      sw: "src/serviceworkers/cache.sw.js"
    },
    dest: {
      js: "dist/bundle.js",
      css: "dist/styles.css",
      sw: "sw.js"
    },
    uncss: false,
    uncssRegex: [],
    port: 8080,
    host: "0.0.0.0",
    debug: false
  });

  if(program.watch) {
    if(program.serve) {
      serve(conf)
      .then(args => {
        program.log(`Serving at ${args.host}:${args.port}`);
      })
      .catch(e => {
        program.log("Error serving:", e);
      });
    }
    program.onquit(() => {
      watcher.close();
    });
  }

  if(program.all || program.javascript) {
    processes.push(javascript({
      entry: join(program.cwd, conf.src.js),
      minify: program.minify,
      out: join(program.cwd, conf.public, conf.dest.js)
    })
    .catch(e => {
      program.log("Error Building Javascript", e);
    })
    .then(opts => {
      if(program.watch) {
        watchFileType(Object.assign({}, opts, {
          prettyName: "Javascript",
          build: javascript
        }));
      } else {
        program.log(`Built Javascript: ${prettyBytes(opts.bytes)}`);
      }
      return opts;
    }));
  }

  if(program.all || program.serviceworkers) {
    processes.push(javascript({
      entry: join(program.cwd, conf.src.sw),
      minify: program.minify,
      out: join(program.cwd, conf.public, conf.dest.sw)
    })
    .catch(e => {
      program.log("Error Building Service Workers", e);
    })
    .then(opts => {
      if(program.watch) {
        watchFileType(Object.assign({}, opts, {
          prettyName: "Service Workers",
          build: javascript
        }));
      } else {
        program.log(`Built Service Workers: ${prettyBytes(opts.bytes)}`);
      }
      return opts;
    }));
  }

  if(program.all || program.css) {
    processes.push(css({
      entry: join(program.cwd, conf.src.css),
      out: join(program.cwd, conf.public, conf.dest.css),
      templates: join(process.cwd(), dirname(conf.src.js), "**", "*.html"),
      public: join(process.cwd(), conf.public, "index.html"),
      index: join(process.cwd(), conf.public, "index.html"),
      minify: program.minify,
      uncss: conf.uncss,
      uncssRegex: conf.uncssRegex,
      ignore: conf.dest.css
    })
    .catch(e => {
      program.log("Error Building CSS:", e);
    })
    .then(opts => {
      if(program.watch) {
        watchFileType(Object.assign({}, opts, {
          prettyName: "CSS",
          build: css
        }));
      } else {
        program.log(`Built CSS: ${prettyBytes(opts.bytes)}`);
      }
      return opts;
    }));
  }

  return Promise.all(processes);

  function watchFileType(opts = {}) {
    watcher = watch(opts.strictWatch || dirname(opts.entry), {
      persistent: true,
      recursive: true
    }, (event, filename) => {
      program.building && program.building(opts);
      opts.build(opts)
      .then(() => {
        program.goodWatch && program.goodWatch(opts);
      })
      .catch(e => {
        program.badWatch && program.badWatch(e, opts);
      });
    });
  }
}
