import './style.css'
import { TodoApiClient } from './api/TodoApiClient.ts'
import { TodoApp } from './app/TodoApp.ts'
import { TodoListRenderer } from './app/TodoListRenderer.ts'
import { TodoRepository } from './app/TodoRepository.ts'
import { requireElement } from './dom/requireElement.ts'
import { LoadingIndicator } from './ui/LoadingIndicator.ts'

const input = requireElement<HTMLInputElement>('#todo-input')
const dateInput = requireElement<HTMLInputElement>('#todo-date-input')
const addButton = requireElement<HTMLButtonElement>('#add-todo-button')
const list = requireElement<HTMLUListElement>('#todo-elements')
const error = requireElement<HTMLParagraphElement>('#todo-error')
const deleteAllButton = requireElement<HTMLButtonElement>('#delete-all')
const overdueMessage = requireElement<HTMLParagraphElement>('#overdue-message')
const loadingElement =
  requireElement<HTMLParagraphElement>('#loading-indicator')

const apiClient = new TodoApiClient()
const repository = new TodoRepository(apiClient)
const renderer = new TodoListRenderer(list, overdueMessage)
const loadingIndicator = new LoadingIndicator(loadingElement)

const app = new TodoApp({
  input,
  dateInput,
  addButton,
  error,
  deleteAllButton,
  repository,
  renderer,
  loadingIndicator,
})

await app.init()
