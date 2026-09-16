/**
 * Prompt injection defense & text sanitization service
 * Strips known jailbreaks and command overrides from untrusted candidate input
 */

const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous|prior|above)\s+(instructions|prompts|rules)/gi,
  /disregard\s+(all\s+)?(previous|prior|above)\s+(instructions|prompts|rules)/gi,
  /you\s+are\s+now\s+(in\s+)?(DAN|developer|jailbreak|unrestricted)\s+mode/gi,
  /system\s*:\s*/gi,
  /assistant\s*:\s*/gi,
  /human\s*:\s*/gi,
  /override\s+(all\s+)?system\s+prompts/gi,
  /reveal\s+(the\s+)?(system\s+prompt|instructions|secret)/gi,
  /forget\s+everything\s+you\s+know/gi,
  /\[system_event\]/gi,
];

function sanitizeUntrustedText(text) {
  if (typeof text !== "string") return "";

  let cleaned = text;

  // Strip injection patterns
  for (const pattern of INJECTION_PATTERNS) {
    cleaned = cleaned.replace(pattern, "[sanitized-instruction-removed]");
  }

  // Escape triple quotes that could break delimited blocks
  cleaned = cleaned.replace(/"""/g, "'''");

  // Remove potential null bytes and excessive control characters
  cleaned = cleaned.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");

  return cleaned.trim();
}

/**
 * Parses JSON safely from LLM outputs, removing markdown backticks if present
 */
function safeJsonParse(jsonString, fallback = null) {
  if (!jsonString || typeof jsonString !== "string") return fallback;

  try {
    return JSON.parse(jsonString);
  } catch (initialErr) {
    // Try stripping markdown fences ```json ... ```
    const cleaned = jsonString
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    try {
      return JSON.parse(cleaned);
    } catch (cleanErr) {
      // Find JSON object bounds
      const firstBrace = cleaned.indexOf("{");
      const lastBrace = cleaned.lastIndexOf("}");
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        try {
          return JSON.parse(cleaned.substring(firstBrace, lastBrace + 1));
        } catch {
          console.warn("safeJsonParse: failed to extract JSON object from LLM response");
        }
      }
      return fallback;
    }
  }
}

module.exports = {
  sanitizeUntrustedText,
  safeJsonParse,
};
