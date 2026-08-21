import type { LoadingIndicator } from '../ui/LoadingIndicator.ts'
import type { CategoryRepository } from './CategoryRepository.ts'
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
  categorySelect: HTMLSelectElement
  addButton: HTMLButtonElement
  error: HTMLParagraphElement
  deleteAllButton: HTMLButtonElement
  repository: TodoRepository
  categoryRepository: CategoryRepository
  renderer: TodoListRenderer
  loadingIndicator: LoadingIndicator
}

export class TodoApp {
  private readonly input: HTMLInputElement
  private readonly dateInput: HTMLInputElement
  private readonly categorySelect: HTMLSelectElement
  private readonly addButton: HTMLButtonElement
  private readonly error: HTMLParagraphElement
  private readonly deleteAllButton: HTMLButtonElement
  private readonly repository: TodoRepository
  private readonly categoryRepository: CategoryRepository
  private readonly renderer: TodoListRenderer
  private readonly loadingIndicator: LoadingIndicator

  constructor(dependencies: TodoAppDependencies) {
    this.input = dependencies.input
    this.dateInput = dependencies.dateInput
    this.categorySelect = dependencies.categorySelect
    this.addButton = dependencies.addButton
    this.error = dependencies.error
    this.deleteAllButton = dependencies.deleteAllButton
    this.repository = dependencies.repository
    this.categoryRepository = dependencies.categoryRepository
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
    this.populateCategoryOptions()

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

  private populateCategoryOptions(): void {
    for (const category of this.categoryRepository.getAll()) {
      const option = document.createElement('option')
      option.value = String(category.id)
      option.textContent = category.name
      this.categorySelect.append(option)
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

    const categoryId = this.readCategoryId()

    await this.runMutation(async () => {
      await this.repository.add(text, dueDate, categoryId)
      this.input.value = ''
      this.dateInput.value = ''
      this.categorySelect.value = ''
      this.clearError()
    }, SAVE_ERROR)
  }

  private readCategoryId(): number | undefined {
    const raw = this.categorySelect.value
    return raw === '' ? undefined : Number(raw)
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
    this.renderer.render(
      this.repository.getAll(),
      this.categoryRepository.getAll(),
      {
        onToggle: (id) => this.handleToggle(id),
        onRemove: (id) => this.handleRemove(id),
      },
    )
  }
}
