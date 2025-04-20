import { getApp, getEngine} from "./AppInitializer";
import { createGround } from "./Ground";
import { SimulationHandler } from "./Simulation/SimulationHandler";

(async () => {
  const app = getApp();

  // Initialize the application
  await app.init({ background: "#1099bb", resizeTo: window });

  // Append the application canvas to the document body
  document.getElementById("pixi-container")!.appendChild(app.canvas);

  
  const engine = getEngine();

  //add ground
  await createGround(100);
  
  const simulationHandler = new SimulationHandler(engine, 25);
  // Listen for animate update
  app.ticker.add((ticker) => {
    const dt = ticker.deltaMS;
    
    simulationHandler.update(dt);
  });
})();
