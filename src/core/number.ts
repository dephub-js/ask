import { ask, type AskOptions } from './ask.js';

/**
 * Options for number prompts (excludes validate as it's handled internally)
 */
export type NumberOptions = Omit<AskOptions, 'validate'>;

/**
 * Prompts the user for numeric input with automatic validation
 * @param message - Prompt message for number input
 * @param options - Configuration options
 * @returns Parsed number from user input
 * @throws {Error} When input cannot be parsed as a number
 * @example
 * ```typescript
 * // Basic number input
 * const age = await number('Enter your age: ');
 *
 * // With range validation using ask directly
 * const score = await ask('Enter test score (0-100): ', {
 *   validate: (input) => {
 *     const num = Number(input);
 *     return (num >= 0 && num <= 100) || 'Please enter a number between 0 and 100';
 *   }
 * });
 * ```
 */
export const number = async (
  message: string = 'Enter a number: ',
  options: NumberOptions = {},
): Promise<number> => {
  const answer = await ask(message, {
    ...options,
    validate: (input: string) => {
      const num = Number(input);

      return !isNaN(num) || 'Please enter a valid number';
    },
  });

  return Number(answer);
};
