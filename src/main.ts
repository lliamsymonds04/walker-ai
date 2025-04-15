import Matter from "matter-js";

import { getApp, getEngine} from "./AppInitializer";

(async () => {
  // Create a new application
  const app = getApp();

  // Initialize the application
  await app.init({ background: "#1099bb", resizeTo: window });

  // Append the application canvas to the document body
  document.getElementById("pixi-container")!.appendChild(app.canvas);

  // Setup the matter engine
  const World = Matter.World;
  const Bodies = Matter.Bodies;
  
  const engine = getEngine();

  //add ground
  const ground = Bodies.rectangle(
    app.screen.width / 2,
    app.screen.height - 10,
    app.screen.width,
    20,
    { isStatic: true }
  );
  World.add(engine.world, ground);

  
  // Listen for animate update
  app.ticker.add((time) => {
    // * Delta is 1 if running at 100% performance *
    // * Creates frame-independent transformation *
  });
})();
