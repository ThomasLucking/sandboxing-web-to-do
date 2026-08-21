import { Todo } from '../models/Todo.ts'
import type { TodoStorage } from '../storage/TodoStorage.ts'

const EMPTY_TODO_ERROR = 'Please enter a to-do item before adding it.'

export class TodoApp {
  private readonly todos: Todo[] = []
  private readonly input: HTMLInputElement
  private readonly addButton: HTMLButtonElement
  private readonly list: HTMLUListElement
  private readonly error: HTMLParagraphElement
  private readonly storage: TodoStorage

  constructor(
    input: HTMLInputElement,
    addButton: HTMLButtonElement,
    list: HTMLUListElement,
    error: HTMLParagraphElement,
    storage: TodoStorage,
  ) {
    this.input = input
    this.addButton = addButton
    this.list = list
    this.error = error
    this.storage = storage

    this.addButton.addEventListener('click', () => this.addTodo())
    this.input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        this.addTodo()
      }
    })
    this.input.addEventListener('input', () => this.clearError())

    this.todos.push(...this.storage.load())
    this.render()
  }

  private addTodo(): void {
    const text = this.input.value.trim()

    if (text.length === 0) {
      this.showError(EMPTY_TODO_ERROR)
      return
    }

    this.todos.push(new Todo(text))
    this.storage.save(this.todos)
    this.input.value = ''
    this.clearError()
    this.render()
  }

  private toggleTodo(id: number): void {
    const todo = this.todos.find((t) => t.id === id)

    if (!todo) {
      return
    }

    todo.completed = !todo.completed
    this.storage.save(this.todos)
    this.render()
  }

  private showError(message: string): void {
    this.error.textContent = message
    this.error.hidden = false
  }

  private clearError(): void {
    this.error.textContent = ''
    this.error.hidden = true
  }

  private render(): void {
    this.list.replaceChildren(
      ...this.todos.map((todo) => this.createTodoElement(todo)),
    )
  }

  private createTodoElement(todo: Todo): HTMLLIElement {
    const item = document.createElement('li')
    item.dataset.id = String(todo.id)
    item.classList.toggle('completed', todo.completed)

    const checkbox = document.createElement('input')
    checkbox.type = 'checkbox'
    checkbox.checked = todo.completed
    checkbox.addEventListener('change', () => this.toggleTodo(todo.id))

    const label = document.createElement('span')
    label.textContent = todo.text

    item.append(checkbox, label)
    return item
  }
}
