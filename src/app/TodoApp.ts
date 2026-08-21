import { Todo } from '../models/Todo.ts'

const EMPTY_TODO_ERROR = 'Please enter a to-do item before adding it.'

export class TodoApp {
  private readonly todos: Todo[] = []
  private readonly input: HTMLInputElement
  private readonly addButton: HTMLButtonElement
  private readonly list: HTMLUListElement
  private readonly error: HTMLParagraphElement

  constructor(
    input: HTMLInputElement,
    addButton: HTMLButtonElement,
    list: HTMLUListElement,
    error: HTMLParagraphElement,
  ) {
    this.input = input
    this.addButton = addButton
    this.list = list
    this.error = error

    this.addButton.addEventListener('click', () => this.addTodo())
    this.input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        this.addTodo()
      }
    })
    this.input.addEventListener('input', () => this.clearError())
  }

  private addTodo(): void {
    const text = this.input.value.trim()

    if (text.length === 0) {
      this.showError(EMPTY_TODO_ERROR)
      return
    }

    this.todos.push(new Todo(text))
    this.input.value = ''
    this.clearError()
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
    item.textContent = todo.text
    item.dataset.id = String(todo.id)
    return item
  }
}
