import "core-js/fn/object/assign";
import program from "commander";
import ora from "ora";
import keypress from "keypress";
import clear from "clear";
import { red } from "chalk";

import { run } from "../lib/utils";

program
.option("-m, --minify", "Minify")
.option("-j, --javascript", "Build Javascript")
.option("-c, --css", "Build CSS")
.option("-s, --serviceworkers", "Build Service Workers")
.option("-S, --serve", "Serve")
.option("-d, --deploy", "Deploy")
.option("-a, --all", "All (JS, CSS)")
.option("-w, --watch", "Watch for Changes")
.parse(process.argv);

let restingSpinnerMessage = "Watching: `Q` to quit";
const spinner = ora(restingSpinnerMessage);

if(program.watch) {
  spinner.start();
  keypress(process.stdin);
  process.stdin.on("keypress", (ch, key) => {
    if(key && key.name === "c") {
      spinner.stop();
      clear();
      spinner.start();
    }
  });
}
run(Object.assign({
  cwd: process.cwd(),
  log: console.log
}, program, {
  building(args) {
    spinner.color = "yellow";
    spinner.text = `Building ${args.prettyName}`;
  },
  goodWatch(args) {
    spinner.color = "white";
    spinner.text = restingSpinnerMessage;
  },
  badWatch(e, args) {
    console.log(`\n:: Watch Error: ${e.message}`);
    spinner.color = "red";
    spinner.text = `Error Building ${args.prettyName}`;
  },
  onquit(stopWatching) {
    process.stdin.on("keypress", (ch, key) => {
      if(key && (key.name === "q" || (key.ctrl && key.name === "c"))) {
        spinner.stop();
        stopWatching();
        process.exit(0);
      }
    });
  }
}));

if(program.watch) {
  process.stdin.setRawMode(true);
  process.stdin.resume();
}
