export function setupInput(keys = new Set()) {
  window.addEventListener("keydown", (event) => {
    const key = event.code || event.key;
     
    const handledKeys = new Set([
      "ArrowLeft",
      "ArrowRight",
      "ArrowUp",
      "ArrowDown",
      "Space",
      "KeyE",
      "KeyF",
      "KeyW",
      "KeyA",
      "KeyS",
      "KeyD",
      "Digit1",
      "Digit2",
      "Digit3",
      "Digit4"

    ]);

    if (handledKeys.has(key)) {
      event.preventDefault();
      keys.add(key);
    }
  });

  window.addEventListener("keyup", (event) => {
    keys.delete(event.code || event.key);
    //handledKeys.delete(event.key.toLowerCase());
  });

  return keys;
}