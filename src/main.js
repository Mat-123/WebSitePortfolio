import { k } from "./kaboomCtx";
import { loadSprites } from "./loaders/sprites";
import { createStartScene } from "./scenes/start";
import { createMainScene } from "./scenes/main";
import { languageManager } from "./language";
import "./ui";

// Make k globally available for UI controller and set it in language manager
window.k = k;
languageManager.setKaboomContext(k);

// Set background color
k.setBackground(k.Color.fromHex("#1e2945"));

// Load all sprites
loadSprites();

// Create scenes
createStartScene();
createMainScene();

// Ensure game canvas has focus for keyboard input
function ensureCanvasFocus() {
  const gameCanvas = document.getElementById("game");
  if (gameCanvas) {
    gameCanvas.focus();
    console.log("Initial focus set to game canvas");
  }
}

// Initialize language system and start the game
async function initGame() {
  await languageManager.loadLanguage(languageManager.getCurrentLanguage());
  k.go("start");

  // Set focus to canvas after game starts
  setTimeout(ensureCanvasFocus, 100);
}

initGame();
