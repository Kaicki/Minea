import { getInputDirection } from './input.js'

const snakeBody = [{ x: 10, y: 10 }]
let newSegments = 0

export function updateSnake() {
  const inputDirection = getInputDirection()
  for (let i = snakeBody.length - 2; i >= 0; i--) {
    snakeBody[i + 1] = { ...snakeBody[i] }
  }
  snakeBody[0].x += inputDirection.x
  snakeBody[0].y += inputDirection.y
  addSegments()
}

export function drawSnake(board) {
  snakeBody.forEach(segment => {
    const el = document.createElement('div')
    el.style.gridRowStart = segment.y
    el.style.gridColumnStart = segment.x
    el.classList.add('snake')
    board.appendChild(el)
  })
}

export function getSnakeHead() {
  return snakeBody[0]
}

export function snakeIntersection() {
  return snakeBody.slice(1).some(seg => seg.x === snakeBody[0].x && seg.y === snakeBody[0].y)
}

export function expandSnake(amount) {
  newSegments += amount
}

function addSegments() {
  for (let i = 0; i < newSegments; i++) {
    snakeBody.push({ ...snakeBody[snakeBody.length - 1] })
  }
  newSegments = 0
}
