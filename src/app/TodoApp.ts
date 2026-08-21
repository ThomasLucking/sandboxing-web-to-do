import { Todo } from '../models/Todo.ts'
import type { TodoStorage } from '../storage/TodoStorage.ts'

const EMPTY_TODO_ERROR = 'Please enter a to-do item before adding it.'
const PAST_DUE_DATE_ERROR = 'Due date cannot be in the past.'
const OVERDUE_MESSAGE = 'You have overdue to-dos that need attention.'

export class TodoApp {
  private readonly todos: Todo[] = []
  private readonly input: HTMLInputElement
  private readonly dateInput: HTMLInputElement
  private readonly addButton: HTMLButtonElement
  private readonly list: HTMLUListElement
  private readonly error: HTMLParagraphElement
  private readonly deleteAllButton: HTMLButtonElement
  private readonly overdueMessage: HTMLParagraphElement
  private readonly storage: TodoStorage

  constructor(
    input: HTMLInputElement,
    dateInput: HTMLInputElement,
    addButton: HTMLButtonElement,
    list: HTMLUListElement,
    error: HTMLParagraphElement,
    deleteAllButton: HTMLButtonElement,
    overdueMessage: HTMLParagraphElement,
    storage: TodoStorage,
  ) {
    this.input = input
    this.dateInput = dateInput
    this.addButton = addButton
    this.list = list
    this.error = error
    this.deleteAllButton = deleteAllButton
    this.overdueMessage = overdueMessage
    this.storage = storage

    this.addButton.addEventListener('click', () => this.addTodo())
    this.input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        this.addTodo()
      }
    })
    this.input.addEventListener('input', () => this.clearError())
    this.dateInput.addEventListener('input', () => this.clearError())
    this.deleteAllButton.addEventListener('click', () => this.clearAll())

    this.todos.push(...this.storage.load())
    this.render()
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

    this.todos.push(new Todo(text, undefined, false, dueDate))
    this.storage.save(this.todos)
    this.input.value = ''
    this.dateInput.value = ''
    this.clearError()
    this.render()
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

  private toggleTodo(id: number): void {
    const todo = this.todos.find((t) => t.id === id)

    if (!todo) {
      return
    }

    todo.completed = !todo.completed
    this.storage.save(this.todos)
    this.render()
  }

  private removeTodo(id: number): void {
    const index = this.todos.findIndex((t) => t.id === id)

    if (index === -1) {
      return
    }

    this.todos.splice(index, 1)
    this.storage.save(this.todos)
    this.render()
  }

  private clearAll(): void {
    this.todos.splice(0, this.todos.length)
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
    this.updateOverdueMessage()
  }

  private isOverdue(todo: Todo): boolean {
    if (!todo.dueDate || todo.completed) {
      return false
    }

    return (
      Temporal.PlainDate.compare(todo.dueDate, Temporal.Now.plainDateISO()) < 0
    )
  }

  private updateOverdueMessage(): void {
    const hasOverdueTodo = this.todos.some((todo) => this.isOverdue(todo))

    this.overdueMessage.hidden = !hasOverdueTodo
    this.overdueMessage.textContent = hasOverdueTodo ? OVERDUE_MESSAGE : ''
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

    const dueDateParagraph = this.createDueDateElement(todo)

    const removeButton = document.createElement('button')
    removeButton.type = 'button'
    removeButton.className = 'remove-todo-button'
    removeButton.textContent = '×'
    removeButton.setAttribute('aria-label', `Remove "${todo.text}"`)
    removeButton.addEventListener('click', () => this.removeTodo(todo.id))

    item.append(checkbox, label, dueDateParagraph, removeButton)
    return item
  }

  private createDueDateElement(todo: Todo): HTMLParagraphElement {
    const paragraph = document.createElement('p')
    paragraph.className = 'todo-due-date'

    if (todo.dueDate) {
      paragraph.classList.add(this.getDueDateUrgencyClass(todo.dueDate))

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

  private getDueDateUrgencyClass(dueDate: Temporal.PlainDate): string {
    const daysUntilDue = Temporal.Now.plainDateISO().until(dueDate, {
      largestUnit: 'days',
    }).days

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
