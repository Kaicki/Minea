export function randomGridPosition() {
  return {
    x: Math.floor(Math.random() * 20) + 1,
    y: Math.floor(Math.random() * 20) + 1
  }
}
