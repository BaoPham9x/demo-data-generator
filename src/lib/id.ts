import { nanoid } from "nanoid";

/**
 * Generate a unique identifier (12 characters)
 * Used for all primary keys in the demo data
 */
export function generateId(): string {
  return nanoid(12);
}
