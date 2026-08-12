const DEFAULT_LANGUAGES = [
  { code: "EN", label: "English" },
  { code: "ZH", label: "Chinese" },
  { code: "JA", label: "Japanese" },
  { code: "KO", label: "Korean" },
  { code: "FR", label: "French" },
  { code: "DE", label: "German" },
  { code: "ES", label: "Spanish" },
];

const STORAGE_KEY = "tfl-inline-translate-target-language";
const TRANSLATE_ICON_DATA_URL =
  "data:image/png;base64," +
  "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";

class InlineTranslate {
  #config = null;
  #toolbar = null;
  #languageSelect = null;
  #translateButton = null;
  #status = null;
  #activeEditor = null;
  #isProcessing = false;
  #statusResetTimer = null;
  #repositionFrame = null;
  #observer = null;
  #lastEditorRange = null;

  #debug(event, payload = {}) {
    try {
      globalThis.electronAPI?.send("inline-translate-debug", {
        event,
        ...payload,
      });
    } catch {
      console.debug("[INLINE_TRANSLATE] Failed to forward debug payload");
    }
  }

  init(config) {
    if (this.#toolbar || !config.translation?.enabled) {
      this.#config = config;
      return;
    }

    if (!globalThis.electronAPI?.translateText) {
      console.warn("[INLINE_TRANSLATE] translateText API is not available");
      return;
    }

    this.#config = config;
    this.#injectStyles();
    this.#createToolbar();
    this.#registerEventHandlers();
    this.#observeDom();
    this.#syncToCurrentFocus();

    console.info("[INLINE_TRANSLATE] Initialized");
  }

  updateConfig(config) {
    this.#config = config;

    if (!config.translation?.enabled) {
      this.#hideToolbar();
      return;
    }

    if (!this.#toolbar) {
      this.init(config);
      return;
    }

    this.#refreshLanguageOptions();
  }

  #registerEventHandlers() {
    document.addEventListener("focusin", (event) => {
      if (this.#isToolbarElement(event.target)) {
        return;
      }

      const editor = this.#findEditorFromNode(event.target);
      if (editor) {
        this.#setActiveEditor(editor);
      }
    });

    document.addEventListener(
      "click",
      (event) => {
        if (this.#isToolbarElement(event.target)) {
          return;
        }

        const editor = this.#findEditorFromNode(event.target);
        if (editor) {
          this.#setActiveEditor(editor);
          return;
        }

        if (!this.#isProcessing) {
          this.#hideToolbar();
        }
      },
      true
    );

    document.addEventListener("scroll", () => this.#scheduleReposition(), true);
    document.addEventListener("selectionchange", () => {
      this.#captureEditorSelection();
      this.#scheduleReposition();
    });
    window.addEventListener("resize", () => this.#scheduleReposition());
  }

  #observeDom() {
    this.#observer = new MutationObserver(() => {
      if (this.#activeEditor && !document.contains(this.#activeEditor)) {
        this.#activeEditor = null;
        this.#hideToolbar();
        return;
      }

      this.#scheduleReposition();
    });

    this.#observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  #syncToCurrentFocus() {
    const editor = this.#findEditorFromNode(document.activeElement);
    if (editor) {
      this.#setActiveEditor(editor);
    }
  }

  #createToolbar() {
    const toolbar = document.createElement("div");
    toolbar.id = "tfl-inline-translate-toolbar";
    toolbar.hidden = true;

    const select = document.createElement("select");
    select.id = "tfl-inline-translate-language";
    select.title = "Target language";

    for (const language of this.#getLanguages()) {
      const option = document.createElement("option");
      option.value = language.code;
      option.textContent = this.#getLanguageShortCode(language.code);
      option.title = language.label;
      select.appendChild(option);
    }

    select.value = this.#getInitialLanguageCode();
    select.addEventListener("change", () => {
      try {
        localStorage.setItem(STORAGE_KEY, select.value);
      } catch {
        console.debug("[INLINE_TRANSLATE] Failed to persist selected language");
      }
      this.#setStatus(`Target: ${this.#getSelectedLanguage().label}`, "info");
    });

    const translateButton = document.createElement("button");
    translateButton.id = "tfl-inline-translate-button";
    translateButton.type = "button";
    translateButton.title = "Translate";
    translateButton.setAttribute("aria-label", "Translate");
    translateButton.setAttribute("aria-busy", "false");

    const translateButtonContent = document.createElement("span");
    translateButtonContent.id = "tfl-inline-translate-button-content";

    if (TRANSLATE_ICON_DATA_URL) {
      const translateIcon = document.createElement("img");
      translateIcon.src = TRANSLATE_ICON_DATA_URL;
      translateIcon.alt = "";
      translateIcon.decoding = "async";
      translateIcon.id = "tfl-inline-translate-button-icon";
      translateButtonContent.appendChild(translateIcon);
    } else {
      translateButtonContent.textContent = "Translate";
    }

    translateButton.appendChild(translateButtonContent);

    translateButton.addEventListener("mousedown", (event) =>
      event.preventDefault()
    );
    translateButton.addEventListener("click", () => {
      this.#translateActiveEditor();
    });

    const status = document.createElement("div");
    status.id = "tfl-inline-translate-status";

    toolbar.appendChild(select);
    toolbar.appendChild(translateButton);
    toolbar.appendChild(status);

    document.body.appendChild(toolbar);

    this.#toolbar = toolbar;
    this.#languageSelect = select;
    this.#translateButton = translateButton;
    this.#status = status;
  }

  #injectStyles() {
    if (document.getElementById("tfl-inline-translate-style")) {
      return;
    }

    const style = document.createElement("style");
    style.id = "tfl-inline-translate-style";
    style.textContent = `
      #tfl-inline-translate-toolbar {
        position: fixed;
        z-index: 2147483647;
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 6px 8px;
        max-width: min(320px, calc(100vw - 16px));
        border: 1px solid rgba(0, 0, 0, 0.12);
        border-radius: 9px;
        background: rgba(255, 255, 255, 0.97);
        box-shadow: 0 10px 24px rgba(0, 0, 0, 0.16);
        backdrop-filter: blur(8px);
      }

      #tfl-inline-translate-language {
        max-width: 108px;
        height: 30px;
        border: 1px solid rgba(0, 0, 0, 0.14);
        border-radius: 7px;
        background: #fff;
        padding: 0 8px;
        color: #202124;
      }

      #tfl-inline-translate-button {
        height: 30px;
        width: 30px;
        min-width: 30px;
        position: relative;
        border: none;
        border-radius: 7px;
        background: #0f6cbd;
        color: #fff;
        font-weight: 600;
        padding: 0;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }

      #tfl-inline-translate-button-content {
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }

      #tfl-inline-translate-button:hover:not(:disabled) {
        background: #0a5ea8;
      }

      #tfl-inline-translate-button:disabled {
        opacity: 0.7;
        cursor: progress;
      }

      #tfl-inline-translate-button.is-processing:disabled {
        opacity: 1;
      }

      #tfl-inline-translate-button.is-processing > * {
        opacity: 0;
      }

      #tfl-inline-translate-button.is-processing::after {
        content: "";
        position: absolute;
        width: 14px;
        height: 14px;
        border: 2px solid rgba(255, 255, 255, 0.35);
        border-top-color: #fff;
        border-radius: 50%;
        animation: tfl-inline-translate-spin 0.8s linear infinite;
      }

      #tfl-inline-translate-button-icon {
        width: 18px;
        height: 18px;
        object-fit: contain;
        pointer-events: none;
      }

      @keyframes tfl-inline-translate-spin {
        from {
          transform: rotate(0deg);
        }

        to {
          transform: rotate(360deg);
        }
      }

      #tfl-inline-translate-status {
        min-width: 0;
        flex: 0 1 110px;
        font-size: 11px;
        color: #5f6368;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      #tfl-inline-translate-status.is-error {
        color: #b3261e;
      }

      #tfl-inline-translate-status.is-success {
        color: #0b6e4f;
      }

      @media (prefers-color-scheme: dark) {
        #tfl-inline-translate-toolbar {
          background: rgba(36, 36, 36, 0.96);
          border-color: rgba(255, 255, 255, 0.12);
          box-shadow: 0 12px 28px rgba(0, 0, 0, 0.38);
        }

        #tfl-inline-translate-language {
          background: #1f1f1f;
          border-color: rgba(255, 255, 255, 0.12);
          color: #f1f3f4;
        }

        #tfl-inline-translate-status {
          color: #c4c7c5;
        }
      }
    `;

    document.head.appendChild(style);
  }

  #getLanguages() {
    const configuredLanguages = Array.isArray(this.#config.translation?.languages)
      ? this.#config.translation.languages
      : [];

    if (configuredLanguages.length === 0) {
      return DEFAULT_LANGUAGES;
    }

    return configuredLanguages
      .map((entry) => {
        if (typeof entry === "string") {
          return {
            code: entry.trim().toUpperCase(),
            label: entry.trim().toUpperCase(),
          };
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

  #getLanguageShortCode(code) {
    const normalizedCode = String(code || "")
      .trim()
      .toUpperCase();
    const baseCode = normalizedCode.split(/[-_]/)[0] || normalizedCode;

    return baseCode.slice(0, 2) || normalizedCode || "EN";
  }

  #refreshLanguageOptions() {
    if (!(this.#languageSelect instanceof HTMLSelectElement)) {
      return;
    }

    const languages = this.#getLanguages();
    const previousSelection = this.#languageSelect.value;
    this.#languageSelect.replaceChildren();

    for (const language of languages) {
      const option = document.createElement("option");
      option.value = language.code;
      option.textContent = this.#getLanguageShortCode(language.code);
      option.title = language.label;
      this.#languageSelect.appendChild(option);
    }

    const fallbackCode = String(this.#config.translation?.targetLanguage || "EN")
      .trim()
      .toUpperCase();
    const nextCode =
      previousSelection && languages.some((language) => language.code === previousSelection)
        ? previousSelection
        : languages.some((language) => language.code === fallbackCode)
          ? fallbackCode
          : languages[0]?.code || "EN";

    this.#languageSelect.value = nextCode;
  }

  #getInitialLanguageCode() {
    try {
      const persistedLanguage = localStorage.getItem(STORAGE_KEY);
      if (
        persistedLanguage &&
        this.#getLanguages().some(
          (language) => language.code === persistedLanguage.trim().toUpperCase()
        )
      ) {
        return persistedLanguage.trim().toUpperCase();
      }
    } catch {
      console.debug("[INLINE_TRANSLATE] Failed to read persisted language");
    }

    return String(this.#config.translation?.targetLanguage || "EN")
      .trim()
      .toUpperCase();
  }

  #getSelectedLanguage() {
    const selectedCode = this.#languageSelect?.value || "EN";
    return (
      this.#getLanguages().find((language) => language.code === selectedCode) || {
        code: selectedCode,
        label: selectedCode,
      }
    );
  }

  #isToolbarElement(node) {
    return Boolean(
      node instanceof Element &&
        (node.id === "tfl-inline-translate-toolbar" ||
          node.closest("#tfl-inline-translate-toolbar"))
    );
  }

  #findEditorFromNode(node) {
    if (!(node instanceof Element)) {
      return null;
    }

    const container = node.closest(
      'textarea, [contenteditable="true"], [role="textbox"]'
    );
    const candidate = this.#resolveEditableElement(container);

    if (!candidate || !this.#isSupportedEditor(candidate)) {
      return null;
    }

    return candidate;
  }

  #resolveEditableElement(element) {
    if (!(element instanceof HTMLElement)) {
      return null;
    }

    if (element instanceof HTMLTextAreaElement || element.isContentEditable) {
      return element;
    }

    const nestedEditable = Array.from(
      element.querySelectorAll('textarea, [contenteditable="true"]')
    ).find((candidate) => this.#isVisible(candidate));

    return nestedEditable || element;
  }

  #isSupportedEditor(element) {
    if (!(element instanceof HTMLElement)) {
      return false;
    }

    if (!this.#isVisible(element)) {
      return false;
    }

    const descriptor = [
      element.getAttribute("aria-label"),
      element.getAttribute("placeholder"),
      element.getAttribute("title"),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    if (
      descriptor.includes("search") ||
      descriptor.includes("find") ||
      descriptor.includes("filter")
    ) {
      return false;
    }

    if (element.matches("textarea")) {
      return true;
    }

    if (
      !element.isContentEditable &&
      element.getAttribute("contenteditable") !== "true"
    ) {
      return false;
    }

    if (
      descriptor.includes("message") ||
      descriptor.includes("reply") ||
      descriptor.includes("compose") ||
      descriptor.includes("chat")
    ) {
      return true;
    }

    if (
      element.getAttribute("aria-multiline") === "true" ||
      element.getAttribute("role") === "textbox"
    ) {
      return true;
    }

    return false;
  }

  #isVisible(element) {
    const rect = element.getBoundingClientRect();
    return (
      rect.width > 0 &&
      rect.height > 0 &&
      rect.bottom > 0 &&
      rect.right > 0 &&
      rect.top < window.innerHeight &&
      rect.left < window.innerWidth
    );
  }

  #setActiveEditor(editor) {
    if (!this.#config?.translation?.enabled) {
      this.#hideToolbar();
      return;
    }

    if (!this.#isSupportedEditor(editor)) {
      return;
    }

    this.#activeEditor = editor;
    this.#captureEditorSelection();
    this.#toolbar.hidden = false;
    this.#scheduleReposition();
  }

  #hideToolbar() {
    if (this.#toolbar) {
      this.#toolbar.hidden = true;
    }
  }

  #scheduleReposition() {
    if (!this.#toolbar || this.#toolbar.hidden || this.#repositionFrame !== null) {
      return;
    }

    this.#repositionFrame = requestAnimationFrame(() => {
      this.#repositionFrame = null;
      this.#positionToolbar();
    });
  }

  #rectanglesOverlap(firstRect, secondRect) {
    return !(
      firstRect.right <= secondRect.left ||
      firstRect.left >= secondRect.right ||
      firstRect.bottom <= secondRect.top ||
      firstRect.top >= secondRect.bottom
    );
  }

  #getNearbyComposerActionRects(editorRect) {
    return Array.from(document.querySelectorAll('button, [role="button"]'))
      .filter((element) => {
        if (!(element instanceof HTMLElement)) {
          return false;
        }

        if (
          element === this.#toolbar ||
          element.closest?.("#tfl-inline-translate-toolbar") ||
          element === this.#activeEditor ||
          this.#activeEditor?.contains?.(element)
        ) {
          return false;
        }

        if (!this.#isVisible(element)) {
          return false;
        }

        const rect = element.getBoundingClientRect();
        const isHorizontallyNear =
          rect.right >= editorRect.left - 40 &&
          rect.left <= editorRect.right + 40;
        const isVerticallyNear =
          rect.bottom >= editorRect.top - 20 &&
          rect.top <= editorRect.bottom + 72;

        return isHorizontallyNear && isVerticallyNear;
      })
      .map((element) => element.getBoundingClientRect());
  }

  #positionToolbar() {
    if (!this.#activeEditor || !document.contains(this.#activeEditor)) {
      this.#hideToolbar();
      return;
    }

    if (!this.#isVisible(this.#activeEditor)) {
      this.#hideToolbar();
      return;
    }

    const editorRect = this.#activeEditor.getBoundingClientRect();
    const toolbarRect = this.#toolbar.getBoundingClientRect();
    const spacing = 8;
    const toolbarWidth = toolbarRect.width || 280;
    const toolbarHeight = toolbarRect.height || 42;
    const minTop = 8;
    const minLeft = 8;
    const maxTop = window.innerHeight - toolbarHeight - 8;
    const maxLeft = window.innerWidth - toolbarWidth - 8;

    const clampTop = (top) => Math.max(minTop, Math.min(top, maxTop));
    const clampLeft = (left) => Math.max(minLeft, Math.min(left, maxLeft));
    const fits = (top, left) =>
      top >= minTop &&
      left >= minLeft &&
      top <= maxTop &&
      left <= maxLeft;
    const nearbyActionRects = this.#getNearbyComposerActionRects(editorRect);
    const buildRect = (top, left) => ({
      top,
      left,
      right: left + toolbarWidth,
      bottom: top + toolbarHeight,
    });
    const overlapsComposerActions = (top, left) =>
      nearbyActionRects.some((rect) =>
        this.#rectanglesOverlap(buildRect(top, left), rect)
      );

    const placements = [
      {
        name: "below-left",
        top: editorRect.bottom + spacing,
        left: editorRect.left,
      },
      {
        name: "left",
        top: editorRect.bottom - toolbarHeight,
        left: editorRect.left - toolbarWidth - spacing,
      },
      {
        name: "above-left",
        top: editorRect.top - toolbarHeight - spacing,
        left: editorRect.left,
      },
      {
        name: "below-right",
        top: editorRect.bottom + spacing,
        left: editorRect.right - toolbarWidth,
      },
      {
        name: "right",
        top: editorRect.bottom - toolbarHeight,
        left: editorRect.right + spacing,
      },
      {
        name: "above-right",
        top: editorRect.top - toolbarHeight - spacing,
        left: editorRect.right - toolbarWidth,
      },
    ];

    const placement =
      placements.find(
        (candidate) =>
          fits(candidate.top, candidate.left) &&
          !overlapsComposerActions(candidate.top, candidate.left)
      ) ||
      placements.find((candidate) => fits(candidate.top, candidate.left)) ||
      placements[0];

    const top = clampTop(placement.top);
    const left = clampLeft(placement.left);

    this.#toolbar.style.left = `${left}px`;
    this.#toolbar.style.top = `${top}px`;
    this.#toolbar.dataset.placement = placement.name;
  }

  #getEditorText(editor) {
    editor = this.#resolveEditableElement(editor);
    if (editor instanceof HTMLTextAreaElement) {
      return editor.value;
    }

    return (editor.innerText || "").replaceAll("\u00a0", " ");
  }

  #selectEditorContent(editor) {
    const selection = window.getSelection();
    if (!selection) {
      return;
    }

    const range = document.createRange();
    range.selectNodeContents(editor);
    selection.removeAllRanges();
    selection.addRange(range);
  }

  #captureEditorSelection() {
    if (!this.#activeEditor || !(this.#activeEditor instanceof HTMLElement)) {
      return;
    }

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      return;
    }

    const range = selection.getRangeAt(0);
    const commonAncestor =
      range.commonAncestorContainer instanceof Element
        ? range.commonAncestorContainer
        : range.commonAncestorContainer.parentElement;

    if (
      commonAncestor &&
      (commonAncestor === this.#activeEditor ||
        this.#activeEditor.contains(commonAncestor))
    ) {
      this.#lastEditorRange = range.cloneRange();
    }
  }

  #restoreEditorSelection(editor) {
    const selection = window.getSelection();
    if (!selection) {
      return false;
    }

    const commonAncestor = this.#lastEditorRange
      ? this.#lastEditorRange.commonAncestorContainer instanceof Element
        ? this.#lastEditorRange.commonAncestorContainer
        : this.#lastEditorRange.commonAncestorContainer.parentElement
      : null;

    if (this.#lastEditorRange && commonAncestor && editor.contains(commonAncestor)) {
      selection.removeAllRanges();
      selection.addRange(this.#lastEditorRange.cloneRange());
      return true;
    }

    this.#selectEditorContent(editor);
    return true;
  }

  #setEditorCursorToEnd(editor) {
    if (editor instanceof HTMLTextAreaElement) {
      const cursorPosition = editor.value.length;
      try {
        editor.setSelectionRange(cursorPosition, cursorPosition);
      } catch {
        console.debug("[INLINE_TRANSLATE] Failed to move textarea cursor");
      }
      return;
    }

    const selection = window.getSelection();
    if (!selection) {
      return;
    }

    const range = document.createRange();
    range.selectNodeContents(editor);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
    this.#lastEditorRange = range.cloneRange();
  }

  #dispatchEditorInput(editor, text, inputType = "insertReplacementText") {
    try {
      editor.dispatchEvent(
        new InputEvent("input", {
          bubbles: true,
          data: text,
          inputType,
        })
      );
    } catch {
      editor.dispatchEvent(new Event("input", { bubbles: true }));
    }
  }

  #dispatchEditorChange(editor) {
    try {
      editor.dispatchEvent(new Event("change", { bubbles: true }));
    } catch {
      console.debug("[INLINE_TRANSLATE] Failed to dispatch change event");
    }
  }

  async #waitForWriteSettle() {
    await new Promise((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
    );
  }

  #normalizeText(text) {
    return String(text || "")
      .replaceAll("\u00a0", " ")
      .replace(/\r\n/g, "\n")
      .trim();
  }

  async #verifyEditorText(editor, expectedText) {
    await this.#waitForWriteSettle();
    return (
      this.#normalizeText(this.#getEditorText(editor)) ===
      this.#normalizeText(expectedText)
    );
  }

  #setTextareaValue(editor, text) {
    const prototype = Object.getPrototypeOf(editor);
    const descriptor = Object.getOwnPropertyDescriptor(prototype, "value");

    if (descriptor?.set) {
      descriptor.set.call(editor, text);
      return;
    }

    editor.value = text;
  }

  async #finalizeEditorWrite(editor, expectedText, options = {}) {
    const {
      notifyInput = false,
      inputType = "insertReplacementText",
    } = options;

    if (notifyInput) {
      this.#dispatchEditorInput(editor, expectedText, inputType);
    }

    const writeVerified = await this.#verifyEditorText(editor, expectedText);
    if (!writeVerified) {
      return false;
    }

    this.#setEditorCursorToEnd(editor);
    return true;
  }

  #writePlainTextNodes(editor, text) {
    const lines = text.split("\n");
    const fragment = document.createDocumentFragment();

    lines.forEach((line, index) => {
      if (index > 0) {
        fragment.appendChild(document.createElement("br"));
      }

      fragment.appendChild(document.createTextNode(line));
    });

    editor.replaceChildren(fragment);
  }

  #escapeHtml(text) {
    return String(text)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
  }

  #textToHtml(text) {
    return text
      .split("\n")
      .map((line) => `<p>${line ? this.#escapeHtml(line) : "&nbsp;"}</p>`)
      .join("");
  }

  #getInspectableProperties(target) {
    return [
      ...Object.getOwnPropertyNames(target),
      ...Object.getOwnPropertySymbols(target),
    ];
  }

  #normalizeCkEditorInstance(candidate) {
    if (
      candidate &&
      typeof candidate === "object" &&
      typeof candidate.setData === "function" &&
      typeof candidate.getData === "function"
    ) {
      return candidate;
    }

    if (
      candidate?.editor &&
      typeof candidate.editor === "object" &&
      typeof candidate.editor.setData === "function" &&
      typeof candidate.editor.getData === "function"
    ) {
      return candidate.editor;
    }

    return null;
  }

  #findCkEditorInstance(editor) {
    let currentNode = editor;
    const visitedObjects = new WeakSet();

    const inspectValue = (value, depth, path) => {
      if (!value || typeof value !== "object" || depth > 2) {
        return null;
      }

      if (visitedObjects.has(value)) {
        return null;
      }
      visitedObjects.add(value);

      const normalizedCandidate = this.#normalizeCkEditorInstance(value);
      if (normalizedCandidate) {
        return { instance: normalizedCandidate, path };
      }

      for (const property of this.#getInspectableProperties(value)) {
        let propertyValue;
        try {
          propertyValue = value[property];
        } catch {
          continue;
        }

        const result = inspectValue(
          propertyValue,
          depth + 1,
          `${path}.${String(property)}`
        );
        if (result) {
          return result;
        }
      }

      return null;
    };

    while (currentNode instanceof HTMLElement) {
      const result = inspectValue(currentNode, 0, currentNode.tagName);
      if (result) {
        return result;
      }
      currentNode = currentNode.parentElement;
    }

    return null;
  }

  #clearEditorViaExecCommand(editor) {
    editor.focus({ preventScroll: true });

    try {
      document.execCommand("selectAll", false);
      document.execCommand("delete", false);
    } catch {
      console.debug("[INLINE_TRANSLATE] execCommand clear failed");
    }
  }

  async #writeEditorText(editor, text) {
    editor = this.#resolveEditableElement(editor);
    if (!(editor instanceof HTMLElement)) {
      return { success: false, strategy: "none" };
    }

    editor.focus({ preventScroll: true });

    if (editor instanceof HTMLTextAreaElement) {
      this.#setTextareaValue(editor, text);
      this.#dispatchEditorInput(editor, text, "insertReplacementText");
      this.#dispatchEditorChange(editor);
      if (
        await this.#finalizeEditorWrite(editor, text)
      ) {
        return { success: true, strategy: "textarea-value" };
      }
    }

    this.#restoreEditorSelection(editor);

    const ckEditorInstance = this.#findCkEditorInstance(editor);
    if (ckEditorInstance) {
      try {
        await Promise.resolve(
          ckEditorInstance.instance.setData(this.#textToHtml(text))
        );
        if (await this.#finalizeEditorWrite(editor, text)) {
          return {
            success: true,
            strategy: "ckeditor-setData",
            instancePath: ckEditorInstance.path,
          };
        }
      } catch (error) {
        this.#debug("ckeditor-setData-failed", {
          message: error.message,
          instancePath: ckEditorInstance.path,
        });
      }
    }

    try {
      this.#clearEditorViaExecCommand(editor);
      const inserted = document.execCommand("insertText", false, text);
      if (inserted) {
        this.#dispatchEditorChange(editor);
        if (await this.#finalizeEditorWrite(editor, text, {
          notifyInput: true,
        })) {
          return { success: true, strategy: "execCommand-insertText" };
        }

        this.#clearEditorViaExecCommand(editor);
      }
    } catch {
      console.debug("[INLINE_TRANSLATE] execCommand insertText failed");
    }

    try {
      this.#writePlainTextNodes(editor, text);
      this.#dispatchEditorChange(editor);
      if (
        await this.#finalizeEditorWrite(editor, text, {
          notifyInput: true,
          inputType: "insertReplacementText",
        })
      ) {
        return { success: true, strategy: "replaceChildren" };
      }
    } catch (error) {
      console.debug("[INLINE_TRANSLATE] replaceChildren failed", error);
    }

    editor.textContent = text;
    this.#dispatchEditorChange(editor);
    if (
      await this.#finalizeEditorWrite(editor, text, {
        notifyInput: true,
        inputType: "insertReplacementText",
      })
    ) {
      return { success: true, strategy: "textContent" };
    }

    return { success: false, strategy: "all-strategies-failed" };
  }

  #setActionState(isProcessing) {
    this.#isProcessing = isProcessing;

    if (this.#translateButton) {
      this.#translateButton.disabled = isProcessing;
      this.#translateButton.classList.toggle("is-processing", isProcessing);
      this.#translateButton.setAttribute("aria-busy", String(isProcessing));
    }
  }

  #setStatus(message, type = "info") {
    if (!this.#status) {
      return;
    }

    clearTimeout(this.#statusResetTimer);
    this.#status.textContent = message;
    this.#status.classList.toggle("is-error", type === "error");
    this.#status.classList.toggle("is-success", type === "success");

    if (message) {
      this.#statusResetTimer = setTimeout(() => {
        this.#status.textContent = "";
        this.#status.classList.remove("is-error", "is-success");
      }, 4500);
    }
  }

  async #translateActiveEditor() {
    if (!this.#config?.translation?.enabled) {
      this.#setStatus("AI Assistant is disabled", "error");
      return;
    }

    if (this.#isProcessing || !this.#activeEditor) {
      return;
    }

    const editor = this.#activeEditor;
    const text = this.#getEditorText(editor);
    if (!text.trim()) {
      this.#setStatus("Nothing to translate", "error");
      return;
    }

    const targetLanguage = this.#getSelectedLanguage();
    this.#setActionState(true);
    this.#setStatus("");

    try {
      const result = await globalThis.electronAPI.translateText({
        text,
        targetLanguage,
      });

      this.#debug("translation-result", {
        success: result?.success,
        provider: result?.provider,
        hasText: typeof result?.text === "string" && result.text.length > 0,
        error: result?.error || null,
      });

      if (!result?.success) {
        this.#setStatus(result?.error || "Translation failed", "error");
        return;
      }

      const writeResult = await this.#writeEditorText(editor, result.text);
      this.#debug("editor-write-result", {
        action: "translate",
        success: writeResult.success,
        strategy: writeResult.strategy,
        instancePath: writeResult.instancePath || null,
        editorTag: editor?.tagName || null,
        isContentEditable: editor?.isContentEditable || false,
        role: editor?.getAttribute?.("role") || null,
        dataTid: editor?.getAttribute?.("data-tid") || null,
        ariaLabel: editor?.getAttribute?.("aria-label") || null,
        currentTextLength: this.#getEditorText(editor).length,
      });

      if (!writeResult.success) {
        this.#setStatus(
          "Translation succeeded but the editor could not be updated",
          "error"
        );
        return;
      }
    } catch (error) {
      this.#setStatus(error.message || "Translation failed", "error");
    } finally {
      this.#setActionState(false);
      this.#scheduleReposition();
    }
  }
}

module.exports = new InlineTranslate();
