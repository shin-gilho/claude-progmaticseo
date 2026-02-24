export interface ExtractedVariable {
  name: string;
  positions: number[];
}

export function extractVariables(template: string): string[] {
  const regex = /\{\{([^}]+)\}\}/g;
  const variables = new Set<string>();
  let match;

  while ((match = regex.exec(template)) !== null) {
    const variable = match[1].trim();
    // Skip Handlebars block helpers: {{#if}}, {{/if}}, {{#each}}, {{else}}, etc.
    if (/^[#\/\^>@]/.test(variable) || variable === 'else') continue;
    // Skip expressions with spaces (e.g. "if condition", "each items")
    if (/\s/.test(variable)) continue;
    variables.add(variable);
  }

  return Array.from(variables);
}

export function extractVariablesWithPositions(template: string): ExtractedVariable[] {
  const regex = /\{\{([^}]+)\}\}/g;
  const variableMap = new Map<string, number[]>();
  let match;

  while ((match = regex.exec(template)) !== null) {
    const variable = match[1].trim();
    // Skip Handlebars block helpers: {{#if}}, {{/if}}, {{#each}}, {{else}}, etc.
    if (/^[#\/\^>@]/.test(variable) || variable === 'else') continue;
    // Skip expressions with spaces (e.g. "if condition", "each items")
    if (/\s/.test(variable)) continue;
    const positions = variableMap.get(variable) || [];
    positions.push(match.index);
    variableMap.set(variable, positions);
  }

  return Array.from(variableMap.entries()).map(([name, positions]) => ({
    name,
    positions,
  }));
}

export function validateTemplate(template: string): {
  isValid: boolean;
  variables: string[];
  errors: string[];
} {
  const errors: string[] = [];
  const variables = extractVariables(template);

  // Validate variable names
  for (const v of variables) {
    if (!/^[a-zA-Z가-힣][a-zA-Z0-9가-힣_]*$/.test(v)) {
      errors.push(`Invalid variable name: {{${v}}}`);
    }
  }

  // Check for unclosed brackets
  const unclosedOpen = (template.match(/\{\{/g) || []).length;
  const unclosedClose = (template.match(/\}\}/g) || []).length;

  if (unclosedOpen !== unclosedClose) {
    errors.push('Mismatched variable brackets');
  }

  // Check for empty variables
  if (template.includes('{{}}')) {
    errors.push('Empty variable found: {{}}');
  }

  return {
    isValid: errors.length === 0,
    variables,
    errors,
  };
}
