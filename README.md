# Signals in Vanilla JS

A tiny, deliberately boring demo of **fine-grained reactivity without a framework**.

No React. No Preact. No virtual DOM. No components, no JSX, no hooks, no build-time
magic beyond a bundler. Just `@preact/signals-core`, a handful of `<span>` elements, and
about 60 lines of TypeScript.

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
  standalone library with zero UI dependencies. The entire production bundle here —
  signals runtime, app logic, and Vite's module preload shim — is about 6.6 KiB
  uncompressed.
- **Dependency tracking is automatic.** You never declare what depends on what. No
  dependency arrays, no `useMemo` bookkeeping, no subscribe/unsubscribe lifecycle. You
  read a value; the graph notices.
- **Updates are surgical.** Nothing diffs. Nothing re-renders. When `counter` changes,
  exactly the code that read `counter` runs again.
- **It composes with anything.** A signal graph can drive innerHTML, a canvas, a
  WebSocket, a `document.title`, an audio parameter, or a log line. This demo drives
  `innerText` because that's the least interesting choice available, which is the point.
- **It shows you the seam.** By the end of this README you should be able to say exactly
  where the library's job ends and yours begins. That boundary is the whole lesson, and
  frameworks hide it from you.

If you have ever wondered *"what would it cost me to use signals in a plain script tag on
a page I already have?"* — this repo is the answer, and the answer is: almost nothing.

---

## What the demo actually does

The page shows a counter and two derived numbers:

| Thing | Kind | Definition |
|---|---|---|
| `counter` | `signal` | Starts at `1`. Incremented by the button. |
| `resetPressed` | `signal` | Starts at `false`. Latches to `true` on Reset. |
| `result` | `computed` | `counter * 10` |
| `randomSeed` | `signal` | A random integer, initially 1–9 |
| `randomizedResult` | `computed` | `counter * randomSeed` |

Behaviour:

- **count is N** — clicking increments `counter`. Every span showing the counter updates,
  and both derived values recompute.
- **Reset** — sets `counter` to `0`, rolls a new `randomSeed` between 1 and 99, and sets
  `resetPressed` to `true`.
- **Every 5 seconds** — while `resetPressed` is still `false`, the timer scrambles both
  `counter` and `randomSeed` so you can watch the whole graph update with nobody touching
  the page.

Open the console. Every autonomous change logs, so you can correlate a log line with the
numbers changing on screen.

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
the previous run changes. Returns a dispose function.

### Dependency tracking, concretely

There is no registration step. While `fn` is executing, the library keeps a pointer to
"the currently running consumer." Every `.value` read links that signal to that consumer.
When the run ends, links that weren't touched this time are dropped.

Two consequences that matter:

1. **Dependencies are discovered, not declared.** Branching code gets branch-accurate
   dependencies for free. An `if` that didn't run this time contributes nothing.
2. **A read that never happens is not a dependency.** If your effect returns early before
   touching any signal, it has subscribed to nothing and will never run again. This is not
   a bug in the library; it is the direct consequence of rule 1. It is also the single
   most common way people get confused by signals, and this repo contains a live example
   of the pattern (see *Known quirks*).

### Where the DOM comes in — read this part

Here is the thing the demo is really teaching:

**`@preact/signals-core` does not touch the DOM. At all.**

The library answers one question: *what changed, and who cares?* It has no opinion about
what you do with that answer. So this app writes the DOM by hand:

```ts
function setCounter() {
  const counterElements = document.querySelectorAll<HTMLSpanElement>(".counter");
  const resultElement = document.querySelector<HTMLSpanElement>(".result");

  counterElements.forEach((element) => {
    element.innerText = counter.value.toString();
  });
  resultElement.innerText = result.value.toString();
}

effect(setCounter);
```

`setCounter` is a plain function that reads the current values and pushes them into the
page. Wrapping it in `effect` is what makes it re-run at the right moments — and *only*
at the right moments.

That is the entire integration story. When you use Solid or Preact Signals with JSX, the
framework is generating a tiny `setCounter`-equivalent per dynamic expression, closer to
the text node than you could reasonably hand-write. Same machinery, better ergonomics,
much more code shipped. Seeing the hand-written version once makes the framework version
stop being magic.

### The shape of the code

