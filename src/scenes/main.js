import { k } from "../kaboomCtx";
import { scaleFactor } from "../constants";
import { displayDialogue, setCamScale } from "../utils";
import { createPlayer, setupPlayerMovement } from "../entities/player";
import { languageManager } from "../language";

// Function to handle interactive object dialogues
function handleInteraction(player, dialogueKey) {
  player.isInDialogue = true;
  const dialogueData = languageManager.getDialogueData();
  let currentDialogue = dialogueData[dialogueKey];

  function showDialogue(dialogueContent) {
    if (!dialogueContent) {
      console.error("Dialogue content is undefined for key:", dialogueKey);
      player.isInDialogue = false;
      return;
    }

    const onDialogueEnd = () => {
      player.isInDialogue = false;
    };

    if (typeof dialogueContent === "string") {
      displayDialogue(dialogueContent, false, null, null, onDialogueEnd);
    } else if (dialogueContent.options) {
      // If it has options, it's a complex dialogue node
      displayDialogue(
        dialogueContent.text,
        false,
        dialogueContent.options,
        (nextDialogueKeyOrResponse) => {
          // Check if the selected option leads to another dialogue key or is a direct response string
          const nextContent = dialogueData[nextDialogueKeyOrResponse];
          if (nextContent) {
            currentDialogue = nextContent;
            dialogueKey = nextDialogueKeyOrResponse;
            showDialogue(currentDialogue);
          } else {
            // It's a direct response string (e.g. mom's answers)
            showDialogue(nextDialogueKeyOrResponse);
          }
        },
        onDialogueEnd
      );
    } else {
      // It's a simple dialogue node with no options (e.g. project description)
      displayDialogue(dialogueContent.text || dialogueContent, false, null, null, onDialogueEnd);
    }
  }
  showDialogue(currentDialogue);
}

export function createMainScene() {
  k.scene("main", async () => {
    const mapData = await (await fetch("./map.json")).json();
    const layers = mapData.layers;
    const introText = languageManager.getUIText("introText");

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

    // Display intro text with click-to-close functionality
    displayDialogue(introText, true);

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

    player.onCollide("mom", () => {
      const yDiff = Math.abs(player.pos.y - mom.pos.y);

      if (yDiff > 35) {
        if (player.pos.y < mom.pos.y) {
          mom.play("mom-up");
        } else if (player.pos.y > mom.pos.y) {
          mom.play("mom-down");
        }
      } else {
        if (mom.curAnim() !== "mom-side") {
          mom.play("mom-side");
        }
      }
    });
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
