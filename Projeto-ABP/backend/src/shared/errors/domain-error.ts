/**
 * Domain error for application-level failures.
 * message: user-facing text in Portuguese.
 * code: UPPER_SNAKE_CASE identifier for logging and programmatic handling.
 */
export class DomainError extends Error {
  readonly code: string;

  constructor(message: string, code: string) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    this.name = this.constructor.name;
    this.code = code;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
