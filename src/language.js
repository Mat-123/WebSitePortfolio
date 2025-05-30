// Language management system
class LanguageManager {
  constructor() {
    this.currentLanguage = this.getStoredLanguage() || "it"; // Default to Italian
    this.dialogueData = {};
    this.uiTexts = {
      it: {
        close: "Chiudi",
        moveInstruction: "Tap/Click around to move",
        introText:
          'Benvenuto nel portfolio di <span style="font-weight: bold;">Ｍａｔ-123</span>!\nSe non trovi qualcosa chiedi alla mamma.\nTutti gli oggetti nella stanza sono interattivi.',
      },
      en: {
        close: "Close",
        moveInstruction: "Tap/Click around to move",
        introText:
          "Welcome to <span style=\"font-weight: bold;\">Ｍａｔ-123</span>'s portfolio!\nIf you can't find something, ask mom.\nAll objects in the room are interactive.",
      },
    };
    this.onLanguageChange = null;
    this.kaboomCtx = null;
  }

  setKaboomContext(k) {
    this.kaboomCtx = k;
  }

  async loadLanguage(lang) {
    try {
      const response = await fetch(`./src/data/dialogue-${lang}.json`);
      if (!response.ok) {
        throw new Error(`Failed to load language ${lang}`);
      }
      this.dialogueData = await response.json();
      this.currentLanguage = lang;
      this.storeLanguage(lang);

      // Update UI texts
      this.updateUITexts();

      // Trigger callback if set
      if (this.onLanguageChange) {
        this.onLanguageChange(lang);
      }
    } catch (error) {
      console.error("Error loading language:", error);
      // Fallback to Italian if English fails
      if (lang !== "it") {
        await this.loadLanguage("it");
      }
    }
  }

  updateUITexts() {
    // Update close button
    const closeButton = document.getElementById("close");
    if (closeButton) {
      closeButton.textContent = this.uiTexts[this.currentLanguage].close;
    }

    // Update movement instruction
    const noteElement = document.querySelector(".note");
    if (noteElement) {
      noteElement.textContent = this.uiTexts[this.currentLanguage].moveInstruction;
    }
  }

  async switchLanguage() {
    const newLang = this.currentLanguage === "it" ? "en" : "it";
    await this.loadLanguage(newLang);

    // Restart the main scene if we're currently in it
    if (this.kaboomCtx && this.kaboomCtx.getCurScene()?.name === "main") {
      this.kaboomCtx.go("main");
    }
  }

  getCurrentLanguage() {
    return this.currentLanguage;
  }

  getDialogueData() {
    return this.dialogueData;
  }

  getUIText(key) {
    return this.uiTexts[this.currentLanguage][key];
  }

  getStoredLanguage() {
    return localStorage.getItem("portfolio_language");
  }

  storeLanguage(lang) {
    localStorage.setItem("portfolio_language", lang);
  }

  setLanguageChangeCallback(callback) {
    this.onLanguageChange = callback;
  }
}

// Create global instance
export const languageManager = new LanguageManager();
