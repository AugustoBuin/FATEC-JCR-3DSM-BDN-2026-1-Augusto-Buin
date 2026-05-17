export abstract class ValueObject<T extends object> {
  protected readonly props: T;

  constructor(props: T) {
    this.props = Object.freeze({ ...props });
  }

  equals(other: ValueObject<T>): boolean {
    if (other == null) return false;
    if (other.constructor !== this.constructor) return false;
    return this.shallowEqual(
      this.props as Record<string, unknown>,
      other.props as Record<string, unknown>,
    );
  }

  protected shallowEqual(
    a: Record<string, unknown>,
    b: Record<string, unknown>,
  ): boolean {
    const keysA = Object.keys(a);
    if (keysA.length !== Object.keys(b).length) return false;
    return keysA.every((key) => this.equalsValue(a[key], b[key]));
  }

  protected equalsValue(a: unknown, b: unknown): boolean {
    if (a instanceof Date && b instanceof Date)
      return a.getTime() === b.getTime();
    return a === b;
  }
}
