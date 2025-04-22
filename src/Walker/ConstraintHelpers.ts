import {Body, Bodies, Constraint} from "matter-js";


export function makeConnector(bodyA: Body, bodyB: Body, ax: number, ay: number, bx: number, by: number): Constraint {
    return Constraint.create({
        bodyA: bodyA,
        bodyB: bodyB,
        pointA: { x: ax, y: ay },
        pointB: { x: bx, y: by },
        stiffness: 0.7,
        damping: 0.1,
        length: 0,
        
    });
}

export function createLimb(x: number, y: number, width: number, height: number, id: number): Body {
    const densityMult = 1.6;
    return Bodies.rectangle(x, y, width, height, {
        collisionFilter: {
            // group: -id,
            category: 1 << id,
            mask: (1 << id) | 0x0001,
        },
        frictionAir: 0.2,
        density: 0.001 * densityMult,
        friction: 0.5,
    });
}

export function applyTorque(body: Body, torqueScalar: number, armLength = 30) {
    const angle = body.angle;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
  
    // Force magnitude based on torque and arm length
    const forceMag = torqueScalar / armLength;
  
    // Offset positions on either side of the center (relative to rotation)
    const offsetA = {
      x: body.position.x + armLength * cos,
      y: body.position.y + armLength * sin,
    };
  
    const offsetB = {
      x: body.position.x - armLength * cos,
      y: body.position.y - armLength * sin,
    };
  
    // Apply forces at the two offsets
    const force = {
      x: -forceMag * sin, // perpendicular to offset arm
      y:  forceMag * cos,
    };
  
    const oppositeForce = {
      x: -force.x,
      y: -force.y,
    };
  
    Body.applyForce(body, offsetA, force);
    Body.applyForce(body, offsetB, oppositeForce);
}
  
export function getAngleInfo(body: Body, relativeTo?: Body): {angle: number, angularVelocity: number} {
  const angle = relativeTo ? body.angle - relativeTo.angle : body.angle;
  const angularVelocity = relativeTo ? body.angularVelocity - relativeTo.angularVelocity : body.angularVelocity;
  
  return {
    angle,
    angularVelocity,
  };
}