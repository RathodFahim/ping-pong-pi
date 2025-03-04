// Get canvas and context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Rod and ball parameters
const rodWidth = 120, rodHeight = 10, rodSpeed = 20;
const ballRadius = 10;

// Define rods (both move together)
let topRod = {
  x: (canvas.width - rodWidth) / 2,
  y: 20,
  width: rodWidth,
  height: rodHeight
};
let bottomRod = {
  x: (canvas.width - rodWidth) / 2,
  y: canvas.height - 20 - rodHeight,
  width: rodWidth,
  height: rodHeight
};

// Ball object (its velocity is set when a round starts)
let ball = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  radius: ballRadius,
  dx: 0,
  dy: 0
};

// Game state variables
let score = 0;
let isPlaying = false;
// serveFrom: indicates which rod will serve (losing rod gets the ball next round)
let serveFrom = "bottom"; // default start: ball is served from bottom rod

// Check local storage for high score record
let highScoreRecord = localStorage.getItem('highScoreRecord');
if (highScoreRecord) {
  highScoreRecord = JSON.parse(highScoreRecord);
  alert("Highest Score: " + highScoreRecord.score + " by " + highScoreRecord.name);
} else {
  alert("This is your first time");
}

// Listen for key presses
document.addEventListener('keydown', function(event) {
  if (event.key === "Enter" && !isPlaying) {
    // Start round: give the ball an initial velocity based on serve direction
    isPlaying = true;
    if (serveFrom === "bottom") {
      ball.dx = 3;
      ball.dy = -3;  // ball moves upward from bottom serve
    } else {
      ball.dx = 3;
      ball.dy = 3;   // ball moves downward from top serve
    }
  }
  if (event.key === "ArrowLeft") {
    // Move both rods left, ensuring they don’t go off-canvas
    topRod.x = Math.max(topRod.x - rodSpeed, 0);
    bottomRod.x = Math.max(bottomRod.x - rodSpeed, 0);
  }
  if (event.key === "ArrowRight") {
    // Move both rods right
    topRod.x = Math.min(topRod.x + rodSpeed, canvas.width - rodWidth);
    bottomRod.x = Math.min(bottomRod.x + rodSpeed, canvas.width - rodWidth);
  }
});

// Drawing functions
function drawRod(rod) {
  ctx.fillStyle = "#333";
  ctx.fillRect(rod.x, rod.y, rod.width, rod.height);
}
function drawBall() {
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fillStyle = "#e74c3c";
  ctx.fill();
  ctx.closePath();
}
function drawScore() {
  ctx.font = "20px Arial";
  ctx.fillStyle = "#333";
  ctx.fillText("Score: " + score, 10, 30);
}

// Reset positions after each round. The losing rod gets the ball.
function resetPositions(losingRod) {
  // Center both rods horizontally
  topRod.x = (canvas.width - rodWidth) / 2;
  bottomRod.x = (canvas.width - rodWidth) / 2;
  // Place the ball based on which rod lost:
  if (losingRod === "top") {
    ball.x = topRod.x + rodWidth / 2;
    ball.y = topRod.y + rodHeight + ball.radius;
    serveFrom = "top";
  } else {
    ball.x = bottomRod.x + rodWidth / 2;
    ball.y = bottomRod.y - ball.radius;
    serveFrom = "bottom";
  }
  // Reset ball velocity and score
  ball.dx = 0;
  ball.dy = 0;
  score = 0;
}

// Update game state
function update() {
  if (isPlaying) {
    // Update ball position
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Bounce off left/right walls
    if (ball.x - ball.radius < 0 || ball.x + ball.radius > canvas.width) {
      ball.dx = -ball.dx;
    }

    // Check collision with bottom rod (only when ball is moving downward)
    if (ball.dy > 0 && ball.y + ball.radius >= bottomRod.y && ball.y + ball.radius <= bottomRod.y + bottomRod.height) {
      if (ball.x >= bottomRod.x && ball.x <= bottomRod.x + bottomRod.width) {
        ball.dy = -ball.dy;
        score++;
      }
    }
    // Check collision with top rod (only when ball is moving upward)
    if (ball.dy < 0 && ball.y - ball.radius <= topRod.y + topRod.height && ball.y - ball.radius >= topRod.y) {
      if (ball.x >= topRod.x && ball.x <= topRod.x + topRod.width) {
        ball.dy = -ball.dy;
        score++;
      }
    }

    // Check if the ball goes off the top (missed top rod)
    if (ball.y - ball.radius < 0) {
      isPlaying = false;
      alert("Round Over! Bottom rod wins with score: " + score);
      updateHighScore();
      resetPositions("top");  // top rod lost so next serve comes from top
    }
    // Check if the ball goes off the bottom (missed bottom rod)
    if (ball.y + ball.radius > canvas.height) {
      isPlaying = false;
      alert("Round Over! Top rod wins with score: " + score);
      updateHighScore();
      resetPositions("bottom");  // bottom rod lost so next serve comes from bottom
    }
  }
}

// Update the high score record if needed
function updateHighScore() {
  if (!highScoreRecord || score > highScoreRecord.score) {
    let playerName = prompt("New High Score! Enter your name:");
    highScoreRecord = { name: playerName || "Anonymous", score: score };
    localStorage.setItem('highScoreRecord', JSON.stringify(highScoreRecord));
  }
}

// Draw everything on the canvas
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawRod(topRod);
  drawRod(bottomRod);
  drawBall();
  drawScore();
}

// Main game loop
function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

gameLoop();
