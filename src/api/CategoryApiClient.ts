import { Category } from '../models/Category.ts'

const API_BASE_URL = 'https://api.todos.in.jt-lab.ch'
const RETURN_REPRESENTATION_HEADERS = { Prefer: 'return=representation' }
const JSON_CONTENT_TYPE_HEADER = { 'Content-Type': 'application/json' }

/**
 * ASSUMED SCHEMA — verify against https://swagger.todos.in.jt-lab.ch/ and
 * adjust field names below if they differ.
 *
 * The live API host (api.todos.in.jt-lab.ch) is only reachable from the
 * school network, so this could not be verified from this sandbox. This
 * assumes a standard PostgREST convention: a `categories` table/resource
 * with columns `id` (integer, primary key, server-generated), `name`
 * (text) and `color` (text, hex string).
 */
interface CategoryRecord {
  id: number
  name: string
  color: string
}

export class CategoryApiClient {
  private readonly baseUrl: string

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
  }

  async getAll(): Promise<Category[]> {
    const response = await fetch(`${this.baseUrl}/categories`)
    await this.assertOk(response, 'Failed to fetch categories')
    const records: CategoryRecord[] = await response.json()
    return records.map((record) => this.toCategory(record))
  }

  async create(name: string, color: string): Promise<Category> {
    const response = await fetch(`${this.baseUrl}/categories`, {
      method: 'POST',
      headers: {
        ...JSON_CONTENT_TYPE_HEADER,
        ...RETURN_REPRESENTATION_HEADERS,
      },
      body: JSON.stringify({ name, color }),
    })
    await this.assertOk(response, 'Failed to create category')
    const [record]: CategoryRecord[] = await response.json()
    return this.toCategory(record)
  }

  async update(
    id: number,
    changes: Partial<{ name: string; color: string }>,
  ): Promise<Category> {
    const response = await fetch(`${this.baseUrl}/categories?id=eq.${id}`, {
      method: 'PATCH',
      headers: {
        ...JSON_CONTENT_TYPE_HEADER,
        ...RETURN_REPRESENTATION_HEADERS,
      },
      body: JSON.stringify(changes),
    })
    await this.assertOk(response, 'Failed to update category')
    const [record]: CategoryRecord[] = await response.json()
    return this.toCategory(record)
  }

  async remove(id: number): Promise<void> {
    const response = await fetch(`${this.baseUrl}/categories?id=eq.${id}`, {
      method: 'DELETE',
    })
    await this.assertOk(response, 'Failed to delete category')
  }

  private async assertOk(response: Response, message: string): Promise<void> {
    if (!response.ok) {
      throw new Error(`${message} (status ${response.status})`)
    }
  }

  private toCategory(record: CategoryRecord): Category {
    return Category.hydrate({
      id: record.id,
      name: record.name,
      color: record.color,
    })
  }
}
