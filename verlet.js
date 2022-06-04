let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

function writecircle(circle) {
    ctx.ellipse(circle.x, circle.y, circle.radius, circle.radius, 0, 0, 2 * Math.PI);
}

const gravity = 0000;

const worldpos = [500, 500];
const worldradius = 400;
const startingvely = 5;

var mousex;
var mousey;

class Circle {
    constructor(x, y, radius) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.oldx = x;
        this.oldy = y + startingvely;
        this.accx = 0;
        this.accy = 0;
    }

    updatepos(dt) {
        const velx = this.x - this.oldx;
        const vely = this.y - this.oldy;

        this.oldx = this.x;
        this.oldy = this.y;

        this.x = this.x + velx + this.accx * dt * dt;
        this.y = this.y + vely + this.accy * dt * dt;

        this.accx = 0;
        this.accy = 0;
    }

    accelerate(accx, accy) {
        this.accx += accx;
        this.accy += accy;
    }
}

let circles = [];//[new Circle(500, 500, 30)];

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    circles.forEach(function(circle, index, array) {
        ctx.beginPath();
        writecircle(circle);
        ctx.fill();
    })
}

function applygravity(circle, index, array) {
    circle.accelerate(0, gravity);
}
function updatepositions(circle, index, array) {
    circle.updatepos((now - start) / 1000 / substeps);
}
function applyconstraint(circle, index, array) {
    const diffx = circle.x - worldpos[0];
    const diffy = circle.y - worldpos[1];

    const dist2 = diffx ** 2 + diffy ** 2;

    const radiusdiff = worldradius - circle.radius;
    if (dist2 > radiusdiff ** 2) {
        const dist = dist2 ** 0.5;
        const unitx = diffx / dist;
        const unity = diffy / dist;
        circle.x = worldpos[0] + unitx * (worldradius - circle.radius);
        circle.y = worldpos[1] + unity * (worldradius - circle.radius);
    }
}
function solvecollisions(x, y) {
    for (let i = 0; i < circles.length; i++) {
        const circle1 = circles[i];
        for (let j = i + 1; j < circles.length; j++) {
            const circle2 = circles[j];
            const axisx = circle1.x - circle2.x;
            const axisy = circle1.y - circle2.y;
            const dist2 = axisx ** 2 + axisy ** 2;

            const mindist = circle1.radius + circle2.radius;

            if (dist2 > 0) {
                if (dist2 < mindist ** 2) {
                    const dist = dist2 ** 0.5;
                    const unitx = axisx / dist;
                    const unity = axisy / dist;
    
                    const delta = mindist - dist;
    
                    circle1.x += (circle1.radius / 100) * delta * unitx;
                    circle1.y += (circle1.radius / 100) * delta * unity;
    
                    circle2.x -= (circle2.radius / 100) * delta * unitx;
                    circle2.y -= (circle2.radius / 100) * delta * unity;
                }
            }
        }
    }

    if (x != undefined) {
        const circle1 = new Circle(x, y, cursorradius);
        for (let i = 0; i < circles.length; i++) {
            const circle2 = circles[i];
            
            const axisx = circle1.x - circle2.x;
            const axisy = circle1.y - circle2.y;
            const dist2 = axisx ** 2 + axisy ** 2;

            const mindist = circle1.radius + circle2.radius;

            if (dist2 < mindist ** 2) {
                const dist = dist2 ** 0.5;
                const unitx = axisx / dist;
                const unity = axisy / dist;

                const delta = mindist - dist;

                circle2.x -= (circle2.radius / 100) * delta * unitx;
                circle2.y -= (circle2.radius / 100) * delta * unity;
            }
        }
    }
}

var start = Date.now();
var now;

var count = 0;
const interval = 10;
const max = 1500;
const substeps = 2;
const cursorradius = 50;

function substep() {
    for (let i = 0; i < substeps; i++) {
        circles.forEach(applygravity);
        circles.forEach(updatepositions);
        circles.forEach(applyconstraint);
        solvecollisions();
    }
}

function substepmouse(x, y) {
    for (let i = 0; i < substeps; i++) {
        circles.forEach(applygravity);
        circles.forEach(updatepositions);
        circles.forEach(applyconstraint);
        solvecollisions(x, y);
    }
}

function update() {
    if (count < interval * max && count % interval == 0) {
        //circles.push(new Circle(200, 500, 10));
        circles.push(new Circle(800, 500, 10));
    }
    count ++;

    now = Date.now();
    //console.log(Math.round(1000/(now - start)));

    if (mousex != undefined) {
        substepmouse(mousex, mousey);
    } else {
        substep();
    }

    draw();

    if (mousex != undefined) {
        ctx.beginPath();
        writecircle(new Circle(mousex, mousey, cursorradius));
        ctx.fill();
    }

    start = now;
}

canvas.addEventListener("mousedown touchstart", function(e) {
    mousex = e.clientX - canvas.offsetLeft;
    mousey = e.clientY - canvas.offsetTop;
})

canvas.addEventListener("mousemove touchend", function(e) {
    if (mousex != undefined) {
        mousex = e.clientX - canvas.offsetLeft;
        mousey = e.clientY - canvas.offsetTop;
    }
})

canvas.addEventListener("mouseup", function(e) {
    mousex = undefined;
    mousey = undefined;
})

setInterval(update, 10);
