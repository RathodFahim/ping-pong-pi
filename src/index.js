// === Canvas & Context ===
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// === Start Button ===
const startButton = document.getElementById("startGame");

// === Game Constants ===
const rodWidth = 120,
      rodHeight = 10,
      rodSpeed = 20;
const ballRadius = 10;

// === Rod Objects (Top & Bottom) ===
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

// === Ball Object ===
let ball = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  radius: ballRadius,
  dx: 0, // horizontal velocity
  dy: 0  // vertical velocity
};

// === Game State ===
let score = 0;
let isPlaying = false;
let serveFrom = "bottom"; // which rod serves next round

// === High Score (localStorage) ===
let highScoreRecord = localStorage.getItem("highScoreRecord");
if (highScoreRecord) {
  highScoreRecord = JSON.parse(highScoreRecord);
  alert("Highest Score: " + highScoreRecord.score + " by " + highScoreRecord.name);
} else {
  alert("This is your first time");
}

// === Key Listener for Rod Movement ===
document.addEventListener("keydown", function (event) {
  if (event.key === "ArrowLeft") {
    // Move rods left
    topRod.x = Math.max(topRod.x - rodSpeed, 0);
    bottomRod.x = Math.max(bottomRod.x - rodSpeed, 0);
  } else if (event.key === "ArrowRight") {
    // Move rods right
    topRod.x = Math.min(topRod.x + rodSpeed, canvas.width - rodWidth);
    bottomRod.x = Math.min(bottomRod.x + rodSpeed, canvas.width - rodWidth);
  }
});

// === Start Button Logic ===
startButton.addEventListener("click", function () {
  if (!isPlaying) {
    // Hide the button and start the round
    startButton.style.display = "none";
    startRound();
  }
});

// === Function to Start a Round ===
function startRound() {
  isPlaying = true;
  // Set ball velocity based on which rod is serving
  if (serveFrom === "bottom") {
    ball.dx = 3;
    ball.dy = -3; // move upward
  } else {
    ball.dx = 3;
    ball.dy = 3;  // move downward
  }
}

// === Function to Reset Positions After a Round ===
function resetPositions(losingRod) {
  // Recenter rods
  topRod.x = (canvas.width - rodWidth) / 2;
  bottomRod.x = (canvas.width - rodWidth) / 2;

  // Place ball at losing rod for next serve
  if (losingRod === "top") {
    ball.x = topRod.x + rodWidth / 2;
    ball.y = topRod.y + rodHeight + ball.radius;
    serveFrom = "top";
  } else {
    ball.x = bottomRod.x + rodWidth / 2;
    ball.y = bottomRod.y - ball.radius;
    serveFrom = "bottom";
  }

  // Reset ball velocity & score
  ball.dx = 0;
  ball.dy = 0;
  score = 0;

  // Stop the game & show the Start button
  isPlaying = false;
  startButton.style.display = "inline-block";
}

// === Update High Score If Needed ===
function updateHighScore() {
  if (!highScoreRecord || score > highScoreRecord.score) {
    let playerName = prompt("New High Score! Enter your name:");
    highScoreRecord = { name: playerName || "Anonymous", score: score };
    localStorage.setItem("highScoreRecord", JSON.stringify(highScoreRecord));
  }
}

// === Main Update Function (Game Logic) ===
function update() {
  if (isPlaying) {
    // Move the ball
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Bounce off left/right walls
    if (ball.x - ball.radius < 0 || ball.x + ball.radius > canvas.width) {
      ball.dx = -ball.dx;
    }

    // Collision with bottom rod
    if (
      ball.dy > 0 &&
      ball.y + ball.radius >= bottomRod.y &&
      ball.y + ball.radius <= bottomRod.y + bottomRod.height
    ) {
      if (ball.x >= bottomRod.x && ball.x <= bottomRod.x + bottomRod.width) {
        ball.dy = -ball.dy;
        score++;
      }
    }

    // Collision with top rod
    if (
      ball.dy < 0 &&
      ball.y - ball.radius <= topRod.y + topRod.height &&
      ball.y - ball.radius >= topRod.y
    ) {
      if (ball.x >= topRod.x && ball.x <= topRod.x + topRod.width) {
        ball.dy = -ball.dy;
        score++;
      }
    }

    // Ball goes off the top (top rod loses)
    if (ball.y - ball.radius < 0) {
      isPlaying = false;
      alert(`Round Over! Bottom rod wins with score: ${score}`);
      updateHighScore();
      resetPositions("top");
    }

    // Ball goes off the bottom (bottom rod loses)
    if (ball.y + ball.radius > canvas.height) {
      isPlaying = false;
      alert(`Round Over! Top rod wins with score: ${score}`);
      updateHighScore();
      resetPositions("bottom");
    }
  }
}

// === Draw Function (Render Game Objects) ===
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw rods
  ctx.fillStyle = "#333";
  ctx.fillRect(topRod.x, topRod.y, topRod.width, topRod.height);
  ctx.fillRect(bottomRod.x, bottomRod.y, bottomRod.width, bottomRod.height);

  // Draw ball
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fillStyle = "#e74c3c";
  ctx.fill();
  ctx.closePath();

  // Draw score
  ctx.font = "20px Arial";
  ctx.fillStyle = "#333";
  ctx.fillText("Score: " + score, 10, 30);
}

// === Game Loop ===
function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

// Start the loop (idle until "Start Game" is clicked)
gameLoop();
