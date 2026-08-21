import './style.css'
import { CategoryApiClient } from './api/CategoryApiClient.ts'
import { TodoApiClient } from './api/TodoApiClient.ts'
import { CategoryListRenderer } from './app/CategoryListRenderer.ts'
import { CategoryManager } from './app/CategoryManager.ts'
import { CategoryRepository } from './app/CategoryRepository.ts'
import { TodoApp } from './app/TodoApp.ts'
import { TodoListRenderer } from './app/TodoListRenderer.ts'
import { TodoRepository } from './app/TodoRepository.ts'
import { requireElement } from './dom/requireElement.ts'
import { LoadingIndicator } from './ui/LoadingIndicator.ts'

const input = requireElement<HTMLInputElement>('#todo-input')
const dateInput = requireElement<HTMLInputElement>('#todo-date-input')
const categorySelect = requireElement<HTMLSelectElement>(
  '#todo-category-select',
)
const addButton = requireElement<HTMLButtonElement>('#add-todo-button')
const list = requireElement<HTMLUListElement>('#todo-elements')
const error = requireElement<HTMLParagraphElement>('#todo-error')
const deleteAllButton = requireElement<HTMLButtonElement>('#delete-all')
const searchInput = requireElement<HTMLInputElement>('#todo-search-input')
const overdueMessage = requireElement<HTMLParagraphElement>('#overdue-message')
const loadingElement =
  requireElement<HTMLParagraphElement>('#loading-indicator')

const loadingIndicator = new LoadingIndicator(loadingElement)

const categoryNameInput = requireElement<HTMLInputElement>(
  '#category-name-input',
)
const categoryColorInput = requireElement<HTMLInputElement>(
  '#category-color-input',
)
const addCategoryButton = requireElement<HTMLButtonElement>(
  '#add-category-button',
)
const categoryError = requireElement<HTMLParagraphElement>('#category-error')
const categoriesList = requireElement<HTMLUListElement>('#categories-elements')

const categoryApiClient = new CategoryApiClient()
const categoryRepository = new CategoryRepository(categoryApiClient)
const categoryRenderer = new CategoryListRenderer(categoriesList)

const categoryManager = new CategoryManager({
  nameInput: categoryNameInput,
  colorInput: categoryColorInput,
  addButton: addCategoryButton,
  error: categoryError,
  repository: categoryRepository,
  renderer: categoryRenderer,
  loadingIndicator,
})

const apiClient = new TodoApiClient()
const repository = new TodoRepository(apiClient)
const renderer = new TodoListRenderer(list, overdueMessage)

const app = new TodoApp({
  input,
  dateInput,
  categorySelect,
  addButton,
  error,
  deleteAllButton,
  searchInput,
  repository,
  categoryRepository,
  renderer,
  loadingIndicator,
})

await categoryRepository.load()
await Promise.all([app.init(), categoryManager.init()])
