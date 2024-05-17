import { dialogueData, scaleFactor } from "./constants";
import { k } from "./kaboomCtx";
import { displayDialogue, setCamScale } from "./utils";

// Caricamento dello sprite "spritesheet" con varie animazioni
k.loadSprite("spritesheet", "./spritesheet.png", {
    sliceX: 2,
    sliceY: 15,
    anims: {
        "idle-down": 4,
        "walk-down": { from: 4, to: 7, loop: true, speed: 8 },
        "idle-side": 8,
        "walk-side": {from: 8, to: 11, loop: true, speed: 8 },
        "idle-up": 0,
        "walk-up": { from: 0, to: 3, loop: true, speed: 8},
        "mom-up": 22,
        "mom-down": 20,
        "mom-side": 21,
    },
});

// Caricamento dello sprite "tables" con animazioni
k.loadSprite("tables", "./tables.png", {
    sliceX: 4,
    sliceY: 1,
    anims: {
        "pc-on": {from: 0, to: 3, loop: true, speed:2}
    }
})

// Caricamento dello sprite "tv" con animazioni del pg principale
k.loadSprite("tv", "./tv.png", {
sliceX: 1,
sliceY: 5,
anims: {
"changecolor":{from: 0, to: 4, loop: true, speed: 4}},
});


// Caricamento dello sprite "map"
k.loadSprite("map", "./map.png");

// Impostazione del colore di sfondo
k.setBackground(k.Color.fromHex("#1e2945"));

// Definizione della scena "start" che avvia il gioco
k.scene("start", () => {
    // Testo iniziale da mostrare
    const startText = "Premi barra spaziatrice o fai click col mouse per avviare il gioco";

    displayDialogue(startText, null, () => {
        k.go("main");
    }, () => {});


    const closeButton = document.getElementById("close");
    if (closeButton) {
        closeButton.style.display = "none";
    }

    function closeDialogue() {
        const dialogueUI = document.getElementById("textbox-container");
        dialogueUI.style.display = "none";
    }

    // Avvio del gioco principale alla pressione della barra spaziatrice
    k.onKeyPress("space", () => {
        closeDialogue();
        k.go("main");
        closeButton.style.display = "block";
    });

    // Avvio del gioco principale alla pressione del mouse
    k.onMousePress(() => {
        closeDialogue();
        k.go("main");
        closeButton.style.display = "block";
    });
});

// Definizione della scena "main"
k.scene("main", async () => {
    const mapData = await (await fetch("./map.json")).json();
    const layers = mapData.layers;
    const introText = 'Benvenuto nel portfolio di <span style="font-weight: bold;">Ｍａｔ-123</span>!\nSe non trovi qualcosa chiedi alla mamma.\nTutti gli oggetti nella stanza sono interattivi.';

    const map = k.add([
        k.sprite("map"),
        k.pos(0),
        k.scale(scaleFactor)
    ]);

    // Creazione del giocatore con relative proprietà
    const player = k.make([k.sprite("spritesheet", {anim: "idle-down"}), k.area(
    {shape: new k.Rect(k.vec2(0, 3), 10, 10)}
    ),
    k.body(),
    k.anchor("center"),
    k.pos(),
    k.scale(scaleFactor),
    {
        speed: 250,
        direction: "down",
        isInDialogue: false,
    },
    "player", 
]);


const mom = k.make([
    k.sprite("spritesheet", {anim: "mom-side"}),
    k.pos(448, 200), 
    k.scale(scaleFactor),
]);

k.add(mom);

const tv = k.make([
    k.sprite("tv", { anim: "changecolor"}),

    k.scale(scaleFactor),
]);

k.add(tv);


const pcTable = k.make([
    k.sprite("tables", {anim: "pc-on"}),
    k.pos(128, 64),
    k.scale(scaleFactor),
]);

k.add(pcTable)

displayDialogue(introText)

    // Aggiunta dei vari layer dalla mappa
for (const layer of layers) {
    if (layer.name === "boundaries") {
        for (const boundary of layer.objects) {
            map.add([
                k.area({
                shape: new k.Rect(k.vec2(0), boundary.width, boundary.height),
            }),
            k.body({isStatic: true}),
            k.pos(boundary.x, boundary.y),
            boundary.name,
            ]);

            // Gestione delle collisioni del giocatore con i confini
            if (boundary.name) {
                player.onCollide(boundary.name, () => {
                    player.isInDialogue = true;
                    const dialogue = dialogueData[boundary.name];
                    if (dialogue.options) {
                        displayDialogue(dialogue.text, dialogue.options, (response) => {
                            displayDialogue(response, null, null, () => {
                                player.isInDialogue = false;
                            });
                        }, () => {
                            player.isInDialogue = false;
                        });
                    } else {
                        displayDialogue(dialogue, null, null, () => {
                            player.isInDialogue = false;
                        });
                    }
                })
            }
        }
        continue;
    }
    if (layer.name === "spawnpoint") {
        for (const entity of layer.objects) {
            if(entity.name === "player") {
                player.pos = k.vec2(
                    (map.pos.x + entity.x) * scaleFactor,
                    (map.pos.y + entity.y) * scaleFactor
                );
                k.add(player);
                continue;
            }
        }
    }
}

setCamScale(k)

k.onResize(() => {
    setCamScale(k);
})

k.onUpdate(() => {
    k.camPos(player.pos.x, player.pos.y + 100);
});


// Gestione del movimento del giocatore tramite il mouse
k.onMouseDown((mouseBtn) => {
    if (mouseBtn !== "left" || player.isInDialogue) return;

    const worldMousePos = k.toWorld(k.mousePos());
    player.moveTo(worldMousePos, player.speed);

    const mouseAngle = player.pos.angle(worldMousePos)

    const lowerBound = 50;
    const upperBound = 125;

    if (
        mouseAngle > lowerBound &&
        mouseAngle < upperBound &&
        player.curAnim() !== "walk-up"
    ) {
        player.play("walk-up");
        player.direction = "up";
        return;
    }

    if (
        mouseAngle < -lowerBound &&
        mouseAngle > -upperBound &&
        player.curAnim() !== "walk-down"
    ) {
        player.play("walk-down");
        player.direction = "down";
        return;
    }

    if (Math.abs(mouseAngle) > upperBound) {
        player.flipX = false;
        if (player.curAnim() !== "walk-side") player.play("walk-side")
            player.direction = "right";
        return;
    }

    if (Math.abs(mouseAngle) < lowerBound) {
        player.flipX = true;
        if (player.curAnim() !== "walk-side") player.play("walk-side")
            player.direction = "left";
        return;
    }
});

k.onMouseRelease(() => {
    if (player.direction === "down") {
        player.play("idle-down");
        return;
    }
    if (player.direction === "up") {
        player.play("idle-up");
        return;
    }

    player.play("idle-side");

});



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


});

// Avvia la scena iniziale
k.go("start");