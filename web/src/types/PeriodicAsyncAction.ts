// TODO: If not being used, remove it:
export class PeriodicAsyncAction<T> {
  private active: boolean
  private acting: boolean
  private immediate: boolean
  private timeout: any

  constructor(
    private readonly setup: {
      readonly successInterval: number
      readonly failureInterval?: number
      readonly action: () => Promise<T>
      readonly onSuccess?: (resolved: T, active?: boolean) => void
      readonly onFailure?: (error: any, active?: boolean) => void
      readonly initiallyStarted?: boolean
    }
  ) {
    this.active = false
    this.acting = false
    this.immediate = false

    if (setup.initiallyStarted) {
      this.start()
    }
  }

  start(): void {
    if (this.active) return
    this.active = true
    this.act()
  }

  stop(): void {
    if (!this.active) return
    this.active = false
    this.acting = false
    clearTimeout(this.timeout)
  }

  setStatus(active: boolean): void {
    if (active) {
      this.start()
    } else {
      this.stop()
    }
  }

  actImmediate(): void {
    if (!this.active) return
    if (this.acting) {
      this.immediate = true
      return
    }
    clearTimeout(this.timeout)
    this.act()
  }

  private async act(): Promise<void> {
    const { immediate } = this
    this.immediate = false
    try {
      this.acting = true
      const resolved = await this.setup.action()
      this.acting = false
      this.setup.onSuccess?.(resolved, this.active)
      if (this.active) {
        this.timeout = setTimeout(() => this.act(), immediate ? 0 : this.setup.successInterval)
      }
    } catch (error) {
      this.setup.onFailure?.(error, this.active)
      if (this.active) {
        this.timeout = setTimeout(
          () => this.act(),
          immediate ? 0 : this.setup.failureInterval ?? this.setup.successInterval
        )
      }
    }
  }
}
