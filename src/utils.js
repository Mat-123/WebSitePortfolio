//Gestione dei dialoghi
export function displayDialogue(text, allowClickToClose = false, options, onOptionSelected, onDisplayEnd) {
  const dialogueUI = document.getElementById("textbox-container");
  const dialogue = document.getElementById("dialogue");

  dialogueUI.style.display = "block";

  let index = 0;
  let currentText = "";
  let intervalRef;
  let clickHandler;
  let dialogueClickHandler;

  // Provide default onDisplayEnd if not provided
  const defaultOnDisplayEnd = () => {
    dialogueUI.style.display = "none";
    dialogue.innerHTML = "";
  };

  const actualOnDisplayEnd = onDisplayEnd || defaultOnDisplayEnd;

  intervalRef = setInterval(() => {
    if (index < text.length) {
      currentText += text[index];
      dialogue.innerHTML = currentText;
      index++;
      return;
    }

    clearInterval(intervalRef);

    if (options) {
      for (const option in options) {
        const optionElement = document.createElement("p");
        optionElement.innerHTML = option;
        optionElement.classList.add("clickable-option");
        optionElement.addEventListener("click", () => {
          dialogue.innerHTML = "";
          if (clickHandler) {
            document.removeEventListener("click", clickHandler);
            dialogueUI.removeEventListener("click", dialogueClickHandler);
          }
          if (onOptionSelected) {
            onOptionSelected(options[option]);
          }
        });
        dialogue.appendChild(optionElement);
      }
    }
  }, 5);

  // Add click-to-close functionality if enabled
  if (allowClickToClose) {
    // console.log("Setting up click-to-close for intro text");
    
    const closeDialogue = () => {
      // console.log("Click-to-close triggered");
      clearInterval(intervalRef);
      if (clickHandler) {
        document.removeEventListener("click", clickHandler);
      }
      if (dialogueClickHandler) {
        dialogueUI.removeEventListener("click", dialogueClickHandler);
      }
      document.removeEventListener("keydown", keyHandler);
      actualOnDisplayEnd();
    };

    clickHandler = (event) => {
      // Prevent closing when clicking on options or close button
      if (event.target.classList.contains('clickable-option') || 
          event.target.id === 'close' ||
          event.target.closest('#textbox-container')) {
        return;
      }
      
      // console.log("Document click detected", event.target);
      closeDialogue();
    };

    dialogueClickHandler = (event) => {
      // Allow clicking on the dialogue container itself to close
      if (event.target === dialogueUI || event.target === dialogue) {
        // console.log("Dialogue container click detected");
        closeDialogue();
      }
    };
    
    // Add click listeners after a small delay to prevent immediate closing
    setTimeout(() => {
      // console.log("Adding click listeners");
      document.addEventListener("click", clickHandler);
      dialogueUI.addEventListener("click", dialogueClickHandler);
    }, 200);
  }

  const keyHandler = (event) => {
    if (event.code === "Space") {
      onCloseBtnClick();
    }
  };

  document.addEventListener("keydown", keyHandler);

  const closeBtn = document.getElementById("close");
  function onCloseBtnClick() {
    actualOnDisplayEnd();
    dialogueUI.style.display = "none";
    dialogue.innerHTML = "";
    clearInterval(intervalRef);
    if (clickHandler) {
      document.removeEventListener("click", clickHandler);
    }
    if (dialogueClickHandler) {
      dialogueUI.removeEventListener("click", dialogueClickHandler);
    }
    document.removeEventListener("keydown", keyHandler);
    closeBtn.removeEventListener("click", onCloseBtnClick);
  }
  closeBtn.addEventListener("click", onCloseBtnClick);
}

export function setCamScale(k) {
  const resizeFactor = k.width() / k.height();
  if (resizeFactor < 1) {
    k.camScale(k.vec2(1));
    return;
  }
  k.camScale(k.vec2(1.5));
}
