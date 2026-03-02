# @dephub/ask ❓

> Interactive command-line prompts with validation and TypeScript support. Ask users questions, get validated answers.

[![NPM version](https://img.shields.io/npm/v/@dephub/ask.svg?style=flat)](https://npmjs.org/package/@dephub/ask)
[![ESM-only](https://img.shields.io/badge/ESM-only-brightgreen?style=flat)](https://nodejs.org/)

---

## Features ✨

- 🎯 **Simple API** - `ask()`, `confirm()`, `number()`, `password()`
- ✅ **Built-in Validation** - Automatic type checking and custom validators
- 🔒 **Type Safe** - Full TypeScript support with zero configuration
- 🎨 **User Friendly** - Sensible defaults and clear error messages
- ⚡ **Lightweight** - Minimal dependencies, focused functionality
- 🔧 **Flexible** - Custom validation, retry limits, default values

---

## Installation 📦

```bash
npm install @dephub/ask
# or
pnpm add @dephub/ask
# or
yarn add @dephub/ask
```

---

## Quick Start 🚀

```typescript
import { ask, confirm, number, password } from '@dephub/ask';

// Text input
const name = await ask('What is your name? ', { required: true });

// Yes/No confirmation
const shouldDelete = await confirm('Delete this file?');

// Number input
const age = await number('Enter your age: ');

// Password input (hidden typing)
const apiKey = await password('Enter API key: ');
```

---

## Usage Examples 🎯

### Basic Input with Validation

```typescript
import { ask } from '@dephub/ask';

const email = await ask('Enter your email: ', {
  required: true,
  validate: (input) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(input) || 'Please enter a valid email address';
  },
  maxAttempts: 3,
});
```

### Confirmation Dialogs

```typescript
import { confirm } from '@dephub/ask';

const shouldDeploy = await confirm('Deploy to production?', {
  defaultValue: 'n', // Default to 'no' for safety
});

if (shouldDeploy) {
  await deployToProduction();
} else {
  console.log('Deployment cancelled');
}
```

### Number Input with Range Checking

```typescript
import { number } from '@dephub/ask';

const score = await number('Enter test score (0-100): ', {
  validate: (input) => {
    const num = Number(input);
    return (num >= 0 && num <= 100) || 'Score must be between 0 and 100';
  },
});
```

### Password Input

```typescript
import { password } from '@dephub/ask';

const password = await password('Enter new password: ', {
  required: true,
  validate: (input) => {
    return input.length >= 8 || 'Password must be at least 8 characters';
  },
});

const confirmPassword = await password('Confirm password: ', {
  required: true,
});

if (password !== confirmPassword) {
  throw new Error('Passwords do not match');
}
```

### Advanced: Custom Workflow

```typescript
import { ask, confirm, number } from '@dephub/ask';

async function setupProject() {
  const projectName = await ask('Project name: ', { required: true });

  const useTypeScript = await confirm('Use TypeScript?');
  const packageManager = await ask('Package manager (npm/pnpm/yarn): ', {
    defaultValue: 'npm',
    validate: (input) =>
      ['npm', 'pnpm', 'yarn'].includes(input) || 'Must be npm, pnpm, or yarn',
  });

  const port = await number('Development port: ', {
    defaultValue: '3000',
  });

  return { projectName, useTypeScript, packageManager, port };
}

const config = await setupProject();
console.log('Project configuration:', config);
```

---

## API Reference 📚

### `ask(message, options)`

Main function for text input with validation.

**Parameters:**

- `message` (string) - Prompt message to display
- `options` (AskOptions) - Configuration options
  - `silent` (boolean) - Hide input (for passwords)
  - `required` (boolean) - Require non-empty input
  - `defaultValue` (string) - Default value if input empty
  - `validate` (function) - Validation function
  - `maxAttempts` (number) - Maximum validation attempts

**Returns:** `Promise<string>`

### `confirm(message, options)`

Yes/No confirmation prompt.

**Parameters:**

- `message` (string) - Confirmation message
- `options` (ConfirmOptions) - Options excluding `validate`

**Returns:** `Promise<boolean>`

### `number(message, options)`

Numeric input with automatic validation.

**Parameters:**

- `message` (string) - Prompt message
- `options` (NumberOptions) - Options excluding `validate`

**Returns:** `Promise<number>`

### `password(message, options)`

Hidden input for passwords and secrets.

**Parameters:**

- `message` (string) - Prompt message
- `options` (PasswordOptions) - Options excluding `silent`

**Returns:** `Promise<string>`

---

## Validation Examples 🔧

### Custom Validator Functions

```typescript
// Return true for valid, string error message for invalid
const validateAge = (input: string) => {
  const age = Number(input);
  if (isNaN(age)) return 'Please enter a valid number';
  if (age < 0) return 'Age cannot be negative';
  if (age > 150) return 'Please enter a realistic age';
  return true;
};

const age = await ask('Enter your age: ', {
  validate: validateAge,
  maxAttempts: 3,
});
```

### Async Validation

```typescript
const validateUsername = async (username: string) => {
  const isAvailable = await checkUsernameAvailability(username);
  return isAvailable || 'Username is already taken';
};

const username = await ask('Choose username: ', {
  validate: validateUsername,
});
```

---

## Common Patterns 🎨

### Required Fields with Defaults

```typescript
const environment = await ask('Environment: ', {
  required: true,
  defaultValue: 'development',
  validate: (input) =>
    ['development', 'staging', 'production'].includes(input) ||
    'Must be development, staging, or production',
});
```

### Conditional Prompts

```typescript
const useDatabase = await confirm('Add database?');

let databaseConfig = null;
if (useDatabase) {
  databaseConfig = {
    host: await ask('Database host: ', { defaultValue: 'localhost' }),
    port: await number('Database port: ', { defaultValue: '5432' }),
    name: await ask('Database name: ', { required: true }),
  };
}
```

### Retry Logic

```typescript
const apiKey = await ask('Enter API key: ', {
  required: true,
  validate: (input) =>
    input.startsWith('sk-') || 'API key must start with "sk-"',
  maxAttempts: 3, // Will throw error after 3 failed attempts
});
```

---

## Integration with Other DepHub Packages 🔗

```typescript
import { ask, confirm } from '@dephub/ask';
import { writeFile } from '@dephub/write';
import { readFile } from '@dephub/read';
import { log, error } from '@dephub/log';

async function createConfig() {
  try {
    const configPath = await ask('Config file path: ', {
      defaultValue: './config.json',
    });

    const config = {
      name: await ask('Project name: ', { required: true }),
      version: await ask('Version: ', { defaultValue: '1.0.0' }),
      port: await number('Port: ', { defaultValue: '3000' }),
    };

    await writeFile(configPath, JSON.stringify(config, null, 2));
    log('✅ Configuration file created successfully');
  } catch (err) {
    error('Failed to create config:', err.message);
  }
}
```

---

## License 📄

MIT License – see [LICENSE](LICENSE) for details.

**Author:** Estarlin R ([estarlincito.com](https://estarlincito.com))
