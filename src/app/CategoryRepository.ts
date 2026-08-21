import type { CategoryApiClient } from '../api/CategoryApiClient.ts'
import type { Category } from '../models/Category.ts'

export class CategoryRepository {
  private readonly api: CategoryApiClient
  private readonly categories: Category[] = []

  constructor(api: CategoryApiClient) {
    this.api = api
  }

  async load(): Promise<void> {
    const categories = await this.api.getAll()
    this.categories.splice(0, this.categories.length, ...categories)
  }

  getAll(): readonly Category[] {
    return this.categories
  }

  async add(name: string, color: string): Promise<void> {
    const category = await this.api.create(name, color)
    this.categories.push(category)
  }

  async update(
    id: number,
    changes: Partial<{ name: string; color: string }>,
  ): Promise<void> {
    const updated = await this.api.update(id, changes)
    const index = this.categories.findIndex((c) => c.id === id)

    if (index !== -1) {
      this.categories.splice(index, 1, updated)
    }
  }

  async remove(id: number): Promise<void> {
    await this.api.remove(id)
    const index = this.categories.findIndex((c) => c.id === id)

    if (index !== -1) {
      this.categories.splice(index, 1)
    }
  }
}
