#!/usr/bin/env node

/**
 * Code Generation Script
 *
 * Generate boilerplate for screens, components, and hooks.
 *
 * Usage:
 *   node scripts/generate.js screen MyScreen
 *   node scripts/generate.js component MyComponent
 *   node scripts/generate.js hook useMyHook
 *
 * Or with npm scripts:
 *   pnpm generate screen MyScreen
 *   pnpm generate component MyComponent
 *   pnpm generate hook useMyHook
 */

const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function success(message) {
  log(`✓ ${message}`, 'green');
}

function warn(message) {
  log(`⚠ ${message}`, 'yellow');
}

function error(message) {
  log(`✗ ${message}`, 'red');
  process.exit(1);
}

function info(message) {
  log(`→ ${message}`, 'cyan');
}

// Ensure directory exists
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Convert to PascalCase
function toPascalCase(str) {
  return str
    .replace(/[-_](.)/g, (_, c) => c.toUpperCase())
    .replace(/^(.)/, (_, c) => c.toUpperCase());
}

// Convert to camelCase
function toCamelCase(str) {
  const pascal = toPascalCase(str);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

// Convert to kebab-case
function toKebabCase(str) {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

// ============================================
// TEMPLATES
// ============================================

const screenTemplate = (name) => `/**
 * ${name} Screen
 */

import React from 'react';
import { View, Text } from 'react-native';
import { Screen, ScreenHeader } from '@/components/ui';

export default function ${name}Screen() {
  return (
    <Screen>
      <ScreenHeader title="${name}" />
      <View className="flex-1 p-4">
        <Text className="text-foreground dark:text-foreground-dark">
          ${name} screen content
        </Text>
      </View>
    </Screen>
  );
}
`;

const tabScreenTemplate = (name) => `/**
 * ${name} Tab Screen
 */

import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Screen } from '@/components/ui';

export default function ${name}Screen() {
  return (
    <Screen scrollable>
      <View className="p-4">
        <Text className="text-2xl font-bold text-foreground dark:text-foreground-dark mb-4">
          ${name}
        </Text>
        <Text className="text-foreground-muted dark:text-foreground-dark-muted">
          ${name} tab content goes here.
        </Text>
      </View>
    </Screen>
  );
}
`;

const componentTemplate = (name) => `/**
 * ${name} Component
 *
 * @example
 * <${name} />
 */

import React from 'react';
import { View, Text, type ViewStyle } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';

export interface ${name}Props {
  className?: string;
  style?: ViewStyle;
  testID?: string;
}

export function ${name}({
  className = '',
  style,
  testID,
}: ${name}Props) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View
      className={\`\${className}\`}
      style={style}
      testID={testID}
    >
      <Text className={isDark ? 'text-foreground-dark' : 'text-foreground'}>
        ${name} Component
      </Text>
    </View>
  );
}
`;

const hookTemplate = (name) => {
  const hookName = name.startsWith('use') ? name : `use${toPascalCase(name)}`;
  const stateName = toCamelCase(name.replace(/^use/i, ''));

  return `/**
 * ${hookName} Hook
 *
 * @example
 * const { ${stateName}, set${toPascalCase(stateName)}, isLoading } = ${hookName}();
 */

import { useState, useEffect, useCallback } from 'react';

interface ${toPascalCase(hookName.replace(/^use/, ''))}State {
  ${stateName}: unknown;
  isLoading: boolean;
  error: Error | null;
}

interface ${toPascalCase(hookName)}Return extends ${toPascalCase(hookName.replace(/^use/, ''))}State {
  set${toPascalCase(stateName)}: (value: unknown) => void;
  refresh: () => Promise<void>;
}

export function ${hookName}(): ${toPascalCase(hookName)}Return {
  const [${stateName}, set${toPascalCase(stateName)}] = useState<unknown>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // TODO: Implement fetch logic
      await new Promise((resolve) => setTimeout(resolve, 1000));
      set${toPascalCase(stateName)}(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    ${stateName},
    set${toPascalCase(stateName)},
    isLoading,
    error,
    refresh,
  };
}
`;
};

// ============================================
// GENERATORS
// ============================================

function generateScreen(name, options = {}) {
  const pascalName = toPascalCase(name);
  const kebabName = toKebabCase(name);
  const isTab = options.tab || false;

  const dir = isTab ? 'app/(tabs)' : 'app';
  const filePath = path.join(process.cwd(), dir, `${kebabName}.tsx`);

  if (fs.existsSync(filePath)) {
    error(`Screen already exists: ${filePath}`);
  }

  ensureDir(path.dirname(filePath));

  const template = isTab ? tabScreenTemplate(pascalName) : screenTemplate(pascalName);
  fs.writeFileSync(filePath, template);

  success(`Created screen: ${filePath}`);
  info(`Import: This screen is automatically registered by Expo Router`);
  info(`Route: /${isTab ? '(tabs)/' : ''}${kebabName}`);
}

function generateComponent(name) {
  const pascalName = toPascalCase(name);

  const dir = path.join(process.cwd(), 'components', toKebabCase(name));
  const componentPath = path.join(dir, `${pascalName}.tsx`);
  const indexPath = path.join(dir, 'index.ts');

  if (fs.existsSync(componentPath)) {
    error(`Component already exists: ${componentPath}`);
  }

  ensureDir(dir);
  fs.writeFileSync(componentPath, componentTemplate(pascalName));
  fs.writeFileSync(
    indexPath,
    `export { ${pascalName} } from './${pascalName}';\nexport type { ${pascalName}Props } from './${pascalName}';\n`
  );

  success(`Created component: ${componentPath}`);
  success(`Created index: ${indexPath}`);
  info(`Import: import { ${pascalName} } from '@/components/${toKebabCase(name)}';`);
}

function generateHook(name) {
  const hookName = name.startsWith('use') ? name : `use${toPascalCase(name)}`;
  const fileName = toKebabCase(hookName);

  const filePath = path.join(process.cwd(), 'hooks', `${fileName}.ts`);

  if (fs.existsSync(filePath)) {
    error(`Hook already exists: ${filePath}`);
  }

  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, hookTemplate(hookName));

  success(`Created hook: ${filePath}`);
  info(`Import: import { ${hookName} } from '@/hooks/${fileName}';`);
}

// ============================================
// CLI
// ============================================

function showHelp() {
  console.log(`
${colors.cyan}Code Generator${colors.reset}

Usage:
  node scripts/generate.js <type> <name>

Types:
  screen      Generate a new screen in app/
  tab         Generate a new tab screen in app/(tabs)/
  component   Generate a new component in components/
  hook        Generate a new custom hook in hooks/

Examples:
  node scripts/generate.js screen Profile
  node scripts/generate.js tab Dashboard
  node scripts/generate.js component UserCard
  node scripts/generate.js hook useAuth
`);
}

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    showHelp();
    process.exit(0);
  }

  const [type, name] = args;

  if (!name) {
    error('Please provide a name for the generated item');
  }

  switch (type) {
    case 'screen':
      generateScreen(name);
      break;
    case 'tab':
      generateScreen(name, { tab: true });
      break;
    case 'component':
      generateComponent(name);
      break;
    case 'hook':
      generateHook(name);
      break;
    default:
      error(`Unknown type: ${type}. Use screen, tab, component, or hook.`);
  }
}

main();
