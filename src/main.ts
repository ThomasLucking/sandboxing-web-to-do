import './style.css'
import { TodoApp } from './app/TodoApp.ts'
import { TodoStorage } from './storage/TodoStorage.ts'

const input = document.querySelector<HTMLInputElement>('#todo-input')
const dateInput = document.querySelector<HTMLInputElement>('#todo-date-input')
const addButton = document.querySelector<HTMLButtonElement>('#add-todo-button')
const list = document.querySelector<HTMLUListElement>('#todo-elements')
const error = document.querySelector<HTMLParagraphElement>('#todo-error')
const deleteAllButton = document.querySelector<HTMLButtonElement>('#delete-all')

if (!input || !dateInput || !addButton || !list || !error || !deleteAllButton) {
  throw new Error(
    'Todo app failed to initialize: required DOM elements are missing.',
  )
}

const storage = new TodoStorage()

new TodoApp(input, dateInput, addButton, list, error, deleteAllButton, storage)
