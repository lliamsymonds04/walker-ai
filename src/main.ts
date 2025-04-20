import Matter from "matter-js";

import { getApp, getEngine} from "./AppInitializer";
import { createGround } from "./Ground";
import { SimulationHandler } from "./Simulation/SimulationHandler";

(async () => {
  const app = getApp();

  // Initialize the application
  await app.init({ background: "#1099bb", resizeTo: window });

  // Append the application canvas to the document body
  document.getElementById("pixi-container")!.appendChild(app.canvas);

  // Setup the matter engine
  const Engine = Matter.Engine;
  
  const engine = getEngine();

  //add ground
  createGround(100);
  
  // Listen for animate update
  app.ticker.add((ticker) => {
    const dt = ticker.deltaMS;
    Engine.update(engine)
    // testWalker.update();
  });
})();
