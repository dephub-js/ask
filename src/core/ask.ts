import { logger } from '@dephub/logger';

import { prompt } from './prompt.js';

/**
 * Options for configuring user input prompts
 * @interface AskOptions
 */
export interface AskOptions {
  /** Default value if input is empty */
  defaultValue?: string;
  /** Maximum validation attempts before throwing */
  maxAttempts?: number;
  /** Require non-empty input */
  required?: boolean;
  /** Hide user input (for passwords) */
  silent?: boolean;
  /** Validation function - return true if valid, error message if invalid */
  validate?: (input: string) => boolean | Promise<boolean | string> | string;
}

/**
 * Prompts the user for input with validation and configuration options
 * @param message - Prompt message to display
 * @param options - Configuration options for the prompt
 * @returns User input as string
 * @throws {Error} When required input is missing or validation fails after max attempts
 * @example
 * ```typescript
 * // Basic usage
 * const name = await ask('Enter your name: ');
 *
 * // With validation
 * const age = await ask('Enter your age: ', {
 *   validate: (input) => {
 *     const num = Number(input);
 *     return num >= 18 || 'Must be 18 or older';
 *   },
 *   maxAttempts: 3
 * });
 *
 * // With default value
 * const env = await ask('Environment: ', { defaultValue: 'development' });
 * ```
 */
export const ask = async (
  message: string = '> ',
  options: AskOptions = {},
): Promise<string> => {
  const {
    defaultValue = '',
    maxAttempts = Infinity,
    required = false,
    silent = false,
    validate,
  } = options;

  let input = await prompt(message, silent);

  // Handle empty input
  if (input.length === 0) {
    if (required && !defaultValue) {
      throw new Error('This field is required. Please enter a value.');
    }
    input = defaultValue;
  }

  // Skip validation if no validator provided
  if (!validate) {
    return input;
  }

  // Recursive validation with attempt tracking
  const validateRecursively = async (attempt: number): Promise<string> => {
    const validationResult = await validate(input);

    if (validationResult === true) {
      return input;
    }

    if (attempt >= maxAttempts) {
      throw new Error(
        typeof validationResult === 'string'
          ? `Validation failed: ${validationResult}`
          : 'Maximum validation attempts reached.',
      );
    }

    logger.log(
      typeof validationResult === 'string'
        ? validationResult
        : 'Invalid input. Please try again.',
    );

    input = await prompt(message, silent);
    return validateRecursively(attempt + 1);
  };

  return validateRecursively(1);
};
