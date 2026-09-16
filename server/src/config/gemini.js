const { GoogleGenerativeAI } = require("@google/generative-ai");

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn("WARNING: GEMINI_API_KEY is not set in environment. Gemini features will require this key.");
}

const genAI = new GoogleGenerativeAI(apiKey || "DUMMY_KEY");

// Verified active models on Google Gemini API
const MODEL_CANDIDATES = [
  "gemini-3.6-flash",
  "gemini-flash-latest",
];

/**
 * Execute Gemini content generation with multi-model fallback and flexible argument handling
 */
async function generateWithRetry(arg1, arg2, arg3) {
  let prompt;
  let options = {};

  // Support both generateWithRetry(prompt, options) and generateWithRetry(model, prompt, ...)
  if (typeof arg1 === "string" || Array.isArray(arg1)) {
    prompt = arg1;
    options = (typeof arg2 === "object" && arg2 !== null) ? arg2 : {};
  } else if (typeof arg2 === "string" || Array.isArray(arg2)) {
    prompt = arg2;
    options = (typeof arg3 === "object" && arg3 !== null) ? arg3 : {};
  } else {
    prompt = String(arg1 || "");
  }

  let lastError = null;

  for (const modelName of MODEL_CANDIDATES) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          responseMimeType: options.responseMimeType || "application/json",
          temperature: options.temperature !== undefined ? options.temperature : 0.4,
        },
      });

      console.log(`[Gemini API] Requesting ${modelName}...`);
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      return text;
    } catch (err) {
      lastError = err;
      console.warn(
        `[Gemini API] Model ${modelName} failed (${err.status || err.message.slice(0, 100)}). Retrying next...`
      );
      await new Promise((r) => setTimeout(r, 400));
    }
  }

  throw lastError || new Error("All Gemini models in pool failed.");
}

const defaultModel = genAI.getGenerativeModel({
  model: MODEL_CANDIDATES[0],
  generationConfig: {
    responseMimeType: "application/json",
    temperature: 0.3,
  },
});

module.exports = {
  genAI,
  defaultModel,
  MODEL_CANDIDATES,
  generateWithRetry,
  getModel: (modelName = MODEL_CANDIDATES[0], config = {}) => {
    return genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.3,
        ...config,
      },
    });
  },
};
