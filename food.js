import { randomGridPosition } from './utils.js'
import { expandSnake } from './snake.js'

let food = randomGridPosition()

export function updateFood(head, onEat) {
  if (head.x === food.x && head.y === food.y) {
    expandSnake(1)
    onEat()
    food = randomGridPosition()
  }
}

export function drawFood(board) {
  const el = document.createElement('div')
  el.style.gridRowStart = food.y
  el.style.gridColumnStart = food.x
  el.classList.add('food')
  board.appendChild(el)
}