`src/main.ts` runs top to bottom:

1. Create the signals and computeds.
2. Write the initial markup into `#app` with a template literal, interpolating current
   values so the first paint isn't blank.
3. Define `setCounter`, which syncs every `.counter`, `.result`, `.randomSeed`, and
   `.randomizedResult` element.
4. Attach click handlers that *only mutate signals* — they never touch the DOM.
5. `effect(setCounter)` to connect state to pixels.
6. A `setInterval` that mutates signals on a timer.

Step 4 is worth pausing on. The event handlers know nothing about rendering. The renderer
knows nothing about events. Neither knows about the timer. They communicate exclusively
through signal values, which is why adding the timer in step 6 required no changes to
steps 3 or 4.

---

## Project layout

```
.
├── index.html            dev entry point, loads /src/main.ts as a module
├── src/
│   ├── main.ts           the entire application
│   ├── counter.ts        randomIntFromInterval helper
│   ├── style.css         Vite starter styles plus an animated light-mode background
│   ├── typescript.svg
│   └── vite-env.d.ts
├── public/vite.svg
├── docs/                 BUILD OUTPUT, committed on purpose — this is what GitHub Pages serves
├── export.sh             dumps the whole repo to docs/llm/dump.txt for feeding to an LLM
├── vite.config.ts
├── tsconfig.json
└── package.json
```

`docs/` is generated. Don't edit it by hand; run the build.

---

## Running it

Requires Node and Yarn. The repo uses **Yarn Plug'n'Play with Zero-Installs** — the
lockfile, `.pnp.cjs`, and `.pnp.loader.mjs` are committed, so there is usually no install
step at all.

```bash
yarn dev       # https://localhost:3000
yarn build     # type-check, then bundle into docs/
yarn preview   # serve the built docs/ locally
```

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
output directory, and excludes the Yarn PnP artifacts — which are tracked for Zero-Installs
but are pure noise in a context window.

```bash
bash export.sh
```

It writes to a temp file and atomically renames, so a concurrent reader never sees a
partial dump. It is unrelated to the signals demo; it exists so the whole repo can be
handed to an AI assistant in one paste.

---

## Known quirks

These are real, they are in the shipped code, and reading them is more instructive than a
clean codebase would be.

- **`setCounter` guards before it reads.** If any of the four element lookups comes back
  empty, the function returns before touching a single `.value`. An effect whose first run
  takes that path registers *zero* dependencies and is then permanently inert. Here the
  elements always exist, so it never fires — but it's a live demonstration of why
  "subscribe by reading" cuts both ways.
- **One interpolation omits `.value`.** The initial markup embeds `${randomizedResult}`
  rather than `${randomizedResult.value}`. It renders correctly only because
  `Signal.prototype.toString()` returns the underlying value. Relying on that is implicit
  and inconsistent with the three neighbouring interpolations.
- **The initial `= 10` is hardcoded.** The static markup ships a literal `10` for the
  result, which happens to be right because `counter` starts at `1`. The first effect run
  overwrites it with the real value a moment later.
- **`resetPressed` is a one-way latch.** Once you press Reset, the 5-second randomizer
  stops for the rest of the session. There is no path back to `false`. That's intentional
  — it's how you freeze the page to inspect it — but it is not a toggle.
- **`setupCounter` in `counter.ts` is dead code**, left over from the Vite vanilla-ts
  starter. Only `randomIntFromInterval` is actually imported.

---

## Scope

Small and single purpose, on purpose. This repo demonstrates signals in vanilla
TypeScript and nothing else. It is not a starter template, not a component library, not a
state-management recommendation, and not a benchmark.

Ideas that are explicitly out of scope: routing, a component abstraction, a testing
harness, server-side rendering, a UI framework of any kind, additional runtime
dependencies. If a change makes the demo harder to read in one sitting, it doesn't belong
here.

Good contributions: fixing the quirks above, sharpening this README, improving type
safety, or removing code.

---

## Further reading

- `@preact/signals-core` — https://github.com/preactjs/signals
- TC39 Signals proposal — https://github.com/tc39/proposal-signals

---

## License

This project is free and open source. A `LICENSE` file has not yet been added to the
repository; until one is, treat the code as "intended to be open, licence pending" and
open an issue if you need a specific one.
