import process from 'process';
import readline from 'readline';

/**
 * Low-level function to prompt the user for input
 * @param message - Prompt message (default: '> ')
 * @param silent - If true, hides input by showing asterisks (default: false)
 * @returns User input as a string
 * @throws Error if input processing fails
 */
export const prompt = async (
  message: string = '> ',
  silent = false,
): Promise<string> => {
  if (!silent) {
    return new Promise((resolve, reject) => {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      rl.question(message, (input) => {
        rl.close();
        resolve(input);
      });

      rl.on('error', (err) => {
        rl.close();
        reject(new Error(err.message));
      });

      rl.on('SIGINT', () => {
        rl.close();
        process.stdout.write('\n');
        process.exit(0);
      });
    });
  }

  return new Promise((resolve, reject) => {
    let input = '';
    let isResolved = false;

    const cleanup = () => {
      if (!isResolved) {
        isResolved = true;
        process.stdin.setRawMode(false);
        process.stdin.removeListener('data', onData);
        process.stdin.removeListener('error', onError);
        clearTimeout(timeout);

        // Just pause if there are no more listeners
        if (process.stdin.listenerCount('data') === 0) {
          process.stdin.pause();
        }
      }
    };

    const onData = (data: Buffer) => {
      try {
        const char = data.toString('utf8');

        if (char === '\r' || char === '\n') {
          cleanup();
          process.stdout.write('\n');
          resolve(input);
        } else if (char === '\u0003') {
          cleanup();
          process.stdout.write('\n');
          process.exit(0);
        } else if (char === '\b' || char === '\u007f') {
          if (input.length > 0) {
            // Improved backspace handling for multi-byte characters
            const lastCharLength = Array.from(input).pop()?.length ?? 1;
            input = input.slice(0, -lastCharLength);
            process.stdout.write('\b \b');
          }
        } else if (char.charCodeAt(0) >= 32 || char.length > 1) {
          // Accept printable characters OR multi-byte characters (emoji, etc.)
          input += char;
          process.stdout.write('*');
        }
      } catch (error) {
        cleanup();
        reject(
          new Error(error instanceof Error ? error.message : String(error)),
        );
      }
    };

    const onError = (err: Error) => {
      cleanup();
      reject(new Error(err.message));
    };

    const timeout = setTimeout(() => {
      cleanup();
      reject(new Error('Input timeout after 5 minutes'));
    }, 300000);

    process.stdin.setEncoding('utf8');

    if (process.stdin.isPaused()) {
      process.stdin.resume();
    }

    process.stdout.write(message);
    process.stdin.setRawMode(true);

    process.stdin.on('data', onData);
    process.stdin.on('error', onError);
  });
};
