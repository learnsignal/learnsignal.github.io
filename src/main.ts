import { randomIntFromInterval } from "./counter";
import "./style.css";
import { signal, computed, effect } from "@preact/signals-core";
const counter = signal(1);
const resetPressed = signal(false);
const result = computed(() => counter.value * 10);
let randomSeed = signal(randomIntFromInterval(1, 9));
let randomizedResult = computed(() => counter.value * randomSeed.value);

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div>
    <h1>Signals in Vanilla JS</h1>
    <div class="card">
      <button type="button" id="incrementCounter">count is <span class="counter">${counter.value}</span></button>
      <button type="reset" id="reset">Reset</button>
    </div>
    <p>Result: <span class="counter">${counter.value}</span> * 10 = <span class="result">10</span></p>
    <h1>
      <span class="counter">${counter.value}</span> * <span class="randomSeed">${randomSeed.value}</span> = <span class="randomizedResult">${randomizedResult}</span>.
    </h1>
  </div>
`;

function setCounter() {
  const counterElements = document.querySelectorAll<HTMLSpanElement>(".counter");
  const resultElement = document.querySelector<HTMLSpanElement>(".result");
  const randomSeedElements = document.querySelectorAll<HTMLSpanElement>(".randomSeed");
  const randomizedResultElements = document.querySelectorAll<HTMLSpanElement>(".randomizedResult");

  if (!counterElements?.length || !resultElement || !randomSeedElements?.length || !randomizedResultElements?.length) {
    return;
  }

  counterElements.forEach((element) => {
    element.innerText = counter.value.toString();
  });

  resultElement.innerText = result.value.toString();
  // randomSeedElement.innerText = randomSeed.value.toString();
  randomSeedElements.forEach((element) => {
    element.innerText = randomSeed.value.toString();
  });
  // randomizedResultElement.innerText = randomizedResult.value.toString();
  randomizedResultElements.forEach((element) => {
    element.innerText = randomizedResult.value.toString();
  });
}

const button = document.getElementById("incrementCounter");
const resetButton = document.getElementById("reset");

button?.addEventListener("click", () => {
  counter.value++;
});

resetButton?.addEventListener("click", () => {
  counter.value = 0;
  randomSeed.value = randomIntFromInterval(1, 99);
  console.info({ new: randomSeed.value });
  resetPressed.value = true;
});

effect(setCounter);

setInterval(() => {
  if (resetPressed.value === false) {
    counter.value = randomIntFromInterval(1, 9);
    randomSeed.value = randomIntFromInterval(1, 9);
    console.info({ counter: counter.value});
    console.info({ randomSeed: randomSeed.value});
  }
}, 5000)