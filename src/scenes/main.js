import { k } from "../kaboomCtx";
import { dialogueData, scaleFactor } from "../constants";
import { displayDialogue, setCamScale } from "../utils";
import { createPlayer, setupPlayerMovement } from "../entities/player";

// Function to handle interactive object dialogues
function handleInteraction(player, dialogueKey) {
  player.isInDialogue = true;
  let currentDialogue = dialogueData[dialogueKey];

  function showDialogue(dialogueContent) {
    if (!dialogueContent) {
      console.error("Dialogue content is undefined for key:", dialogueKey);
      player.isInDialogue = false;
      return;
    }

    if (typeof dialogueContent === "string") {
      // If it's a string, display it directly (e.g., simple responses from mom)
      displayDialogue(dialogueContent, null, null, () => {
        player.isInDialogue = false;
      });
    } else if (dialogueContent.options) {
      // If it has options, it's a complex dialogue node
      displayDialogue(
        dialogueContent.text,
        dialogueContent.options,
        (nextDialogueKeyOrResponse) => {
          // Check if the selected option leads to another dialogue key or is a direct response string
          const nextContent = dialogueData[nextDialogueKeyOrResponse];
          if (nextContent) {
            currentDialogue = nextContent;
            dialogueKey = nextDialogueKeyOrResponse; // Update dialogueKey for error reporting
            showDialogue(currentDialogue);
          } else {
            // It's a direct response string (e.g. mom's answers)
            showDialogue(nextDialogueKeyOrResponse);
          }
        },
        () => {
          player.isInDialogue = false;
        }
      );
    } else {
      // It's a simple dialogue node with no options (e.g. project description)
      displayDialogue(dialogueContent.text || dialogueContent, null, null, () => {
        player.isInDialogue = false;
      });
    }
  }
  showDialogue(currentDialogue);
}

export function createMainScene() {
  k.scene("main", async () => {
    const mapData = await (await fetch("./map.json")).json();
    const layers = mapData.layers;
    const introText =
      'Benvenuto nel portfolio di <span style="font-weight: bold;">Ｍａｔ-123</span>!\nSe non trovi qualcosa chiedi alla mamma.\nTutti gli oggetti nella stanza sono interattivi.';

    // Create map
    const map = k.add([k.sprite("map"), k.pos(0), k.scale(scaleFactor)]);

    // Create player
    const player = createPlayer();
    setupPlayerMovement(player);

    // Create mom character
    const mom = k.make([k.sprite("spritesheet", { anim: "mom-side" }), k.pos(448, 200), k.scale(scaleFactor)]);
    k.add(mom);

    // Create TV
    const tv = k.make([k.sprite("tv", { anim: "changecolor" }), k.scale(scaleFactor)]);
    k.add(tv);

    // Create PC table
    const pcTable = k.make([k.sprite("tables", { anim: "pc-on" }), k.pos(128, 64), k.scale(scaleFactor)]);
    k.add(pcTable);

    displayDialogue(introText);

    // Add map layers
    for (const layer of layers) {
      if (layer.name === "boundaries") {
        for (const boundary of layer.objects) {
          map.add([
            k.area({
              shape: new k.Rect(k.vec2(0), boundary.width, boundary.height),
            }),
            k.body({ isStatic: true }),
            k.pos(boundary.x, boundary.y),
            boundary.name,
          ]);

          if (boundary.name) {
            player.onCollide(boundary.name, () => {
              handleInteraction(player, boundary.name);
            });
          }
        }
        continue;
      }
      if (layer.name === "spawnpoint") {
        for (const entity of layer.objects) {
          if (entity.name === "player") {
            player.pos = k.vec2((map.pos.x + entity.x) * scaleFactor, (map.pos.y + entity.y) * scaleFactor);
            k.add(player);
            continue;
          }
        }
      }
    }

    // Setup camera
    setCamScale(k);
    k.onResize(() => {
      setCamScale(k);
    });

    k.onUpdate(() => {
      k.camPos(player.pos.x, player.pos.y + 100);
    });
  });
}
