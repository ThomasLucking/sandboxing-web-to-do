import type { LoadingIndicator } from '../ui/LoadingIndicator.ts'
import type { CategoryListRenderer } from './CategoryListRenderer.ts'
import type { CategoryRepository } from './CategoryRepository.ts'

const EMPTY_CATEGORY_NAME_ERROR =
  'Please enter a category name before adding it.'
const LOAD_ERROR =
  'Failed to load your categories. Please check your connection and reload the page.'
const SAVE_ERROR =
  'Failed to save your category. Please check your connection and try again.'
const UPDATE_ERROR =
  'Failed to update your categories. Please check your connection and try again.'

export interface CategoryManagerDependencies {
  nameInput: HTMLInputElement
  colorInput: HTMLInputElement
  addButton: HTMLButtonElement
  error: HTMLParagraphElement
  repository: CategoryRepository
  renderer: CategoryListRenderer
  loadingIndicator: LoadingIndicator
}

export class CategoryManager {
  private readonly nameInput: HTMLInputElement
  private readonly colorInput: HTMLInputElement
  private readonly addButton: HTMLButtonElement
  private readonly error: HTMLParagraphElement
  private readonly repository: CategoryRepository
  private readonly renderer: CategoryListRenderer
  private readonly loadingIndicator: LoadingIndicator

  constructor(dependencies: CategoryManagerDependencies) {
    this.nameInput = dependencies.nameInput
    this.colorInput = dependencies.colorInput
    this.addButton = dependencies.addButton
    this.error = dependencies.error
    this.repository = dependencies.repository
    this.renderer = dependencies.renderer
    this.loadingIndicator = dependencies.loadingIndicator

    this.addButton.addEventListener('click', () => this.addCategory())
    this.nameInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        this.addCategory()
      }
    })
    this.nameInput.addEventListener('input', () => this.clearError())
    this.colorInput.addEventListener('input', () => this.clearError())
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

  private async addCategory(): Promise<void> {
    const name = this.nameInput.value.trim()

    if (name.length === 0) {
      this.showError(EMPTY_CATEGORY_NAME_ERROR)
      return
    }

    const color = this.colorInput.value

    await this.runMutation(async () => {
      await this.repository.add(name, color)
      this.nameInput.value = ''
      this.clearError()
    }, SAVE_ERROR)
  }

  private handleUpdate(
    id: number,
    changes: { name?: string; color?: string },
  ): void {
    void this.runMutation(
      () => this.repository.update(id, changes),
      UPDATE_ERROR,
    )
  }

  private handleRemove(id: number): void {
    void this.runMutation(() => this.repository.remove(id), UPDATE_ERROR)
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
      onUpdate: (id, changes) => this.handleUpdate(id, changes),
      onRemove: (id) => this.handleRemove(id),
    })
  }
}
