import './style.css'
import { TodoApp } from './app/TodoApp.ts'
import { TodoStorage } from './storage/TodoStorage.ts'

const input = document.querySelector<HTMLInputElement>('#todo-input')
const addButton = document.querySelector<HTMLButtonElement>('#add-todo-button')
const list = document.querySelector<HTMLUListElement>('#todo-elements')
const error = document.querySelector<HTMLParagraphElement>('#todo-error')

if (!input || !addButton || !list || !error) {
  throw new Error(
    'Todo app failed to initialize: required DOM elements are missing.',
  )
}

const storage = new TodoStorage()

new TodoApp(input, addButton, list, error, storage)
