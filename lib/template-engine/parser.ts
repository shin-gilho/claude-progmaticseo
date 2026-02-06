export function parseAIResponse(response: string): Record<string, any> {
  // Extract JSON from code blocks if present
  const jsonBlockMatch = response.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  const jsonString = jsonBlockMatch ? jsonBlockMatch[1] : response;

  try {
    const parsed = JSON.parse(jsonString.trim());

    // Preserve types for Handlebars template engine
    const result: Record<string, any> = {};
    for (const [key, value] of Object.entries(parsed)) {
      if (value === null || value === undefined) {
        result[key] = '';
      } else {
        // Keep arrays and objects as-is for Handlebars
        result[key] = value;
      }
    }

    return result;
  } catch (error) {
    // Try to extract key-value pairs from non-JSON response
    const extractedData = extractKeyValuePairs(response);
    if (Object.keys(extractedData).length > 0) {
      return extractedData;
    }

    throw new Error(
      `Failed to parse AI response as JSON: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

function extractKeyValuePairs(text: string): Record<string, any> {
  const result: Record<string, any> = {};
  const lines = text.split('\n');

  for (const line of lines) {
    // Match patterns like "key: value" or "key = value"
    const match = line.match(/^([a-zA-Z가-힣_][a-zA-Z0-9가-힣_]*)\s*[:=]\s*(.+)$/);
    if (match) {
      const [, key, value] = match;
      result[key.trim()] = value.trim();
    }
  }

  return result;
}

export function validateAIResponse(
  response: Record<string, any>,
  requiredVariables: string[]
): { isValid: boolean; missing: string[] } {
  const missing = requiredVariables.filter((v) => !(v in response) || !response[v]);
  return {
    isValid: missing.length === 0,
    missing,
  };
}
