/**
 * Watches real frame times and reports when the device keeps missing the
 * budget. Uses an exponential moving average so single hitches are ignored.
 */
export class FrameBudget {
  private average = 1000 / 60;
  private overBudgetFrames = 0;
  private warmup = 30;

  constructor(
    private readonly budgetMs: number,
    private readonly patienceFrames: number,
    private readonly onExceeded: () => void,
  ) {}

  sample(deltaMs: number): void {
    // Ignore the first frames (shader compile, layout) and tab-switch gaps.
    if (this.warmup > 0) {
      this.warmup -= 1;
      return;
    }
    if (deltaMs > 250) return;

    this.average = this.average * 0.92 + deltaMs * 0.08;
    this.overBudgetFrames =
      this.average > this.budgetMs ? this.overBudgetFrames + 1 : 0;

    if (this.overBudgetFrames >= this.patienceFrames) {
      this.reset();
      this.onExceeded();
    }
  }

  reset(): void {
    this.average = 1000 / 60;
    this.overBudgetFrames = 0;
    this.warmup = 30;
  }
}
