const DEFAULT_LANGUAGES = [
  { code: "EN", label: "English" },
  { code: "ZH", label: "Chinese" },
  { code: "JA", label: "Japanese" },
  { code: "KO", label: "Korean" },
  { code: "FR", label: "French" },
  { code: "DE", label: "German" },
  { code: "ES", label: "Spanish" },
];

const DEFAULT_DIALOG_SETTINGS = {
  enabled: false,
  provider: "ai",
  source: "",
  targetLanguage: "EN",
  apiKey: "",
  apiUrl: "",
  model: "",
  translationPrompt: "",
  languages: DEFAULT_LANGUAGES,
};

function asString(value) {
  return typeof value === "string" ? value : "";
}

function normalizeProvider(provider) {
  const normalizedProvider = asString(provider).trim().toLowerCase();

  if (normalizedProvider === "ai" || normalizedProvider === "openai") {
    return "ai";
  }

  return DEFAULT_DIALOG_SETTINGS.provider;
}

function normalizeLanguageEntry(entry) {
  if (typeof entry === "string") {
    const normalizedCode = entry.trim().toUpperCase();
    if (!normalizedCode) {
      return null;
    }

    return {
      code: normalizedCode,
      label: normalizedCode,
    };
  }

  if (!entry || typeof entry !== "object") {
    return null;
  }

  const normalizedCode = asString(entry.code || entry.value)
    .trim()
    .toUpperCase();
  if (!normalizedCode) {
    return null;
  }

  return {
    code: normalizedCode,
    label: asString(entry.label || entry.name).trim() || normalizedCode,
  };
}

function normalizeLanguages(languages) {
  const input = Array.isArray(languages) ? languages : [];
  const normalized = input.map(normalizeLanguageEntry).filter(Boolean);
  return normalized.length > 0
    ? normalized
    : DEFAULT_LANGUAGES.map((language) => ({ ...language }));
}

function resolveTargetLanguageCode(targetLanguage, languages) {
  const normalizedCode = asString(targetLanguage).trim().toUpperCase();
  if (!normalizedCode) {
    return languages[0]?.code || "EN";
  }

  if (languages.some((language) => language.code === normalizedCode)) {
    return normalizedCode;
  }

  return languages[0]?.code || "EN";
}

function sanitizeTranslationDialogSettings(settings = {}, fallback = {}) {
  const mergedSettings = {
    ...DEFAULT_DIALOG_SETTINGS,
    ...fallback,
    ...settings,
  };

  const languages = normalizeLanguages(
    mergedSettings.languages || fallback.languages
  );

  return {
    enabled: Boolean(mergedSettings.enabled),
    provider: normalizeProvider(
      mergedSettings.provider || mergedSettings.source || fallback.provider
    ),
    source: "",
    targetLanguage: resolveTargetLanguageCode(
      mergedSettings.targetLanguage,
      languages
    ),
    apiKey: asString(mergedSettings.apiKey),
    apiUrl: asString(mergedSettings.apiUrl).trim(),
    model: asString(mergedSettings.model).trim(),
    translationPrompt: asString(mergedSettings.translationPrompt).trim(),
    languages,
  };
}

function getTranslationDialogSettings(translationConfig = {}) {
  const provider = normalizeProvider(
    translationConfig.provider || translationConfig.source
  );
  const languages = normalizeLanguages(translationConfig.languages);

  return sanitizeTranslationDialogSettings({
    enabled: translationConfig.enabled ?? DEFAULT_DIALOG_SETTINGS.enabled,
    provider,
    targetLanguage: translationConfig.targetLanguage,
    apiKey: translationConfig.apiKey || translationConfig.openai?.apiKey,
    apiUrl: translationConfig.apiUrl || translationConfig.openai?.apiUrl,
    model: translationConfig.model || translationConfig.openai?.model,
    translationPrompt:
      translationConfig.translationPrompt ||
      translationConfig.openai?.translationPrompt ||
      translationConfig.openai?.systemPrompt,
    languages,
  });
}

function applyTranslationDialogSettings(translationConfig = {}, dialogSettings = {}) {
  const sanitizedSettings = sanitizeTranslationDialogSettings(
    dialogSettings,
    getTranslationDialogSettings(translationConfig)
  );
  const nextTranslationConfig = { ...translationConfig };
  delete nextTranslationConfig.buttonLabel;
  delete nextTranslationConfig.replyPrompt;
  if (
    nextTranslationConfig.openai &&
    typeof nextTranslationConfig.openai === "object"
  ) {
    nextTranslationConfig.openai = { ...nextTranslationConfig.openai };
    delete nextTranslationConfig.openai.replyPrompt;
  }

  return {
    ...nextTranslationConfig,
    ...sanitizedSettings,
  };
}

module.exports = {
  DEFAULT_DIALOG_SETTINGS,
  sanitizeTranslationDialogSettings,
  getTranslationDialogSettings,
  applyTranslationDialogSettings,
};
