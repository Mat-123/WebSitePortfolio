//Gestione dei dialoghi
export function displayDialogue(text, options, onOptionSelected, onDisplayEnd) {
    const dialogueUI = document.getElementById("textbox-container");
    const dialogue = document.getElementById("dialogue");

    dialogueUI.style.display = "block";

    let index = 0;
    let currentText = "";
    const intervalRef = setInterval(() => {
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
                    onOptionSelected(options[option]);
                });
                dialogue.appendChild(optionElement);
            }
        }
    }, 5);

    document.addEventListener("keydown", (event) => {
        if (event.code === "Space") {
            onCloseBtnClick();
        }
    });

    const closeBtn = document.getElementById("close");
    function onCloseBtnClick() {
        onDisplayEnd();
        dialogueUI.style.display = "none";
        dialogue.innerHTML = "";
        clearInterval(intervalRef);
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