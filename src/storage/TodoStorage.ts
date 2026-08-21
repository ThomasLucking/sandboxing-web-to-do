import { Todo } from '../models/Todo.ts'

const STORAGE_KEY = 'todos'

interface StoredTodo {
  id: number
  text: string
  completed: boolean
}

function isStoredTodo(value: unknown): value is StoredTodo {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as StoredTodo).id === 'number' &&
    typeof (value as StoredTodo).text === 'string' &&
    typeof (value as StoredTodo).completed === 'boolean'
  )
}

export class TodoStorage {
  load(): Todo[] {
    const raw = localStorage.getItem(STORAGE_KEY)

    if (!raw) {
      return []
    }

    try {
      const parsed: unknown = JSON.parse(raw)
      if (!Array.isArray(parsed)) {
        return []
      }
      return parsed.filter(isStoredTodo).map((item) => Todo.hydrate(item))
    } catch {
      return []
    }
  }

  save(todos: Todo[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
  }
}
