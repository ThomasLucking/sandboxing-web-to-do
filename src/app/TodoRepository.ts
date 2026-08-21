import type { Todo } from '../models/Todo.ts'
import type { TodoStorage } from '../storage/TodoStorage.ts'

export class TodoRepository {
  private readonly storage: TodoStorage
  private readonly todos: Todo[] = []

  constructor(storage: TodoStorage) {
    this.storage = storage
    this.todos.push(...this.storage.load())
  }

  getAll(): readonly Todo[] {
    return this.todos
  }

  add(todo: Todo): void {
    this.todos.push(todo)
    this.persist()
  }

  toggle(id: number): void {
    const todo = this.todos.find((t) => t.id === id)

    if (!todo) {
      return
    }

    todo.completed = !todo.completed
    this.persist()
  }

  remove(id: number): void {
    const index = this.todos.findIndex((t) => t.id === id)

    if (index === -1) {
      return
    }

    this.todos.splice(index, 1)
    this.persist()
  }

  clear(): void {
    this.todos.splice(0, this.todos.length)
    this.persist()
  }

  private persist(): void {
    this.storage.save(this.todos)
  }
}
