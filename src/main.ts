import "./style.css";
import { signal, computed, effect } from "@preact/signals-core";
const counter = signal(1);
const result = computed(() => counter.value * 10);
let randomSeed = signal(randomIntFromInterval(1, 9));
let randomizedResult = computed(() => counter.value * randomSeed.value);

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div>
    <h1>Signals in Vanilla JS</h1>
    <div class="card">
      <button type="button">count is <span class="counter">${counter.value}</span></button>
      <button type="reset" id="reset">Reset</button>
    </div>
    <p>Result: <span class="counter">${counter.value}</span> * 10 = <span class="result">10</span></p>
    <p>Randomized result: <span class="counter">${counter.value}</span> * ${randomSeed} = <span class="randomizedResult">10</span></p>
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

function randomIntFromInterval(min: number, max: number) { // min and max included 
  return Math.floor(Math.random() * (max - min + 1) + min)
}

const button = document.querySelector<HTMLButtonElement>("button");

button?.addEventListener("click", () => {
    counter.value++;
});

effect(setCounter);

const resetButton = document.getElementById("reset");

resetButton?.addEventListener("click", () => {
  counter.value = 0;
  const newRandom = randomIntFromInterval(1, 9);
  console.info({ newRandom });
  randomSeed.value = newRandom;
});
