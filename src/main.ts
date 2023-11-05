import "./style.css";
import { signal, computed, effect } from "@preact/signals-core";
const counter = signal(1);
const result = computed(() => counter.value * 10);

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div>
    <h1>Signals in Vanilla JS</h1>
    <div class="card">
      <button type="button">count is <span class="counter">${counter.value}</span></button>
    </div>
    <p>Result: <span class="counter">${counter.value}</span> * 10 = <span class="result">10</span></p>
  </div>
`;

function setCounter() {
    const counterElements = document.querySelectorAll<HTMLSpanElement>(".counter");
    const resultElement = document.querySelector<HTMLSpanElement>(".result");

    if (!counterElements?.length || !resultElement) {
        return;
    }

    counterElements.forEach((element) => {
        element.innerText = counter.value.toString();
    });

    resultElement.innerText = result.value.toString();
}

const button = document.querySelector<HTMLButtonElement>("button");

button?.addEventListener("click", () => {
    counter.value++;
});

effect(setCounter);
