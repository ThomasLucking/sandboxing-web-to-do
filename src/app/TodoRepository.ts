import type { TodoApiClient } from '../api/TodoApiClient.ts'
import type { Todo } from '../models/Todo.ts'

export class TodoRepository {
  private readonly api: TodoApiClient
  private readonly todos: Todo[] = []

  constructor(api: TodoApiClient) {
    this.api = api
  }

  async load(): Promise<void> {
    const todos = await this.api.getAll()
    this.todos.splice(0, this.todos.length, ...todos)
  }

  getAll(): readonly Todo[] {
    return this.todos
  }

  async add(
    text: string,
    dueDate: Temporal.PlainDate | undefined,
  ): Promise<void> {
    const todo = await this.api.create(text, dueDate)
    this.todos.push(todo)
  }

  async toggle(id: number): Promise<void> {
    const todo = this.todos.find((t) => t.id === id)

    if (!todo) {
      return
    }

    const updated = await this.api.updateCompleted(id, !todo.completed)
    todo.completed = updated.completed
  }

  async remove(id: number): Promise<void> {
    await this.api.remove(id)
    const index = this.todos.findIndex((t) => t.id === id)

    if (index !== -1) {
      this.todos.splice(index, 1)
    }
  }

  async clear(): Promise<void> {
    await this.api.removeAll()
    this.todos.splice(0, this.todos.length)
  }
}
