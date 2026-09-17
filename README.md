# Signals in Vanilla JS

A tiny, deliberately boring demo of **fine-grained reactivity without a framework**.

No React. No Preact. No virtual DOM. No components, no JSX, no hooks. Just
`@preact/signals-core`, a handful of `<span>` elements, and under 100 lines of TypeScript.

**Live demo:** https://learnsignal.github.io/
**Source:** https://github.com/learnsignal/learnsignal.github.io

---

## Why should you care?

Most people first meet signals inside a framework — Solid, Preact, Angular, Svelte 5,
Vue's `ref`. That packaging makes it very hard to tell which part is *the idea* and which
part is *the framework*. The reactivity gets tangled up with rendering, and you end up
believing you need the whole stack to get any of it.

You don't. The idea is separable, it is small, and it predates all of those frameworks.

This repo exists to make that separation obvious by removing everything else:

- **Signals are a data structure, not a framework feature.** `@preact/signals-core` is a
  standalone library with zero UI dependencies, and the whole production bundle here —
  signals runtime plus app logic — is under 7 KB uncompressed.
- **Dependency tracking is automatic.** You never declare what depends on what. No
  dependency arrays, no `useMemo` bookkeeping, no subscribe/unsubscribe lifecycle. You
  read a value; the graph notices.
- **Updates are surgical.** Nothing diffs. Nothing re-renders. When `randomSeed` changes,
  the spans showing the counter are not touched and `result` is not recomputed. The
  console proves it.
- **It composes with anything.** A signal graph can drive innerHTML, a canvas, a
  WebSocket, a `document.title`, an audio parameter, or a `setInterval`. This demo drives
  `innerText` and a timer because those are the least interesting choices available, which
  is the point.
- **It shows you the seam.** By the end of this README you should be able to say exactly
  where the library's job ends and yours begins. That boundary is the whole lesson, and
  frameworks hide it from you.

If you have ever wondered *"what would it cost me to use signals in a plain script tag on
a page I already have?"* — this repo is the answer, and the answer is: almost nothing.

---

## What the demo actually does

| Thing | Kind | Definition |
|---|---|---|
| `counter` | `signal` | Starts at `1`. Incremented by the first button. |
| `randomSeed` | `signal` | A random integer, initially 1–9. |
| `scramblingEnabled` | `signal` | Starts at `true`. Toggled by the third button. |
| `result` | `computed` | `counter * 10` |
| `randomizedResult` | `computed` | `counter * randomSeed` |

Behaviour:

- **count is N** — increments `counter`. Every span showing the counter updates, and both
  computeds recompute.
- **Reset** — sets `counter` to `0` and rolls a new `randomSeed` between 1 and 99.
- **Pause scrambling / Resume scrambling** — starts and stops a 5-second timer that
  scrambles `counter` and `randomSeed` on its own. The button's own label is a binding
  like any other.

Open the console before you touch anything. Every recomputation and every DOM write logs,
so you can watch which parts of the graph woke up and which stayed asleep. Press Reset a
few times: `randomSeed` and `randomizedResult` log, `result` does not, because `result`
never read `randomSeed`.

---

## How it works

### The three primitives

```ts
import { signal, computed, effect } from "@preact/signals-core";

const counter = signal(1);
const result = computed(() => counter.value * 10);
effect(() => console.log(result.value));
```

**`signal(initial)`** — a box around a value, read and written through `.value`. Writing a
value that is `Object.is`-equal to the current one does nothing at all.

**`computed(fn)`** — a derived, read-only signal. It is *lazy*: `fn` does not run until
something reads `.value`. It is *cached*: repeated reads don't recompute. It only
invalidates when a signal it actually read has changed.

**`effect(fn)`** — runs `fn` immediately, then re-runs it whenever any signal read during
the previous run changes. If `fn` returns a function, that function runs as cleanup before
the next run and on dispose. `effect` itself returns a dispose function.

### Dependency tracking, concretely

There is no registration step. While `fn` is executing, the library keeps a pointer to
"the currently running consumer." Every `.value` read links that signal to that consumer.
When the run ends, links that weren't touched this time are dropped.

Two consequences that matter:

1. **Dependencies are discovered, not declared.** Branching code gets branch-accurate
   dependencies for free. An `if` that didn't run this time contributes nothing.
