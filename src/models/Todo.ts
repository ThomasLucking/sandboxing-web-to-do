let nextId = 1

export class Todo {
  readonly id: number
  readonly text: string
  completed: boolean

  constructor(text: string, id?: number, completed = false) {
    if (id === undefined) {
      this.id = nextId++
    } else {
      this.id = id
      if (id >= nextId) {
        nextId = id + 1
      }
    }
    this.text = text
    this.completed = completed
  }

  static hydrate(data: { id: number; text: string; completed: boolean }): Todo {
    return new Todo(data.text, data.id, data.completed)
  }
}
