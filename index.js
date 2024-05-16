class TimeMeasure {
  pausedTime = 0;
  startTime = Date.now();
  pauseTime = 0;
  playing = true;
  get time() {
    return this.playing
      ? Date.now() - this.startTime - this.pausedTime
      : this.pauseTime - this.startTime - this.pausedTime;
  }
  pause() {
    if (this.playing) {
      this.playing = false;
      this.pauseTime = Date.now();
    }
    return this;
  }
  play() {
    if (!this.playing) {
      this.pausedTime += Date.now() - this.pauseTime;
      this.playing = true;
      this.pauseTime = 0;
    }
    return this;
  }
}

window.animateCallbackTime = { time: new TimeMeasure(), on: true };
function stopAnimateCallback() {
  window.animateCallbackTime.on = false;
  window.animateCallbackTime.time.pause();
}
function animateCallback(callback, step = 1 / 60, speed = 0) {
  if (window.animateCallbackTime.on) {
    if (speed === 0) {
      requestAnimationFrame(() => animateCallback(callback, step, speed));
    } else {
      setTimeout(() => animateCallback(callback, step, speed), speed);
    }
    if (window.animateCallbackTime.lastTime == undefined) {
      window.animateCallbackTime.lastTime = window.animateCallbackTime.time.time;
    }
    callback(
      step * (window.animateCallbackTime.time.time - window.animateCallbackTime.lastTime)
    );
    window.animateCallbackTime.lastTime = window.animateCallbackTime.time.time;
  } else {
    window.animateCallbackTime.on = true;
    window.animateCallbackTime.time.play();
  }
}

addEventListener("blur", () => {
  window.animateCallbackTime.time.pause();
});
addEventListener("focus", () => {
  window.animateCallbackTime.time.play();
});
const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
const keysDown = {};
let cbound = canvas.getBoundingClientRect();

function keyed(e) {
  keysDown[e.key] = e.type === "keydown";
}
addEventListener("keydown", keyed);
addEventListener("keyup", keyed);
const mouse = {};

// function to compensate for the css centered canvas
function getMouseRelateiveToCanvas(ex, ey) {
  return {
    x: ((ex - cbound.x) / cbound.width) * 1200 + scrollX,
    y: ((ey - cbound.y) / cbound.height) * 600 + scrollY,
  };
}
addEventListener("mousemove", (e) => {
  let p = getMouseRelateiveToCanvas(e.clientX, e.clientY);
  mouse.x = p.x;
  mouse.y = p.y;
});
// for mobile support
addEventListener("touchmove", (e) => {
  let p = getMouseRelateiveToCanvas(
    e.changedTouches[0].clientX,
    e.changedTouches[0].clientY
  );
  mouse.x = p.x;
  mouse.y = p.y;
});

function detectBallBoxCollision(
  box = { x: 0, y: 0, w: 10, h: 10 },
  ball = { x: 10, y: 10, r: 10 }
) {
  // If the circle is to the RIGHT of the square, check against the RIGHT edge.
  // If the circle is to the LEFT of the square, check against the LEFT edge.
  // If the circle is ABOVE the square, check against the TOP edge.
  // If the circle is to the BELOW the square, check against the BOTTOM edge.

  const r = ball.r;
  const cx = ball.x;
  const cy = ball.y;
  const rx = box.x;
  const ry = box.y;
  const rw = box.w;
  const rh = box.h;

  let testX = cx;
  let testY = cy;

  if (cx < rx) testX = rx; // left edge
  else if (cx > rx + rw) testX = rx + rw; // right edge

  if (cy < ry) testY = ry; // top edge
  else if (cy > ry + rh) testY = ry + rh; // bottom edge

  let distX = cx - testX;
  let distY = cy - testY;
  let distance = Math.sqrt(distX * distX + distY * distY);

  if (distance <= r) {
    return true;
  }
  return false;
}

const playerSize = 10;
const goalPostWidth = 30;
const goalPostHeight = 100;

let player1X = playerSize * 2;
let player1Y = canvas.height / 2;
let player2X = canvas.width - playerSize * 2;
let player2Y = canvas.height / 2;
let player1VX = 0;
let player1VY = 0;
let player2VX = -20;
let player2VY = 0;
let player1Score = 0;
let player2Score = 0;