2. **A read that never happens is not a dependency.** An effect that returns early before
   touching any signal has subscribed to nothing and will never run again. This is not a
   bug in the library; it is the direct consequence of rule 1, and it is the single most
   common way people get confused by signals.

The timer effect is built around exactly that rule:

```ts
effect(() => {
  if (!scramblingEnabled.value) {
    return;
  }

  const interval = setInterval(() => {
    counter.value = randomIntFromInterval(1, 9);
    randomSeed.value = randomIntFromInterval(1, 9);
  }, 5000);

  return () => clearInterval(interval);
});
```

The early return happens *after* reading `scramblingEnabled.value`, so the effect stays
subscribed and wakes up again when you resume. The returned cleanup is what tears the
timer down — the effect owns the interval's whole lifecycle, and nothing else in the app
knows the timer exists. Move the `.value` read below the `return` and the pause button
becomes permanent; that one line is the difference.

Note also that the interval callback *writes* signals but reads none, and the effect body
does not read `counter` or `randomSeed`. Writing a signal never subscribes you to it, so
there is no feedback loop to guard against.

### Where the DOM comes in — read this part

Here is the thing the demo is really teaching:

**`@preact/signals-core` does not touch the DOM. At all.**

The library answers one question: *what changed, and who cares?* It has no opinion about
what you do with that answer. So this app writes the DOM by hand, with one small helper:

```ts
function bindText(name: string, readText: () => string) {
  const elements = app.querySelectorAll<HTMLElement>(`[data-bind="${name}"]`);

  if (elements.length === 0) {
    throw new Error(`Nothing in the page is bound to "${name}"`);
  }

  effect(() => {
    const text = readText();
    elements.forEach((element) => {
      element.innerText = text;
    });
  });
}

bindText("counter", () => counter.value.toString());
bindText("result", () => result.value.toString());
```

Three details carry most of the lesson:

- **The element lookup lives outside the effect.** It runs once, eagerly, and the failure
  case throws at startup instead of silently producing an effect that never runs again.
  Only signal reads happen inside the effect body.
- **One effect per binding.** Each effect subscribes to exactly the signals its own
  `readText` touched, so a change to `randomSeed` re-runs two bindings and leaves the
  other three alone. A single effect that rendered everything would re-run everything on
  every change — correct output, but it would have thrown away the entire point.
- **`readText` returns a string.** Nothing else in the app knows that the target is a DOM
  node. Swap `innerText` for a canvas draw or a WebSocket send and the graph above is
  unchanged.

That is the entire integration story. When you use Solid or Preact Signals with JSX, the
framework generates a tiny `bindText`-equivalent per dynamic expression, closer to the text
node than you could reasonably hand-write. Same machinery, better ergonomics, much more
code shipped. Seeing the hand-written version once makes the framework version stop being
magic.

### The shape of the code

`src/main.ts` runs top to bottom:

1. Create the signals and computeds.
2. Write the markup into `#app`, with empty `data-bind` spans — no value is duplicated
   between markup and code, so there is no static text that can drift out of sync.
3. Define `bindText`.
4. Bind each piece of state to its spans. The first run of every effect fills the page.
5. Attach click handlers that *only mutate signals* — they never touch the DOM.
6. Start the timer effect.

Step 5 is worth pausing on. The event handlers know nothing about rendering. The bindings
know nothing about events. Neither knows about the timer. They communicate exclusively
through signal values, which is why adding the timer in step 6 required no changes to
steps 4 or 5, and why the pause button needed no new rendering code.

---

## Project layout

```
.
├── index.html            dev entry point, loads /src/main.ts as a module
├── src/
│   ├── main.ts           the entire application
│   ├── random.ts         randomIntFromInterval helper
│   ├── style.css         Vite starter styles, trimmed
│   ├── typescript.svg
│   └── vite-env.d.ts
├── public/vite.svg
├── docs/                 BUILD OUTPUT, committed on purpose — this is what GitHub Pages serves
│   └── llm/              export.sh output, excluded from the dump it produces
├── export.sh             dumps the whole repo to docs/llm/dump.txt for feeding to an LLM
├── vite.config.ts
├── tsconfig.json
├── package.json
└── yarn.lock
```

