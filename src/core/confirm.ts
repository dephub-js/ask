import { ask, type AskOptions } from './ask.ts';

/**
 * Options for confirmation prompts (excludes validate as it's handled internally)
 */
export type ConfirmOptions = Omit<AskOptions, 'validate'>;

/**
 * Prompts the user for a yes/no confirmation
 * @param message - Confirmation prompt message
 * @param options - Configuration options
 * @returns True for affirmative answers ('y', 'yes'), false for negative ('n', 'no')
 * @example
 * ```typescript
 * // Basic confirmation
 * const shouldDelete = await confirm('Delete this file?');
 * if (shouldDelete) {
 *   await deleteFile();
 * }
 *
 * // With custom message and default
 * const proceed = await confirm('Continue with deployment?', {
 *   defaultValue: 'n'
 * });
 * ```
 */
export const confirm = async (
  message: string = 'Are you sure? (y/n): ',
  options: ConfirmOptions = {},
): Promise<boolean> => {
  const answer = await ask(message, {
    ...options,
    validate: (input: string) => {
      const normalized = input.trim().toLowerCase();
      if (['', 'n', 'no', 'y', 'yes'].includes(normalized)) {
        return true;
      }
      return 'Please answer with y/yes or n/no';
    },
  });

  const normalizedAnswer = answer.trim().toLowerCase();

  return ['y', 'yes'].includes(normalizedAnswer);
};
