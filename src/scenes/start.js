import { k } from "../kaboomCtx";
import { displayDialogue } from "../utils";

export function createStartScene() {
  k.scene("start", () => {
    const startText = "Premi barra spaziatrice o fai click col mouse per avviare il gioco.";

    displayDialogue(
      startText,
      null,
      () => {
        k.go("main");
      },
      () => {}
    );

    const closeButton = document.getElementById("close");
    if (closeButton) {
      closeButton.style.display = "none";
    }

    function closeDialogue() {
      const dialogueUI = document.getElementById("textbox-container");
      dialogueUI.style.display = "none";
    }

    k.onKeyPress("space", () => {
      closeDialogue();
      k.go("main");
      closeButton.style.display = "block";
    });

    k.onMousePress(() => {
      closeDialogue();
      k.go("main");
      closeButton.style.display = "block";
    });
  });
}
