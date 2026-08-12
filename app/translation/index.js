const logger = require("electron-log");

const DEFAULT_TIMEOUT_MS = 20000;
const MAX_TEXT_LENGTH = 20000;
const DEFAULT_OPENAI_MODEL = "gpt-4.1-mini";
const DEFAULT_TRANSLATION_PROMPT =
  "You are a translation engine. Translate the user message into the requested target language. Preserve meaning, tone, formatting, markdown, placeholders, emojis, and line breaks. Return only the translated text.";
const DEFAULT_OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim() !== "";
}

function parseJsonSafely(value) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function normalizeOpenAIContentPart(part) {
  if (typeof part === "string") {
    return part;
  }

  if (!part || typeof part !== "object") {
    return "";
  }

  if (typeof part.text === "string") {
    return part.text;
  }

  if (part.type === "text" && typeof part.text === "string") {
    return part.text;
  }

  return "";
}

function extractOpenAIMessage(data) {
  const content =
    data?.choices?.[0]?.message?.content ??
    data?.choices?.[0]?.text ??
    data?.output_text;

  if (typeof content === "string") {
    return content.trim();
  }

  if (Array.isArray(content)) {
    return content.map(normalizeOpenAIContentPart).join("").trim();
  }

  return "";
}

function createTimeout(timeoutMs) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  return {
    signal: controller.signal,
    clear: () => clearTimeout(timeoutId),
  };
}

class TranslationService {
  constructor(config = {}, fetchImpl = globalThis.fetch) {
    this.config = config;
    this.fetch = fetchImpl;
  }

  isEnabled() {
    return this.config.translation?.enabled === true;
  }

  async translate(request = {}) {
    if (!this.isEnabled()) {
      return { success: false, error: "Translation is disabled" };
    }

    const text = typeof request?.text === "string" ? request.text : "";
    if (!text.trim()) {
      return { success: false, error: "Text is required" };
    }

    if (text.length > MAX_TEXT_LENGTH) {
      return {
        success: false,
        error: `Text is too long. Maximum supported length is ${MAX_TEXT_LENGTH} characters.`,
      };
    }

    const provider = this._normalizeProvider(
      this.config.translation?.provider || this.config.translation?.source
    );
    const targetLanguage = this._resolveTargetLanguage(request.targetLanguage);

    logger.info("[TRANSLATION] Translating text", {
      provider,
      targetLanguage: targetLanguage.code,
      textLength: text.length,
    });

    try {
      if (provider === "deepl") {
        return {
          success: false,
          error:
            "DeepL support has been removed. Please use AI/OpenAI-compatible provider.",
        };
      }

      return await this._translateWithOpenAI(text, targetLanguage);
    } catch (error) {
      logger.error("[TRANSLATION] Translation failed", {
        provider,
        targetLanguage: targetLanguage.code,
        message: error.message,
      });
      return {
        success: false,
        error: error.message || error.toString(),
      };
    }
  }

  _resolveTargetLanguage(targetLanguage) {
    const translationConfig = this.config.translation || {};
    const configuredLanguages = Array.isArray(translationConfig.languages)
      ? translationConfig.languages
      : [];

    let code = "";
    let label = "";

    if (typeof targetLanguage === "string") {
      code = targetLanguage.trim().toUpperCase();
    } else if (targetLanguage && typeof targetLanguage === "object") {
      code = String(
        targetLanguage.code || targetLanguage.value || ""
      ).trim().toUpperCase();
      label = String(
        targetLanguage.label || targetLanguage.name || ""
      ).trim();
    }

    if (!code) {
      code = String(translationConfig.targetLanguage || "EN")
        .trim()
        .toUpperCase();
    }

    if (!label) {
      const configuredEntry = configuredLanguages.find((entry) => {
        if (typeof entry === "string") {
          return entry.trim().toUpperCase() === code;
        }

        return String(entry?.code || "")
          .trim()
          .toUpperCase() === code;
      });

      if (configuredEntry && typeof configuredEntry === "object") {
        label = String(configuredEntry.label || configuredEntry.name || code);
      }
    }

    return {
      code,
      label: label || code,
    };
  }

  _normalizeProvider(provider) {
    const normalizedProvider = String(provider || "ai")
      .trim()
      .toLowerCase();

    if (normalizedProvider === "ai" || normalizedProvider === "openai") {
      return "openai";
    }

    if (normalizedProvider === "deepl") {
      return "deepl";
    }

    return "openai";
  }

