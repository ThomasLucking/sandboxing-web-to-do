import { Todo } from '../models/Todo.ts'
import type { TodoListRenderer } from './TodoListRenderer.ts'
import type { TodoRepository } from './TodoRepository.ts'

const EMPTY_TODO_ERROR = 'Please enter a to-do item before adding it.'
const PAST_DUE_DATE_ERROR = 'Due date cannot be in the past.'

export interface TodoAppDependencies {
  input: HTMLInputElement
  dateInput: HTMLInputElement
  addButton: HTMLButtonElement
  error: HTMLParagraphElement
  deleteAllButton: HTMLButtonElement
  repository: TodoRepository
  renderer: TodoListRenderer
}

export class TodoApp {
  private readonly input: HTMLInputElement
  private readonly dateInput: HTMLInputElement
  private readonly addButton: HTMLButtonElement
  private readonly error: HTMLParagraphElement
  private readonly deleteAllButton: HTMLButtonElement
  private readonly repository: TodoRepository
  private readonly renderer: TodoListRenderer

  constructor(dependencies: TodoAppDependencies) {
    this.input = dependencies.input
    this.dateInput = dependencies.dateInput
    this.addButton = dependencies.addButton
    this.error = dependencies.error
    this.deleteAllButton = dependencies.deleteAllButton
    this.repository = dependencies.repository
    this.renderer = dependencies.renderer

    this.addButton.addEventListener('click', () => this.addTodo())
    this.input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        this.addTodo()
      }
    })
    this.input.addEventListener('input', () => this.clearError())
    this.dateInput.addEventListener('input', () => this.clearError())
    this.deleteAllButton.addEventListener('click', () => this.handleClearAll())

    this.refresh()
  }

  private addTodo(): void {
    const text = this.input.value.trim()

    if (text.length === 0) {
      this.showError(EMPTY_TODO_ERROR)
      return
    }

    const dueDate = this.readDueDate()

    if (dueDate === 'invalid') {
      this.showError(PAST_DUE_DATE_ERROR)
      return
    }

    this.repository.add(new Todo(text, undefined, false, dueDate))
    this.input.value = ''
    this.dateInput.value = ''
    this.clearError()
    this.refresh()
  }

  private readDueDate(): Temporal.PlainDate | undefined | 'invalid' {
    const rawValue = this.dateInput.value

    if (rawValue.length === 0) {
      return undefined
    }

    const dueDate = Temporal.PlainDate.from(rawValue)

    if (Temporal.PlainDate.compare(dueDate, Temporal.Now.plainDateISO()) < 0) {
      return 'invalid'
    }

    return dueDate
  }

  private handleToggle(id: number): void {
    this.repository.toggle(id)
    this.refresh()
  }

  private handleRemove(id: number): void {
    this.repository.remove(id)
    this.refresh()
  }

  private handleClearAll(): void {
    this.repository.clear()
    this.refresh()
  }

  private showError(message: string): void {
    this.error.textContent = message
    this.error.hidden = false
  }

  private clearError(): void {
    this.error.textContent = ''
    this.error.hidden = true
  }

  private refresh(): void {
    this.renderer.render(this.repository.getAll(), {
      onToggle: (id) => this.handleToggle(id),
      onRemove: (id) => this.handleRemove(id),
    })
  }
}