`docs/` is generated. Don't edit it by hand; run the build.

---

## Running it

Requires Node and Yarn (the lockfile is Yarn classic, v1). Dependencies install into
`node_modules`, which is gitignored, so clone and install before anything else:

```bash
yarn install
yarn dev
yarn build
yarn preview
```

`yarn dev` serves https://localhost:3000. `yarn build` type-checks and then bundles into
`docs/`. `yarn preview` serves the built `docs/` locally.

**The dev server is HTTPS.** `@vitejs/plugin-basic-ssl` mints a self-signed certificate,
so your browser will warn you the first time; accept it and move on. Config:

```ts
export default defineConfig({
  server: { port: 3000, https: true },
  plugins: [basicSsl()],
  build: { outDir: "docs" },
});
```

Dependencies are deliberately few: `@preact/signals-core` and `@vitejs/plugin-basic-ssl`
at runtime/dev, `typescript` and `vite` as dev dependencies. TypeScript runs in `strict`
mode with `noUnusedLocals` and `noUnusedParameters`, and `yarn build` type-checks before
bundling, so a type error fails the build rather than shipping.

---

## Deployment

GitHub Pages is configured to serve the **`/docs` folder on the `main` branch**. There is
no CI, no deploy action, no `gh-pages` branch. The flow is:

```bash
yarn build
git add docs
git commit -m "build"
git push
```

Pages picks it up. That's why `build.outDir` is `docs` instead of the usual `dist`, and
why `dist/` is gitignored while `docs/` is tracked.

One detail worth knowing if you fork this: the generated `docs/index.html` references
assets with **absolute** paths (`/assets/index-*.js`). That works because this is an
*organisation* Pages site served from the domain root. If you deploy the same output to a
*project* Pages site — `https://you.github.io/some-repo/` — every asset will 404. Set
`base: "/some-repo/"` in `vite.config.ts` and rebuild.

---

## The LLM dump script

`export.sh` walks every git-tracked file and writes a single annotated text file to
`docs/llm/dump.txt`: repo metadata, working-tree status, a file tree, then each file with
its size, permissions, mtime, SHA-256, MIME type, and last commit. Binary files get a
placeholder instead of raw bytes. It includes its own source first, excludes its own
output directory, and excludes `yarn.lock` — 22 KB of resolved URLs and integrity hashes
that is pure noise in a context window.

```bash
bash export.sh
```

It writes to a temp file and atomically renames, so a concurrent reader never sees a
partial dump. It is unrelated to the signals demo; it exists so the whole repo can be
handed to an AI assistant in one paste. `docs/llm/terminal.txt` sitting beside it is just
a saved shell transcript of an install-and-build run, kept for the same purpose.

---

## Things to try

- Open the console and press **Reset** repeatedly. `result` never logs a recomputation,
  because it never read `randomSeed`.
- Press **count is N** when the counter is already at that value — nothing logs, because
  writing an equal value is a no-op.
- Move `if (!scramblingEnabled.value)` below an early `return` in the timer effect and
  watch **Resume scrambling** stop working forever.
- Delete a `data-bind="counter"` span from the markup. The remaining ones still update;
  nothing else notices.

---

## Scope

Small and single purpose, on purpose. This repo demonstrates signals in vanilla
TypeScript and nothing else. It is not a starter template, not a component library, not a
state-management recommendation, and not a benchmark.

Ideas that are explicitly out of scope: routing, a component abstraction, a testing
harness, server-side rendering, a UI framework of any kind, additional runtime
dependencies. If a change makes the demo harder to read in one sitting, it doesn't belong
here.

Good contributions: sharpening this README, improving type safety, or removing code.

---

## AI disclaimer

Parts of this repository — including this README, `export.sh`, and revisions to the
application code — were written or edited with the help of large language models. Every
line has been reviewed by a human before being committed, but treat the prose as
explanatory rather than authoritative, and check the source when the two disagree. The
source is short enough to read in full, which is rather the point.

---

## Further reading

- `@preact/signals-core` — https://github.com/preactjs/signals
- TC39 Signals proposal — https://github.com/tc39/proposal-signals

---

## License

This project is free and open source. A `LICENSE` file has not yet been added to the
repository; until one is, treat the code as "intended to be open, licence pending" and
open an issue if you need a specific one.
