export const scaleFactor = 4;

// Import dialogue data from JSON file
export const dialogueData = await (await fetch("./data/dialogue.json")).json();
