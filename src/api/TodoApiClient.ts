import { Todo } from '../models/Todo.ts'

const API_BASE_URL = 'https://api.todos.in.jt-lab.ch'
const RETURN_REPRESENTATION_HEADERS = { Prefer: 'return=representation' }
const JSON_CONTENT_TYPE_HEADER = { 'Content-Type': 'application/json' }

/**
 * ASSUMED SCHEMA — verify against https://swagger.todos.in.jt-lab.ch/ and
 * adjust field names below if they differ.
 *
 * The live API host (api.todos.in.jt-lab.ch) is only reachable from the
 * school network, so this could not be verified from this sandbox. This
 * assumes a standard PostgREST convention: a `todos` table/resource with
 * columns `id` (integer, primary key, server-generated), `text` (text),
 * `completed` (boolean) and `due_date` (date, nullable).
 */
interface TodoRecord {
  id: number
  text: string
  completed: boolean
  due_date: string | null
}

export class TodoApiClient {
  private readonly baseUrl: string

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
  }

  async getAll(): Promise<Todo[]> {
    const response = await fetch(`${this.baseUrl}/todos`)
    await this.assertOk(response, 'Failed to fetch to-dos')
    const records: TodoRecord[] = await response.json()
    return records.map((record) => this.toTodo(record))
  }

  async create(
    text: string,
    dueDate: Temporal.PlainDate | undefined,
  ): Promise<Todo> {
    const response = await fetch(`${this.baseUrl}/todos`, {
      method: 'POST',
      headers: {
        ...JSON_CONTENT_TYPE_HEADER,
        ...RETURN_REPRESENTATION_HEADERS,
      },
      body: JSON.stringify({
        text,
        completed: false,
        due_date: dueDate ? dueDate.toString() : null,
      }),
    })
    await this.assertOk(response, 'Failed to create to-do')
    const [record]: TodoRecord[] = await response.json()
    return this.toTodo(record)
  }

  async updateCompleted(id: number, completed: boolean): Promise<Todo> {
    const response = await fetch(`${this.baseUrl}/todos?id=eq.${id}`, {
      method: 'PATCH',
      headers: {
        ...JSON_CONTENT_TYPE_HEADER,
        ...RETURN_REPRESENTATION_HEADERS,
      },
      body: JSON.stringify({ completed }),
    })
    await this.assertOk(response, 'Failed to update to-do')
    const [record]: TodoRecord[] = await response.json()
    return this.toTodo(record)
  }

  async remove(id: number): Promise<void> {
    const response = await fetch(`${this.baseUrl}/todos?id=eq.${id}`, {
      method: 'DELETE',
    })
    await this.assertOk(response, 'Failed to delete to-do')
  }

  async removeAll(): Promise<void> {
    // PostgREST requires a filter on bulk mutations by default, so
    // `id=gt.0` is used to match every real row (ids are positive
    // server-generated integers).
    const response = await fetch(`${this.baseUrl}/todos?id=gt.0`, {
      method: 'DELETE',
    })
    await this.assertOk(response, 'Failed to delete all to-dos')
  }

  private async assertOk(response: Response, message: string): Promise<void> {
    if (!response.ok) {
      throw new Error(`${message} (status ${response.status})`)
    }
  }

  private toTodo(record: TodoRecord): Todo {
    return Todo.hydrate({
      id: record.id,
      text: record.text,
      completed: record.completed,
      dueDate: record.due_date
        ? Temporal.PlainDate.from(record.due_date)
        : undefined,
    })
  }
}
