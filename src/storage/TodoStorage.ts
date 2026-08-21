import { Todo } from '../models/Todo.ts'

const STORAGE_KEY = 'todos'

interface StoredTodo {
  id: number
  text: string
  completed: boolean
  dueDate?: string
}

function isStoredTodo(value: unknown): value is StoredTodo {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const candidate = value as StoredTodo

  if (
    typeof candidate.id !== 'number' ||
    typeof candidate.text !== 'string' ||
    typeof candidate.completed !== 'boolean'
  ) {
    return false
  }

  return (
    candidate.dueDate === undefined || typeof candidate.dueDate === 'string'
  )
}

function parseDueDate(
  value: string | undefined,
): Temporal.PlainDate | undefined {
  if (value === undefined) {
    return undefined
  }

  try {
    return Temporal.PlainDate.from(value)
  } catch {
    return undefined
  }
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
      return parsed.filter(isStoredTodo).map((item) =>
        Todo.hydrate({
          id: item.id,
          text: item.text,
          completed: item.completed,
          dueDate: parseDueDate(item.dueDate),
        }),
      )
    } catch {
      return []
    }
  }

  save(todos: Todo[]): void {
    const serializable: StoredTodo[] = todos.map((todo) => ({
      id: todo.id,
      text: todo.text,
      completed: todo.completed,
      ...(todo.dueDate ? { dueDate: todo.dueDate.toString() } : {}),
    }))
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable))
  }
}