  _getOpenAIConfig() {
    const translationConfig = this.config.translation || {};
    const openAIConfig = translationConfig.openai || {};
    const genericApiKey = String(translationConfig.apiKey || "").trim();
    const genericApiUrl = String(translationConfig.apiUrl || "").trim();
    const genericModel = String(translationConfig.model || "").trim();
    const genericTranslationPrompt = String(
      translationConfig.translationPrompt || ""
    ).trim();

    return {
      ...openAIConfig,
      apiKey: genericApiKey || String(openAIConfig.apiKey || "").trim(),
      apiUrl:
        genericApiUrl ||
        String(openAIConfig.apiUrl || "").trim() ||
        DEFAULT_OPENAI_API_URL,
      model:
        genericModel ||
        String(openAIConfig.model || "").trim() ||
        DEFAULT_OPENAI_MODEL,
      translationPrompt:
        genericTranslationPrompt ||
        String(openAIConfig.translationPrompt || "").trim() ||
        String(openAIConfig.systemPrompt || "").trim() ||
        DEFAULT_TRANSLATION_PROMPT,
    };
  }

  async _translateWithOpenAI(text, targetLanguage) {
    const openAIConfig = this._getOpenAIConfig();
    const data = await this._requestOpenAI(openAIConfig, {
      systemPrompt: openAIConfig.translationPrompt,
      temperature: 0.2,
      payload: {
        targetLanguage: targetLanguage.label,
        targetLanguageCode: targetLanguage.code,
        text,
      },
    });

    const translatedText = extractOpenAIMessage(data);
    if (!isNonEmptyString(translatedText)) {
      logger.warn("[TRANSLATION] OpenAI-compatible API returned empty translation", {
        targetLanguage: targetLanguage.code,
        responseKeys: data && typeof data === "object" ? Object.keys(data) : [],
      });
      return {
        success: false,
        error: "OpenAI-compatible API returned an empty translation",
      };
    }

    logger.info("[TRANSLATION] OpenAI-compatible translation completed", {
      targetLanguage: targetLanguage.code,
      translatedLength: translatedText.length,
    });

    return {
      success: true,
      provider: "openai",
      text: translatedText,
      targetLanguage,
    };
  }

  async _requestOpenAI(openAIConfig, requestBody) {
    if (!isNonEmptyString(openAIConfig.apiKey)) {
      throw new Error("OpenAI-compatible API key is not configured");
    }

    const apiUrl = this._validateApiUrl(
      openAIConfig.apiUrl || DEFAULT_OPENAI_API_URL
    );
    const body = {
      model: openAIConfig.model || DEFAULT_OPENAI_MODEL,
      temperature:
        typeof requestBody.temperature === "number"
          ? requestBody.temperature
          : 0.2,
      messages: [
        {
          role: "system",
          content: requestBody.systemPrompt || DEFAULT_TRANSLATION_PROMPT,
        },
        {
          role: "user",
          content: JSON.stringify(requestBody.payload || {}),
        },
      ],
    };

    return this._request(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openAIConfig.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
  }

  async _request(url, options) {
    if (typeof this.fetch !== "function") {
      throw new Error("Fetch implementation is not available");
    }

    const timeoutMs =
      Number(this.config.translation?.timeoutMs) > 0
        ? Number(this.config.translation.timeoutMs)
        : DEFAULT_TIMEOUT_MS;
    const timeout = createTimeout(timeoutMs);

    try {
      const response = await this.fetch(url, {
        ...options,
        signal: timeout.signal,
      });
      const responseText = await response.text();
      const data = responseText ? parseJsonSafely(responseText) : null;

      if (!response.ok) {
        const errorMessage =
          data?.message ||
          data?.error?.message ||
          responseText ||
          `Translation API request failed with status ${response.status}`;
        throw new Error(errorMessage);
      }

      return data;
    } catch (error) {
      if (error?.name === "AbortError") {
        throw new Error("Translation request timed out", { cause: error });
      }
      throw error;
    } finally {
      timeout.clear();
    }
  }

  _validateApiUrl(url) {
    if (!isNonEmptyString(url)) {
      throw new Error("Translation API URL is not configured");
    }

    const parsedUrl = new URL(url);
    if (parsedUrl.protocol !== "https:" && parsedUrl.protocol !== "http:") {
      throw new Error("Translation API URL must use http or https");
    }

    return parsedUrl.toString();
  }
}

module.exports = TranslationService;
module.exports.extractOpenAIMessage = extractOpenAIMessage;
