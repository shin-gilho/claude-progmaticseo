export function parseAIResponse(response: string): Record<string, string> {
  // Extract JSON from code blocks if present
  const jsonBlockMatch = response.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  const jsonString = jsonBlockMatch ? jsonBlockMatch[1] : response;

  try {
    const parsed = JSON.parse(jsonString.trim());

    // Convert all values to strings
    const result: Record<string, string> = {};
    for (const [key, value] of Object.entries(parsed)) {
      if (Array.isArray(value)) {
        result[key] = value.join(', ');
      } else if (typeof value === 'object' && value !== null) {
        result[key] = JSON.stringify(value);
      } else if (value === null || value === undefined) {
        result[key] = '';
      } else {
        result[key] = String(value);
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

function extractKeyValuePairs(text: string): Record<string, string> {
  const result: Record<string, string> = {};
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
  response: Record<string, string>,
  requiredVariables: string[]
): { isValid: boolean; missing: string[] } {
  const missing = requiredVariables.filter((v) => !(v in response) || !response[v]);
  return {
    isValid: missing.length === 0,
    missing,
  };
}
