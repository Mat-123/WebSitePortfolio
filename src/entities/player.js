import { k } from "../kaboomCtx";
import { scaleFactor } from "../constants";

export function createPlayer() {
  const player = k.make([
    k.sprite("spritesheet", { anim: "idle-down" }),
    k.area({
      shape: new k.Rect(k.vec2(0, 3), 10, 10),
    }),
    k.body(),
    k.anchor("center"),
    k.pos(),
    k.scale(scaleFactor),
    {
      speed: 250,
      direction: "down",
      isInDialogue: false,
      isMovingKeyboard: false,
      isMovingMouse: false,
      currentAnimation: "idle-down",
      wasInDialogue: false,
    },
    "player",
  ]);

  return player;
}

export function setupPlayerMovement(player) {
  // Helper function to safely change animations
  function changeAnimation(animName) {
    if (player.currentAnimation !== animName) {
      player.currentAnimation = animName;
      player.play(animName);
      console.log("Playing animation:", animName); // Debug log
    }
  }

  // Helper function to reset all movement states
  function resetMovementStates() {
    player.isMovingKeyboard = false;
    player.isMovingMouse = false;
    player.stop(); // Stop any ongoing movement

    // Play appropriate idle animation
    if (player.direction === "down") {
      changeAnimation("idle-down");
    } else if (player.direction === "up") {
      changeAnimation("idle-up");
    } else {
      changeAnimation("idle-side");
    }
  }

  // Mouse movement
  k.onMouseDown((mouseBtn) => {
    if (mouseBtn !== "left" || player.isInDialogue) return;

    const worldMousePos = k.toWorld(k.mousePos());
    player.moveTo(worldMousePos, player.speed);
    player.isMovingMouse = true;

    const mouseAngle = player.pos.angle(worldMousePos);
    const lowerBound = 50;
    const upperBound = 125;

    if (mouseAngle > lowerBound && mouseAngle < upperBound) {
      changeAnimation("walk-up");
      player.direction = "up";
      return;
    }

    if (mouseAngle < -lowerBound && mouseAngle > -upperBound) {
      changeAnimation("walk-down");
      player.direction = "down";
      return;
    }

    if (Math.abs(mouseAngle) > upperBound) {
      player.flipX = false;
      changeAnimation("walk-side");
      player.direction = "right";
      return;
    }

    if (Math.abs(mouseAngle) < lowerBound) {
      player.flipX = true;
      changeAnimation("walk-side");
      player.direction = "left";
      return;
    }
  });

  k.onMouseRelease(() => {
    if (!player.isInDialogue) {
      player.isMovingMouse = false;
      // Play idle animation based on current direction
      if (player.direction === "down") {
        changeAnimation("idle-down");
      } else if (player.direction === "up") {
        changeAnimation("idle-up");
      } else {
        changeAnimation("idle-side");
      }
    }
  });

  // Track previous position for movement detection
  let previousPos = player.pos.clone();

  // Keyboard movement
  k.onUpdate(() => {
    // Check if dialogue state changed
    if (player.isInDialogue && !player.wasInDialogue) {
      // Just entered dialogue - reset all movement
      resetMovementStates();
      player.wasInDialogue = true;
      return;
    } else if (!player.isInDialogue && player.wasInDialogue) {
      // Just exited dialogue - reset states and allow movement again
      resetMovementStates();
      player.wasInDialogue = false;
    }

    // Skip movement processing if in dialogue
    if (player.isInDialogue) return;

    // Check keyboard input
    const moveLeft = k.isKeyDown("left") || k.isKeyDown("a");
    const moveRight = k.isKeyDown("right") || k.isKeyDown("d");
    const moveUp = k.isKeyDown("up") || k.isKeyDown("w");
    const moveDown = k.isKeyDown("down") || k.isKeyDown("s");

    const anyKeyPressed = moveLeft || moveRight || moveUp || moveDown;

    // Handle keyboard movement
    if (anyKeyPressed) {
      // Stop mouse movement if keyboard is being used
      if (player.isMovingMouse) {
        player.stop();
        player.isMovingMouse = false;
      }

      player.isMovingKeyboard = true;

      let velocity = k.vec2(0, 0);
      let newDirection = player.direction;

      // Calculate velocity and direction
      if (moveLeft) {
        velocity.x -= player.speed;
        newDirection = "left";
      }
      if (moveRight) {
        velocity.x += player.speed;
        newDirection = "right";
      }
      if (moveUp) {
        velocity.y -= player.speed;
        newDirection = "up";
      }
      if (moveDown) {
        velocity.y += player.speed;
        newDirection = "down";
      }

      // For diagonal movement, prioritize up/down over left/right for animation
      if (moveUp && !moveDown) {
        newDirection = "up";
      } else if (moveDown && !moveUp) {
        newDirection = "down";
      } else if (moveLeft && !moveRight && !moveUp && !moveDown) {
        newDirection = "left";
      } else if (moveRight && !moveLeft && !moveUp && !moveDown) {
        newDirection = "right";
      }

      // Normalize diagonal movement
      if (velocity.x !== 0 && velocity.y !== 0) {
        velocity = velocity.unit().scale(player.speed);
      }

      // Apply movement
      player.move(velocity);

      // Update direction and play walking animation only if direction changed
      if (newDirection !== player.direction) {
        player.direction = newDirection;
      }

      // Play appropriate walking animation
      if (newDirection === "up") {
        changeAnimation("walk-up");
      } else if (newDirection === "down") {
        changeAnimation("walk-down");
      } else if (newDirection === "left") {
        player.flipX = true;
        changeAnimation("walk-side");
      } else if (newDirection === "right") {
        player.flipX = false;
        changeAnimation("walk-side");
      }
    } else {
      // No keyboard input
      if (player.isMovingKeyboard) {
        player.isMovingKeyboard = false;
        // Play idle animation
        if (player.direction === "down") {
          changeAnimation("idle-down");
        } else if (player.direction === "up") {
          changeAnimation("idle-up");
        } else {
          changeAnimation("idle-side");
        }
      }
    }

    // Check if mouse movement should continue playing walking animation
    if (player.isMovingMouse && !player.isMovingKeyboard) {
      const currentPos = player.pos.clone();
      const actuallyMoving = !currentPos.eq(previousPos);

      if (!actuallyMoving) {
        // Stopped moving (probably hit boundary), play idle
        player.isMovingMouse = false;
        if (player.direction === "down") {
          changeAnimation("idle-down");
        } else if (player.direction === "up") {
          changeAnimation("idle-up");
        } else {
          changeAnimation("idle-side");
        }
      }

      previousPos = currentPos.clone();
    } else {
      previousPos = player.pos.clone();
    }
  });
}
