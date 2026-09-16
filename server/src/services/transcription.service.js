const { getModel, MODEL_CANDIDATES } = require("../config/gemini");

/**
 * High-accuracy audio transcription using Gemini multimodal audio capabilities
 */
async function transcribeAudioBuffer(buffer, mimeType = "audio/webm") {
  if (!buffer || buffer.length === 0) {
    return "";
  }

  const cleanMime = (mimeType || "audio/webm").split(";")[0].trim();
  let lastError = null;

  for (const modelName of MODEL_CANDIDATES) {
    try {
      const model = getModel(modelName, {
        responseMimeType: "text/plain",
        temperature: 0.1,
      });

      const result = await model.generateContent([
        {
          inlineData: {
            mimeType: cleanMime,
            data: buffer.toString("base64"),
          },
        },
        "Listen to this audio recording of a job candidate answering an interview question. Accurately transcribe everything they say word-for-word, including technical terminology, code names, libraries, frameworks, and tools. Return ONLY the clean verbatim transcription. Do NOT add meta commentary, quotes, markdown, or timestamps. If the audio is silent or unintelligible, return an empty string.",
      ]);

      const text = result.response.text().trim();
      console.log(`[Audio Transcription] Model ${modelName} transcribed ${buffer.length} bytes -> "${text.slice(0, 80)}..."`);
      return text;
    } catch (err) {
      lastError = err;
      console.warn(`[Audio Transcription] Model ${modelName} failed: ${err.message}. Retrying next...`);
    }
  }

  console.error("[Audio Transcription] All models failed to transcribe:", lastError);
  return "";
}

module.exports = {
  transcribeAudioBuffer,
};
