import type { LoadingIndicator } from '../ui/LoadingIndicator.ts'
import type { TodoListRenderer } from './TodoListRenderer.ts'
import type { TodoRepository } from './TodoRepository.ts'

const EMPTY_TODO_ERROR = 'Please enter a to-do item before adding it.'
const PAST_DUE_DATE_ERROR = 'Due date cannot be in the past.'
const LOAD_ERROR =
  'Failed to load your to-dos. Please check your connection and reload the page.'
const SAVE_ERROR =
  'Failed to save your to-do. Please check your connection and try again.'
const UPDATE_ERROR =
  'Failed to update your to-dos. Please check your connection and try again.'

export interface TodoAppDependencies {
  input: HTMLInputElement
  dateInput: HTMLInputElement
  addButton: HTMLButtonElement
  error: HTMLParagraphElement
  deleteAllButton: HTMLButtonElement
  repository: TodoRepository
  renderer: TodoListRenderer
  loadingIndicator: LoadingIndicator
}

export class TodoApp {
  private readonly input: HTMLInputElement
  private readonly dateInput: HTMLInputElement
  private readonly addButton: HTMLButtonElement
  private readonly error: HTMLParagraphElement
  private readonly deleteAllButton: HTMLButtonElement
  private readonly repository: TodoRepository
  private readonly renderer: TodoListRenderer
  private readonly loadingIndicator: LoadingIndicator

  constructor(dependencies: TodoAppDependencies) {
    this.input = dependencies.input
    this.dateInput = dependencies.dateInput
    this.addButton = dependencies.addButton
    this.error = dependencies.error
    this.deleteAllButton = dependencies.deleteAllButton
    this.repository = dependencies.repository
    this.renderer = dependencies.renderer
    this.loadingIndicator = dependencies.loadingIndicator

    this.addButton.addEventListener('click', () => this.addTodo())
    this.input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        this.addTodo()
      }
    })
    this.input.addEventListener('input', () => this.clearError())
    this.dateInput.addEventListener('input', () => this.clearError())
    this.deleteAllButton.addEventListener('click', () => this.handleClearAll())
  }

  async init(): Promise<void> {
    this.loadingIndicator.show()
    try {
      await this.repository.load()
      this.refresh()
    } catch {
      this.showError(LOAD_ERROR)
    } finally {
      this.loadingIndicator.hide()
    }
  }

  private async addTodo(): Promise<void> {
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

    await this.runMutation(async () => {
      await this.repository.add(text, dueDate)
      this.input.value = ''
      this.dateInput.value = ''
      this.clearError()
    }, SAVE_ERROR)
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
    void this.runMutation(() => this.repository.toggle(id), UPDATE_ERROR)
  }

  private handleRemove(id: number): void {
    void this.runMutation(() => this.repository.remove(id), UPDATE_ERROR)
  }

  private handleClearAll(): void {
    void this.runMutation(() => this.repository.clear(), UPDATE_ERROR)
  }

  private async runMutation(
    action: () => Promise<void>,
    errorMessage: string,
  ): Promise<void> {
    this.loadingIndicator.show()
    try {
      await action()
      this.refresh()
    } catch {
      this.showError(errorMessage)
    } finally {
      this.loadingIndicator.hide()
    }
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
