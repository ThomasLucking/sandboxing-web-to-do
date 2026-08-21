import './style.css'
import { TodoApp } from './app/TodoApp.ts'
import { TodoListRenderer } from './app/TodoListRenderer.ts'
import { TodoRepository } from './app/TodoRepository.ts'
import { requireElement } from './dom/requireElement.ts'
import { TodoStorage } from './storage/TodoStorage.ts'

const input = requireElement<HTMLInputElement>('#todo-input')
const dateInput = requireElement<HTMLInputElement>('#todo-date-input')
const addButton = requireElement<HTMLButtonElement>('#add-todo-button')
const list = requireElement<HTMLUListElement>('#todo-elements')
const error = requireElement<HTMLParagraphElement>('#todo-error')
const deleteAllButton = requireElement<HTMLButtonElement>('#delete-all')
const overdueMessage = requireElement<HTMLParagraphElement>('#overdue-message')

const storage = new TodoStorage()
const repository = new TodoRepository(storage)
const renderer = new TodoListRenderer(list, overdueMessage)

new TodoApp({
  input,
  dateInput,
  addButton,
  error,
  deleteAllButton,
  repository,
  renderer,
})
