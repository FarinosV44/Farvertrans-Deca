/**
 * Storage failures, in their own module so pure logic (and unit tests) can
 * reference the class without pulling in the `server-only` store.
 */
export class StorageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StorageError";
  }
}
