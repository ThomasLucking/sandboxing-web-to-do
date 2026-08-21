export class LoadingIndicator {
  private pendingCount = 0

  constructor(private readonly element: HTMLElement) {}

  show(): void {
    this.pendingCount += 1
    this.element.hidden = false
  }

  hide(): void {
    this.pendingCount = Math.max(0, this.pendingCount - 1)
    this.element.hidden = this.pendingCount === 0
  }
}
