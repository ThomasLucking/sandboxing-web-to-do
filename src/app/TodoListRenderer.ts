import type { Category } from '../models/Category.ts'
import type { Todo } from '../models/Todo.ts'

const OVERDUE_MESSAGE = 'You have overdue to-dos that need attention.'

export interface TodoListHandlers {
  onToggle: (id: number) => void
  onRemove: (id: number) => void
}

export class TodoListRenderer {
  private readonly list: HTMLUListElement
  private readonly overdueMessage: HTMLParagraphElement

  constructor(list: HTMLUListElement, overdueMessage: HTMLParagraphElement) {
    this.list = list
    this.overdueMessage = overdueMessage
  }

  renderList(
    todos: readonly Todo[],
    categories: readonly Category[],
    handlers: TodoListHandlers,
  ): void {
    const elements = todos.map((todo) => {
      const daysUntilDue = todo.dueDate
        ? this.getDaysUntilDue(todo.dueDate)
        : undefined

      return this.createTodoElement(todo, daysUntilDue, categories, handlers)
    })

    this.list.replaceChildren(...elements)
  }

  updateOverdueBanner(allTodos: readonly Todo[]): void {
    const hasOverdueTodo = allTodos.some((todo) => {
      const daysUntilDue = todo.dueDate
        ? this.getDaysUntilDue(todo.dueDate)
        : undefined

      return this.isOverdue(todo, daysUntilDue)
    })

    this.updateOverdueMessage(hasOverdueTodo)
  }

  private getDaysUntilDue(dueDate: Temporal.PlainDate): number {
    return Temporal.Now.plainDateISO().until(dueDate, {
      largestUnit: 'days',
    }).days
  }

  private isOverdue(todo: Todo, daysUntilDue: number | undefined): boolean {
    if (daysUntilDue === undefined || todo.completed) {
      return false
    }

    return daysUntilDue < 0
  }

  private updateOverdueMessage(hasOverdueTodo: boolean): void {
    this.overdueMessage.hidden = !hasOverdueTodo
    this.overdueMessage.textContent = hasOverdueTodo ? OVERDUE_MESSAGE : ''
  }

  private createTodoElement(
    todo: Todo,
    daysUntilDue: number | undefined,
    categories: readonly Category[],
    handlers: TodoListHandlers,
  ): HTMLLIElement {
    const item = document.createElement('li')
    item.dataset.id = String(todo.id)
    item.classList.toggle('completed', todo.completed)

    const category =
      todo.categoryId !== undefined
        ? categories.find((c) => c.id === todo.categoryId)
        : undefined

    if (category) {
      item.style.borderColor = category.color
    }

    const checkbox = document.createElement('input')
    checkbox.type = 'checkbox'
    checkbox.checked = todo.completed
    checkbox.addEventListener('change', () => handlers.onToggle(todo.id))

    const label = document.createElement('span')
    label.textContent = todo.text

    const categoryParagraph = this.createCategoryLabelElement(category)
    const dueDateParagraph = this.createDueDateElement(todo, daysUntilDue)

    const removeButton = document.createElement('button')
    removeButton.type = 'button'
    removeButton.className = 'remove-todo-button'
    removeButton.textContent = '×'
    removeButton.setAttribute('aria-label', `Remove "${todo.text}"`)
    removeButton.addEventListener('click', () => handlers.onRemove(todo.id))

    item.append(
      checkbox,
      label,
      categoryParagraph,
      dueDateParagraph,
      removeButton,
    )
    return item
  }

  private createCategoryLabelElement(
    category: Category | undefined,
  ): HTMLParagraphElement {
    const paragraph = document.createElement('p')
    paragraph.className = 'todo-category'
    paragraph.textContent = category ? category.name : 'no category'
    return paragraph
  }

  private createDueDateElement(
    todo: Todo,
    daysUntilDue: number | undefined,
  ): HTMLParagraphElement {
    const paragraph = document.createElement('p')
    paragraph.className = 'todo-due-date'

    if (todo.dueDate && daysUntilDue !== undefined) {
      paragraph.classList.add(this.getDueDateUrgencyClass(daysUntilDue))

      const dueDateText = todo.dueDate.toString()
      const time = document.createElement('time')
      time.dateTime = dueDateText
      time.textContent = dueDateText
      paragraph.append(time)
    } else {
      paragraph.textContent = 'no due date'
    }

    return paragraph
  }

  private getDueDateUrgencyClass(daysUntilDue: number): string {
    if (daysUntilDue < 0) {
      return 'todo-due-date--overdue'
    }

    if (daysUntilDue === 0) {
      return 'todo-due-date--today'
    }

    if (daysUntilDue <= 4) {
      return 'todo-due-date--soon'
    }

    return 'todo-due-date--later'
  }
}
