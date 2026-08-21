let nextId = 1

export class Todo {
  readonly id: number
  readonly text: string
  completed: boolean
  readonly dueDate?: Temporal.PlainDate

  constructor(
    text: string,
    id?: number,
    completed = false,
    dueDate?: Temporal.PlainDate,
  ) {
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
    this.dueDate = dueDate
  }

  static hydrate(data: {
    id: number
    text: string
    completed: boolean
    dueDate?: Temporal.PlainDate
  }): Todo {
    return new Todo(data.text, data.id, data.completed, data.dueDate)
  }
}
