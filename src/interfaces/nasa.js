import blessed from "blessed";

import { run } from "../lib/utils";

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
  minify: true,
  all: true,
  watch: true,
  serve: true
};
const screen = blessed.screen({
  smartCSR: true
});

screen.title = "Polyamorous";

const topLeft = blessed.bigtext(Object.assign({}, defaultElement, {
  top: 1,
  left: 1,
  height: "100%",
  border: undefined,
  parent: screen,
  align: "center",
  valign: "top",
  content: "poly"
}));
const topRight = blessed.list(Object.assign({}, defaultElement, {
  top: 1,
  right: 1,
  parent: screen,
  interactive: false,
  content: `{center}{bold}Watching for Changes{/bold}{/center}

 {cyan-fg}Shift{/cyan-fg}+{cyan-fg}A{/cyan-fg}: Build {yellow-fg}All{/yellow-fg}
 {cyan-fg}Shift{/cyan-fg}+{cyan-fg}A{/cyan-fg}: Build {yellow-fg}CSS{/yellow-fg}
 {cyan-fg}Shift{/cyan-fg}+{cyan-fg}A{/cyan-fg}: Build {yellow-fg}Javascript{/yellow-fg}
 {cyan-fg}Shift{/cyan-fg}+{cyan-fg}A{/cyan-fg}: Build {yellow-fg}Service Workers{/yellow-fg}
       {cyan-fg}Q{/cyan-fg}: Quit`
}));
const bottomRight = blessed.list(Object.assign({}, defaultElement, {
  bottom: 1,
  right: 1,
  parent: screen,
  interactive: false,
  content: "{center}{bold}Logs{/bold}{/center}"
}));

run(Object.assign({}, defaultRunOpts, {
  building(args) {
    // topRight.unshiftItem(`{cyan-fg}Built ${args.prettyName}{/cyan-fg}`);
    // screen.render();
  },
  goodWatch(args) {
    bottomRight.unshiftItem(`{cyan-fg}Built ${args.prettyName}{/cyan-fg}`);
    screen.render();
  },
  badWatch(e, args) {
    bottomRight.unshiftItem(`{red-fg}Error building ${args.prettyName}{/red-fg}`);
    screen.render();
  },
  onquit() {
    //
  }
}));

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

screen.key(["escape", "q", "C-c"], (ch, key) => {
  return process.exit(0);
});

screen.append(topLeft);
screen.append(topRight);
screen.append(bottomRight);

screen.render();