function draw(dt) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw players
  ctx.beginPath();
  ctx.fillStyle = "red";
  ctx.arc(player1X, player1Y, playerSize, 0, Math.PI * 2); // Player 1
  ctx.fill();
  ctx.beginPath();
  ctx.fillStyle = "green";
  ctx.arc(player2X, player2Y, playerSize, 0, Math.PI * 2); // Player 1
  ctx.fill();
  // draw ball constraint visuallizer
  // try commenting/uncommenting this block...
  ctx.beginPath();
  ctx.moveTo(player1X, player1Y);
  ctx.lineTo(mouse.x, mouse.y);
  ctx.strokeStyle = "green";
  // ctx.lineWidth = 2
  ctx.stroke();

  // Draw Scores
  ctx.fillStyle = "blue";
  ctx.font = "40px system-ui";
  ctx.fillText(player1Score, 10, 100);
  const t = ctx.measureText(player2Score);
  ctx.fillText(player2Score, canvas.width - t.width - 10, 100);

  // Draw goal posts
  ctx.fillStyle = "green";
  ctx.fillRect(0, canvas.height / 2 - goalPostHeight / 2, goalPostWidth, goalPostHeight); // Player 1's goal post
  ctx.fillStyle = "red";
  ctx.fillRect(
    canvas.width - goalPostWidth,
    (canvas.height - goalPostHeight) / 2,
    goalPostWidth,
    goalPostHeight
  ); // Player 2's goal post

  player1X += player1VX * dt;
  player1Y += player1VY * dt;
  player2X += player2VX * dt;
  player2Y += player2VY * dt;
  let d = 0.99;
  player1VX *= d;
  player1VY *= d;
  player2VX *= d;
  player2VY *= d;

  // Ball / Mouse constraint
  // Play around with the drag and spring variables
  if (
    mouse.x &&
    !(
      keysDown["w"] |
      keysDown["a"] |
      keysDown["s"] |
      keysDown["d"] |
      keysDown["ArrowUp"] |
      keysDown["ArrowDown"] |
      keysDown["ArrowRight"] |
      keysDown["ArrowLeft"]
    )
  ) {
    // try setting drag to 1 and spring to 0...
    let drag = 0.0008;
    let spring = 0.99;
    // let drag = 1
    // let spring = 0
    player1VX = (mouse.x - player1X) * drag + player1VX * spring;
    player1VY = (mouse.y - player1Y) * drag + player1VY * spring;
  }

  function dist2(x0, y0, x1, y1) {
    return ((x1 - x0) ** 2 + (y1 - y0) ** 2) ** 0.5;
  }

  // Ball collision with players
  const dist = dist2(player1X, player1Y, player2X, player2Y);
  if (dist <= playerSize * 2) {
    const angle = Math.atan2(player2Y - player1Y, player2X - player1X);
    // console.log((angle  * 180) / Math.PI);
    player1VX = -Math.cos(angle) * Math.max(playerSize * 2 - dist, player1VX);
    player1VY = -Math.sin(angle) * Math.max(playerSize * 2 - dist, player1VY);
    player2VX = -Math.cos(angle + Math.PI) * Math.max(playerSize * 2 - dist, player2VX);
    player2VY = -Math.sin(angle + Math.PI) * Math.max(playerSize * 2 - dist, player2VY);
  }

  // Player collision with goal posts
  if (
    detectBallBoxCollision(
      {
        x: canvas.width - goalPostWidth,
        y: (canvas.height - goalPostHeight) / 2,
        w: goalPostWidth,
        h: goalPostHeight,
      },
      { x: player1X, y: player1Y, r: playerSize }
    )
  ) {
    let p = { player1Score, player2Score };
    reset();
    player1Score = p.player1Score + 1;
    player2Score = p.player2Score;
  }
  if (
    detectBallBoxCollision(
      {
        x: 0,
        y: (canvas.height - goalPostHeight) / 2,
        w: goalPostWidth,
        h: goalPostHeight,
      },
      { x: player2X, y: player2Y, r: playerSize }
    )
  ) {
    let p = { player1Score, player2Score };
    reset();
    player1Score = p.player1Score;
    player2Score = p.player2Score + 1;
  }

  if (keysDown["ArrowUp"] && player1Y > 0) {
    player1VY -= 0.1;
  } else if (keysDown["ArrowDown"] && player1Y < canvas.height - playerSize) {
    player1VY += 0.1;
  }
  if (keysDown["ArrowRight"] && player1Y > 0) {
    player1VX += 0.1;
  } else if (keysDown["ArrowLeft"] && player1Y < canvas.height - playerSize) {
    player1VX -= 0.1;
  }

  if (keysDown["w"] && player2Y > 0) {
    player2VY += 0.1;
  } else if (keysDown["s"] && player2Y < canvas.height - playerSize) {
    player2VY += 0.1;
  }
}

function reset() {
  player1X = playerSize * 2;
  player1Y = canvas.height / 2;
  player2X = canvas.width - playerSize * 2;
  player2Y = canvas.height / 2;
  player1VX = 0;
  player1VY = 0;
  player2VX = -20;
  player2VY = 0;
  player1Score = 0;
  player2Score = 0;
}

function handleResize() {
  cbound = canvas.getBoundingClientRect();
}
addEventListener("resize", () => {
  handleResize();
});

animateCallback(draw, 1 / 16);
