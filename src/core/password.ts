import { ask, type AskOptions } from './ask.js';

/**
 * Options for password prompts (excludes silent as it's forced to true)
 */
export type PasswordOptions = Omit<AskOptions, 'silent'>;

/**
 * Prompts the user for password input with hidden characters
 * @param message - Prompt message for password
 * @param options - Configuration options
 * @returns Password string entered by user
 * @example
 * ```typescript
 * // Basic password prompt
 * const password = await password('Enter your password: ');
 *
 * // With confirmation
 * const password = await password('New password: ', { required: true });
 * const confirmPassword = await password('Confirm password: ', { required: true });
 *
 * if (password !== confirmPassword) {
 *   throw new Error('Passwords do not match');
 * }
 * ```
 */
export const password = async (
  message: string = 'Password: ',
  options: PasswordOptions = {},
): Promise<string> => ask(message, { ...options, silent: true });
