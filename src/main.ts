import { signal, computed, effect } from "@preact/signals-core";
import { randomIntFromInterval } from "./random";
import "./style.css";

const counter = signal(1);
const randomSeed = signal(randomIntFromInterval(1, 9));
const scramblingEnabled = signal(true);

const result = computed(() => {
  const value = counter.value * 10;
  console.info({ recomputed: "result", value });
  return value;
});

const randomizedResult = computed(() => {
  const value = counter.value * randomSeed.value;
  console.info({ recomputed: "randomizedResult", value });
  return value;
});

const app = document.querySelector<HTMLDivElement>("#app")!;

app.innerHTML = `
  <div>
    <h1>Signals in Vanilla JS</h1>
    <div class="card">
      <button type="button" id="incrementCounter">count is <span data-bind="counter"></span></button>
      <button type="button" id="reset">Reset</button>
      <button type="button" id="toggleScrambling"><span data-bind="scramblingLabel"></span></button>
    </div>
    <p><span data-bind="counter"></span> * 10 = <span data-bind="result"></span></p>
    <h1>
      <span data-bind="counter"></span> * <span data-bind="randomSeed"></span>
        = <span data-bind="randomizedResult"></span>
    </h1>
  </div>
`;

function bindText(name: string, readText: () => string) {
  const elements = app.querySelectorAll<HTMLElement>(`[data-bind="${name}"]`);

  if (elements.length === 0) {
    throw new Error(`Nothing in the page is bound to "${name}"`);
  }

  effect(() => {
    const text = readText();
    console.info({ rendered: name, text });
    elements.forEach((element) => {
      element.innerText = text;
    });
  });
}

bindText("counter", () => counter.value.toString());
bindText("result", () => result.value.toString());
bindText("randomSeed", () => randomSeed.value.toString());
bindText("randomizedResult", () => randomizedResult.value.toString());
bindText("scramblingLabel", () =>
  scramblingEnabled.value ? "Pause scrambling" : "Resume scrambling",
);

document.getElementById("incrementCounter")!.addEventListener("click", () => {
  counter.value++;
});

document.getElementById("reset")!.addEventListener("click", () => {
  counter.value = 0;
  randomSeed.value = randomIntFromInterval(1, 99);
});

document.getElementById("toggleScrambling")!.addEventListener("click", () => {
  scramblingEnabled.value = !scramblingEnabled.value;
});

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
