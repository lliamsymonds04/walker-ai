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

export function createLimb(x: number, y: number, width: number, height: number, bodyCategory: number, limbCategory: number): Body {
    const densityMult = 2;
    return Bodies.rectangle(x, y, width, height, {
        collisionFilter: {
            category: limbCategory,
            mask: 0x0001 | bodyCategory,
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


const limitDamping = 0.1;
/* export function setAngularVelocity(limb: Body, velocity: number, parent: Body, angleLimit: number) {
    const parentAngle = parent.angle;
    var maxAng = parentAngle + angleLimit;
    var minAng = parentAngle - angleLimit;
    
    const limbAngle = limb.angle;

    var outputVelocity = velocity;
    if (limbAngle > maxAng && velocity > 0) {
        outputVelocity = -velocity * limitDamping; 
        console.log("limbAngle > maxAng", limbAngle, maxAng);
    } else if (limbAngle < minAng && velocity < 0) {
        outputVelocity = -velocity * limitDamping;
        console.log("limbAngle < minAng", limbAngle, maxAng);
    }
    
    Body.setAngularVelocity(limb, outputVelocity);
} */

/* 
const limitStiffness = 0.03; // Stiffness for the limit correction
export function setAngularVelocity(limb: Body, velocity: number, parent: Body, angleLimit: number) {
    // Normalize angles to handle wrap-around
    const parentAngle = parent.angle % (2 * Math.PI);
    let limbAngle = limb.angle % (2 * Math.PI);
    
    // Calculate relative angle between limb and parent
    let relativeAngle = limbAngle - parentAngle;
    
    // Normalize relative angle to be between -PI and PI
    if (relativeAngle > Math.PI) relativeAngle -= 2 * Math.PI;
    if (relativeAngle < -Math.PI) relativeAngle += 2 * Math.PI;
    
    let outputVelocity = velocity;
    
    // Check if beyond limits and apply appropriate correction
    if (relativeAngle > angleLimit && velocity > 0) {
        // Too far in positive direction and still trying to go positive
        const correction = limitStiffness * (angleLimit - relativeAngle);
        outputVelocity = velocity * limitDamping + correction;
        console.log("Beyond positive limit:", relativeAngle, angleLimit);
    } else if (relativeAngle < -angleLimit && velocity < 0) {
        // Too far in negative direction and still trying to go negative
        const correction = limitStiffness * (-angleLimit - relativeAngle);
        outputVelocity = velocity * limitDamping + correction;
        console.log("Beyond negative limit:", relativeAngle, -angleLimit);
    }
    
    // Apply the calculated angular velocity
    Body.setAngularVelocity(limb, outputVelocity);
} */

export function setAngularVelocity(limb: Body, velocity: number, parent: Body, maxAngle: number) {
    const upperAngle = parent.angle;
    const lowerAngle = limb.angle;
    
    // Calculate the relative angle between limbs (in radians)
    let relativeAngle = lowerAngle - upperAngle;
    
    // Normalize the angle to be between -PI and PI
    while (relativeAngle > Math.PI) relativeAngle -= Math.PI * 2;
    while (relativeAngle < -Math.PI) relativeAngle += Math.PI * 2;
    
    const nearUpperLimit = relativeAngle > maxAngle * 0.95;
    const nearLowerLimit = relativeAngle < -maxAngle * 0.95;
    
    let newVelocity = velocity;
    // Case 1: Near upper limit and trying to increase angle
    if (nearUpperLimit && velocity > 0) {
        newVelocity = 0;
    } 
    // Case 2: Near lower limit and trying to decrease angle
    else if (nearLowerLimit && velocity < 0) {
        newVelocity = 0;
    } 
      
    Body.setAngularVelocity(limb, velocity);
}