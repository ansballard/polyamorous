import { screen as Screen, text, list } from "blessed";
import rc from "rc";

import { run } from "../lib/utils";

const conf = rc("polyamorous");
const defaultElement = {
  width: "50%",
  height: "50%",
  tags: true,
  border: {
    type: "line"
  },
  style: {
    fg: "green",
    border: {
      fg: "green"
    },
    hover: {
      bg: "cyan"
    }
  }
};
const defaultRunOpts = {
  cwd: process.cwd(),
  log(msg) {
    bottomRight.unshiftItem(` ${msg}`);
    screen.render();
  },
  err(msg) {
    bottomRight.unshiftItem(` {red-fg}${msg}{/red-fg}`);
    screen.render();
  },
  minify: true,
  all: true,
  watch: true,
  serve: false//true
};
const screen = Screen({
  smartCSR: true
});

screen.title = "Polyamorous";

const topLeft = text(Object.assign({}, defaultElement, {
  top: 1,
  left: 1,
  border: undefined,
  parent: screen,
  align: "center",
  content: "{bold}poly{/bold}"
}));
const topRight = list(Object.assign({}, defaultElement, {
  top: 1,
  right: 1,
  parent: screen,
  interactive: false,
  content: `{center}{bold}Watching for Changes{/bold}{/center}

 {cyan-fg}Shift{/cyan-fg}+{cyan-fg}A{/cyan-fg}: Build {yellow-fg}All{/yellow-fg}
 ${!conf.node ? `{cyan-fg}Shift{/cyan-fg}+{cyan-fg}C{/cyan-fg}: Build {yellow-fg}CSS{/yellow-fg}
 {cyan-fg}Shift{/cyan-fg}+{cyan-fg}J{/cyan-fg}: Build {yellow-fg}Javascript{/yellow-fg}
 {cyan-fg}Shift{/cyan-fg}+{cyan-fg}S{/cyan-fg}: Build {yellow-fg}Service Workers{/yellow-fg}`
 : `{cyan-fg}Shift{/cyan-fg}+{cyan-fg}N{/cyan-fg}: Build {yellow-fg}Node{/yellow-fg}`}
       {cyan-fg}Q{/cyan-fg}: Quit`
}));
const bottomRight = list(Object.assign({}, defaultElement, {
  bottom: 1,
  width: "100%",
  left: 1,
  parent: screen,
  interactive: false,
  content: "{center}{bold}Logs{/bold}{/center}"
}));

run(Object.assign({}, defaultRunOpts, {
  building(args) {
    // topRight.unshiftItem(` {cyan-fg}Built ${args.prettyName}{/cyan-fg}`);
    // screen.render();
  },
  goodWatch(args) {
    bottomRight.unshiftItem(` {cyan-fg}Built ${args.prettyName}{/cyan-fg}`);
    screen.render();
  },
  badWatch(e, args) {
    bottomRight.unshiftItem(` {red-fg}Error building ${args.prettyName}{/red-fg}`);
    screen.render();
  },
  onquit() {
    //
  }
}))
.then(() => {
  bottomRight.unshiftItem(` Initial Build Done`);
  screen.render();
});

screen.key(["S-a"], (ch, key) => {
  run(Object.assign({}, defaultRunOpts, {
    watch: false,
    serve: false
  }));
});
screen.key(["S-c"], (ch, key) => {
  run(Object.assign({}, defaultRunOpts, {
    all: false,
    css: true,
    watch: false,
    serve: false
  }));
});
screen.key(["S-s"], (ch, key) => {
  run(Object.assign({}, defaultRunOpts, {
    all: false,
    serviceworkers: true,
    watch: false,
    serve: false
  }));
});
screen.key(["S-j"], (ch, key) => {
  run(Object.assign({}, defaultRunOpts, {
    all: false,
    javascript: true,
    watch: false,
    serve: false
  }));
});
screen.key(["S-n"], (ch, key) => {
  run(Object.assign({}, defaultRunOpts, {
    all: false,
    node: true,
    watch: false,
    serve: false
  }));
});

screen.key(["escape", "q", "C-c"], (ch, key) => {
  return process.exit(0);
});

screen.append(topLeft);
screen.append(topRight);
screen.append(bottomRight);

screen.render();
