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
    <p>Randomized result: <span class="counter">${counter.value}</span> * ${randomSeed.value} = <span class="randomizedResult">10</span></p>
  </div>
`;

function setCounter() {
  const counterElements = document.querySelectorAll<HTMLSpanElement>(".counter");
  const resultElement = document.querySelector<HTMLSpanElement>(".result");
  const randomizedResultElement = document.querySelector<HTMLSpanElement>(".randomizedResult");

  if (!counterElements?.length || !resultElement || !randomizedResultElement) {
    return;
  }

  counterElements.forEach((element) => {
    element.innerText = counter.value.toString();
  });

  resultElement.innerText = result.value.toString();
  randomizedResultElement.innerText = randomizedResult.value.toString();
}

const button = document.getElementById("incrementCounter");
const resetButton = document.getElementById("reset");

button?.addEventListener("click", () => {
  counter.value++;
});

resetButton?.addEventListener("click", () => {
  counter.value = 0;
  randomSeed.value = randomIntFromInterval(1, 9);
  console.info({ new: randomSeed.value });
  resetPressed.value = true;
});

effect(setCounter);

setInterval(() => {
  if (resetPressed.value === false) {
    counter.value = randomIntFromInterval(4, 9);
    randomSeed.value = randomIntFromInterval(3, 6);
  }
}, 200)