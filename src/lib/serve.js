"use strict";

import "core-js/es6/promise";
import "core-js/fn/object/assign";
import { server } from "superstatic";

export default function(opts = {}) {
  let args = Object.assign({
    config: {
      public: opts.public
    }
  }, opts);
  return new Promise((resolve, reject) => {
    server(args)
    .listen(err => {
      if(err) {
        reject(err);
      } else {
        resolve(args);
      }
    });
  });
}
