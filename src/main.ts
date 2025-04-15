import Matter from "matter-js";

import { getApp, getEngine} from "./AppInitializer";
import { Walker } from "./Walker/Walker";
import { createGround } from "./Ground";

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
  
  const testWalker = new Walker(1, 500, 100, 40, 50); 
  // Listen for animate update
  app.ticker.add(() => {
    // * Delta is 1 if running at 100% performance *
    // * Creates frame-independent transformation *
    
    Engine.update(engine)
    testWalker.update();
  });
})();
