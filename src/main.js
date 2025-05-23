import { k } from "./kaboomCtx";
import { loadSprites } from "./loaders/sprites";
import { createStartScene } from "./scenes/start";
import { createMainScene } from "./scenes/main";

// Set background color
k.setBackground(k.Color.fromHex("#1e2945"));

// Load all sprites
loadSprites();

// Create scenes
createStartScene();
createMainScene();

// Start the game
k.go("start");
