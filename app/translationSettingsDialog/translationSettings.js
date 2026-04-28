const providerSelect = document.getElementById("provider");
const enabledInput = document.getElementById("enabled");
const targetLanguageSelect = document.getElementById("target-language");
const apiKeyInput = document.getElementById("api-key");
const apiUrlInput = document.getElementById("api-url");
const modelRow = document.getElementById("model-row");
const modelInput = document.getElementById("model");
const translationPromptInput = document.getElementById("translation-prompt");
const apiUrlLabel = document.getElementById("api-url-label");
const apiKeyLabel = document.getElementById("api-key-label");
const saveStatus = document.getElementById("save-status");
const closeButton = document.getElementById("close-button");
const showKeyButton = document.getElementById("show-key-button");

let saveTimer = null;
let isHydrating = true;
let isSaving = false;
let availableLanguages = [];

function normalizeLanguages(languages) {
  if (!Array.isArray(languages)) {
    return [];
  }

  return languages
    .map((entry) => {
      if (typeof entry === "string") {
        const code = entry.trim().toUpperCase();
        if (!code) {
          return null;
        }

        return { code, label: code };
      }

      if (!entry || typeof entry !== "object") {
        return null;
      }

      const code = String(entry.code || entry.value || "")
        .trim()
        .toUpperCase();
      if (!code) {
        return null;
      }

      return {
        code,
        label: String(entry.label || entry.name || code).trim() || code,
      };
    })
    .filter(Boolean);
}

function renderTargetLanguageOptions(selectedCode) {
  targetLanguageSelect.replaceChildren();
  const languages =
    availableLanguages.length > 0
      ? availableLanguages
      : [{ code: "EN", label: "English" }];

  for (const language of languages) {
    const option = document.createElement("option");
    option.value = language.code;
    option.textContent = `${language.label} (${language.code})`;
    targetLanguageSelect.appendChild(option);
  }

  const fallbackCode = languages[0]?.code || "EN";
  const normalizedSelected = String(selectedCode || "")
    .trim()
    .toUpperCase();
  targetLanguageSelect.value = languages.some(
    (language) => language.code === normalizedSelected
  )
    ? normalizedSelected
    : fallbackCode;
}

function getFormSettings() {
  return {
    enabled: enabledInput.checked,
    provider: providerSelect.value,
    targetLanguage: targetLanguageSelect.value,
    apiKey: apiKeyInput.value,
    apiUrl: apiUrlInput.value,
    model: modelInput.value,
    translationPrompt: translationPromptInput.value,
  };
}

function applySettings(settings) {
  availableLanguages = normalizeLanguages(settings.languages);
  enabledInput.checked = Boolean(settings.enabled);
  providerSelect.value = settings.provider || "ai";
  renderTargetLanguageOptions(settings.targetLanguage || "EN");
  apiKeyInput.value = settings.apiKey || "";
  apiUrlInput.value = settings.apiUrl || "";
  modelInput.value = settings.model || "";
  translationPromptInput.value = settings.translationPrompt || "";
  updateProviderUI();
}

function updateProviderUI() {
  modelRow.classList.remove("hidden");
  apiKeyLabel.textContent = "AI API Key";
  apiUrlLabel.textContent = "AI API URL";
}

function setStatus(message, isError = false) {
  saveStatus.textContent = message;
  saveStatus.classList.toggle("error", isError);
}

async function saveSettings() {
  if (isHydrating || isSaving) {
    return;
  }

  isSaving = true;
  setStatus("Saving...");

  try {
    const result = await window.translationSettingsApi.updateSettings(
      getFormSettings()
    );

    if (!result?.success) {
      setStatus(result?.error || "Failed to save settings", true);
      return;
    }

    applySettings(result.settings);
    setStatus("Saved. Changes apply immediately.");
  } catch (error) {
    setStatus(error.message || "Failed to save settings", true);
  } finally {
    isSaving = false;
  }
}

function scheduleSave(delay = 250) {
  if (isHydrating) {
    return;
  }

  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    saveSettings();
  }, delay);
}

function bindEvents() {
  for (const input of [
    enabledInput,
    providerSelect,
    targetLanguageSelect,
    apiKeyInput,
    apiUrlInput,
    modelInput,
    translationPromptInput,
  ]) {
    const eventName =
      input === enabledInput ||
      input === providerSelect ||
      input === targetLanguageSelect
        ? "change"
        : "input";
    input.addEventListener(eventName, () => {
      updateProviderUI();
      scheduleSave(eventName === "change" ? 0 : 300);
    });
  }

  closeButton.addEventListener("click", () => {
    window.close();
  });

  showKeyButton.addEventListener("click", () => {
    const isPassword = apiKeyInput.type === "password";
    apiKeyInput.type = isPassword ? "text" : "password";
    showKeyButton.textContent = isPassword ? "Hide Key" : "Show Key";
  });
}

async function initialize() {
  bindEvents();

  try {
    const settings = await window.translationSettingsApi.getSettings();
    applySettings(settings);
    setStatus("Changes are saved automatically.");
  } catch (error) {
    setStatus(error.message || "Failed to load translation settings", true);
  } finally {
    isHydrating = false;
  }
}

document.addEventListener("DOMContentLoaded", initialize);
