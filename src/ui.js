import { languageManager } from "./language";

// UI Controller for handling language switching and other UI interactions
export class UIController {
  constructor() {
    this.initLanguageSwitcher();
    this.setupLanguageChangeCallback();
  }

  initLanguageSwitcher() {
    const languageSwitcher = document.getElementById("language-switcher");
    if (languageSwitcher) {
      languageSwitcher.addEventListener("click", () => {
        languageManager.switchLanguage();
      });

      // Update button text based on current language
      this.updateLanguageSwitcherText();
    }
  }

  updateLanguageSwitcherText() {
    const languageSwitcher = document.getElementById("language-switcher");
    if (languageSwitcher) {
      const currentLang = languageManager.getCurrentLanguage();
      if (currentLang === "it") {
        languageSwitcher.textContent = "🇬🇧 EN";
        languageSwitcher.title = "Switch to English";
      } else {
        languageSwitcher.textContent = "🇮🇹 IT";
        languageSwitcher.title = "Passa all'italiano";
      }
    }
  }

  setupLanguageChangeCallback() {
    languageManager.setLanguageChangeCallback((newLang) => {
      this.updateLanguageSwitcherText();
    });
  }
}

// Initialize UI controller when DOM is loaded
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    new UIController();
  });
} else {
  new UIController();
}
