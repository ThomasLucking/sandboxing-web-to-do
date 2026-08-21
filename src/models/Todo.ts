let nextId = 1

export class Todo {
  readonly id: number
  readonly text: string
  completed: boolean

  constructor(text: string) {
    this.id = nextId++
    this.text = text
    this.completed = false
  }
}
