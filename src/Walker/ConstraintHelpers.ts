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

export function createLimb(x: number, y: number, width: number, height: number, collisionCat: number): Body {
    return Bodies.rectangle(x, y, width, height, {
        collisionFilter: {
            group: -1,
            category: collisionCat, // Define a collision category for the limb 
            mask: 0xFFFF // Collides with everything by default
        },
        frictionAir: 0.05,
    });
}