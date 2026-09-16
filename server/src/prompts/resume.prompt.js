/**
 * Exact resume parsing prompt specified in the requirements
 */
function buildResumePrompt(sanitizedResumeText) {
  return `Extract structured data from this resume text. Respond ONLY with valid JSON, no markdown fences:
{
  "name": string,
  "target_roles": string[],
  "years_experience": number,
  "skills": string[],
  "projects": [{ "name": string, "description": string, "tech": string[] }],
  "past_roles": [{ "title": string, "company": string, "duration": string, "highlights": string[] }],
  "education": [{ "degree": string, "institution": string, "year": string }]
}

Resume text:
"""
${sanitizedResumeText}
"""`;
}

module.exports = {
  buildResumePrompt,
};
