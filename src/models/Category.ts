export class Category {
  constructor(
    readonly id: number,
    readonly name: string,
    readonly color: string,
  ) {}

  static hydrate(data: { id: number; name: string; color: string }): Category {
    return new Category(data.id, data.name, data.color)
  }
}
