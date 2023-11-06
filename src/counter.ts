export function setupCounter(element: HTMLButtonElement) {
  let counter = 0;
  const setCounter = (count: number) => {
    counter = count
    element.innerHTML = `count is ${counter}`
  }
  element.addEventListener('click', () => setCounter(counter + 1))
  setCounter(0);
}

export function randomIntFromInterval(min: number, max: number) { // min and max included 
  return Math.floor(Math.random() * (max - min + 1) + min)
}