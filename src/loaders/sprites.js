import { k } from "../kaboomCtx";

export function loadSprites() {
  // Load main spritesheet
  k.loadSprite("spritesheet", "./spritesheet.png", {
    sliceX: 2,
    sliceY: 15,
    anims: {
      "idle-down": 4,
      "walk-down": { from: 4, to: 7, loop: true, speed: 8 },
      "idle-side": 8,
      "walk-side": { from: 8, to: 11, loop: true, speed: 8 },
      "idle-up": 0,
      "walk-up": { from: 0, to: 3, loop: true, speed: 8 },
      "mom-up": 22,
      "mom-down": 20,
      "mom-side": 21,
    },
  });

  // Load tables sprite
  k.loadSprite("tables", "./tables.png", {
    sliceX: 4,
    sliceY: 1,
    anims: {
      "pc-on": { from: 0, to: 3, loop: true, speed: 2 },
    },
  });

  // Load TV sprite
  k.loadSprite("tv", "./tv.png", {
    sliceX: 1,
    sliceY: 5,
    anims: {
      changecolor: { from: 0, to: 4, loop: true, speed: 4 },
    },
  });

  // Load map sprite
  k.loadSprite("map", "./map.png");
}
