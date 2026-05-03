import { updateSnake, drawSnake, getSnakeHead, snakeIntersection } from './snake.js'
import { updateFood, drawFood } from './food.js'
import { getInputDirection } from './input.js'

let lastRenderTime = 0
const gameBoard = document.getElementById('game-board')
const scoreEl = document.getElementById('score')
let score = 0
let gameOver = false

function main(currentTime) {
  if (gameOver) return
  window.requestAnimationFrame(main)
  const secondsSinceLastRender = (currentTime - lastRenderTime) / 1000
  if (secondsSinceLastRender < 1 / 10) return
  lastRenderTime = currentTime

  update()
  draw()
}

window.requestAnimationFrame(main)

function update() {
  updateSnake()
  updateFood(getSnakeHead(), () => {
    score++
    scoreEl.innerText = score
  })
  checkDeath()
}

function draw() {
  gameBoard.innerHTML = ''
  drawSnake(gameBoard)
  drawFood(gameBoard)
}

function checkDeath() {
  const head = getSnakeHead()
  if (snakeIntersection() || head.x < 1 || head.y < 1 || head.x > 20 || head.y > 20) {
    gameOver = true
    alert('Game Over')
  }
}

document.getElementById('restart').onclick = () => location.reload()
