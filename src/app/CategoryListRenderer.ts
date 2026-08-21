import type { Category } from '../models/Category.ts'

export interface CategoryListHandlers {
  onUpdate: (id: number, changes: { name?: string; color?: string }) => void
  onRemove: (id: number) => void
}

export class CategoryListRenderer {
  private readonly list: HTMLUListElement

  constructor(list: HTMLUListElement) {
    this.list = list
  }

  render(
    categories: readonly Category[],
    handlers: CategoryListHandlers,
  ): void {
    const elements = categories.map((category) =>
      this.createCategoryElement(category, handlers),
    )
    this.list.replaceChildren(...elements)
  }

  private createCategoryElement(
    category: Category,
    handlers: CategoryListHandlers,
  ): HTMLLIElement {
    const item = document.createElement('li')
    item.dataset.id = String(category.id)

    const swatch = document.createElement('span')
    swatch.className = 'category-swatch'
    swatch.style.backgroundColor = category.color

    const nameInput = document.createElement('input')
    nameInput.type = 'text'
    nameInput.value = category.name
    nameInput.addEventListener('change', () => {
      const newName = nameInput.value.trim()

      if (newName.length === 0) {
        nameInput.value = category.name
        return
      }

      handlers.onUpdate(category.id, { name: newName })
    })

    const colorInput = document.createElement('input')
    colorInput.type = 'color'
    colorInput.value = category.color
    colorInput.addEventListener('change', () => {
      handlers.onUpdate(category.id, { color: colorInput.value })
    })

    const removeButton = document.createElement('button')
    removeButton.type = 'button'
    removeButton.className = 'remove-todo-button'
    removeButton.textContent = '×'
    removeButton.setAttribute(
      'aria-label',
      `Remove category "${category.name}"`,
    )
    removeButton.addEventListener('click', () => handlers.onRemove(category.id))

    item.append(swatch, nameInput, colorInput, removeButton)
    return item
  }
}
