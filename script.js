// Canvas and Context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game variables
const GRID_SIZE = 20;
const canvasWidth = canvas.width;
const canvasHeight = canvas.height;
const gridCols = canvasWidth / GRID_SIZE;
const gridRows = canvasHeight / GRID_SIZE;

let snake = [{ x: 10, y: 10 }];
let food = { x: 15, y: 15 };
let direction = { x: 1, y: 0 };
let nextDirection = { x: 1, y: 0 };
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let level = 1;
let gameRunning = false;
let gamePaused = false;
let gameSpeed = 100;
let gameLoopId = null;

// UI elements
const scoreDisplay = document.getElementById('score');
const highScoreDisplay = document.getElementById('highScore');
const levelDisplay = document.getElementById('level');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');
const gameOverModal = document.getElementById('gameOverModal');
const finalScoreDisplay = document.getElementById('finalScore');
const newRecordDisplay = document.getElementById('newRecord');

// Initialize high score display
highScoreDisplay.textContent = highScore;

// Event listeners
startBtn.addEventListener('click', startGame);
pauseBtn.addEventListener('click', togglePause);
resetBtn.addEventListener('click', resetGame);
document.addEventListener('keydown', handleKeyPress);

// Handle keyboard input
function handleKeyPress(e) {
    if (!gameRunning && !gamePaused) return;

    const key = e.key.toLowerCase();
    
    let shouldPrevent = false;
    
    switch (key) {
        case 'arrowup':
        case 'w':
            if (direction.y === 0) {
                nextDirection = { x: 0, y: -1 };
                shouldPrevent = true;
            }
            break;
        case 'arrowdown':
        case 's':
            if (direction.y === 0) {
                nextDirection = { x: 0, y: 1 };
                shouldPrevent = true;
            }
            break;
        case 'arrowleft':
        case 'a':
            if (direction.x === 0) {
                nextDirection = { x: -1, y: 0 };
                shouldPrevent = true;
            }
            break;
        case 'arrowright':
        case 'd':
            if (direction.x === 0) {
                nextDirection = { x: 1, y: 0 };
                shouldPrevent = true;
            }
            break;
        case ' ':
            if (gameRunning) togglePause();
            shouldPrevent = true;
            break;
    }
    
    if (shouldPrevent) {
        e.preventDefault();
    }
}

// Start game
function startGame() {
    if (gameRunning) return;
    gameRunning = true;
    gamePaused = false;
    startBtn.disabled = true;
    pauseBtn.disabled = false;
    resetBtn.disabled = true;
    gameLoop();
}

// Toggle pause
function togglePause() {
    gamePaused = !gamePaused;
    pauseBtn.textContent = gamePaused ? '继续' : '暂停';
    if (!gamePaused) {
        gameLoop();
    }
}

// Reset game
function resetGame() {
    if (gameLoopId) clearTimeout(gameLoopId);
    snake = [{ x: 10, y: 10 }];
    direction = { x: 1, y: 0 };
    nextDirection = { x: 1, y: 0 };
    score = 0;
    level = 1;
    gameSpeed = 100;
    gameRunning = false;
    gamePaused = false;
    
    scoreDisplay.textContent = score;
    levelDisplay.textContent = level;
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    pauseBtn.textContent = '暂停';
    resetBtn.disabled = false;
    gameOverModal.classList.add('hidden');
    
    generateFood();
    draw();
}

// Main game loop
function gameLoop() {
    if (!gameRunning || gamePaused) return;

    update();
    draw();
    
    gameLoopId = setTimeout(gameLoop, gameSpeed);
}

// Update game state
function update() {
    // Update direction
    direction = nextDirection;

    // Calculate new head position
    const head = { ...snake[0] };
    head.x += direction.x;
    head.y += direction.y;

    // Check collision with walls
    if (head.x < 0 || head.x >= gridCols || head.y < 0 || head.y >= gridRows) {
        endGame();
        return;
    }

    // Check collision with self
    if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
        endGame();
        return;
    }

    // Add new head
    snake.unshift(head);

    // Check if food is eaten
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        scoreDisplay.textContent = score;

        // Level up every 50 points
        if (score % 50 === 0) {
            level++;
            levelDisplay.textContent = level;
            gameSpeed = Math.max(50, 100 - level * 5);
        }

        generateFood();
    } else {
        // Remove tail if food not eaten
        snake.pop();
    }
}

// Generate random food position
function generateFood() {
    let newFood;
    let isOnSnake;

    do {
        isOnSnake = false;
        newFood = {
            x: Math.floor(Math.random() * gridCols),
            y: Math.floor(Math.random() * gridRows)
        };

        // Check if food is on snake
        if (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y)) {
            isOnSnake = true;
        }
    } while (isOnSnake);

    food = newFood;
}

// Draw game
function draw() {
    // Clear canvas - black background
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Draw grid
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 1;
    for (let i = 0; i <= gridCols; i++) {
        ctx.beginPath();
        ctx.moveTo(i * GRID_SIZE, 0);
        ctx.lineTo(i * GRID_SIZE, canvasHeight);
        ctx.stroke();
    }
    for (let i = 0; i <= gridRows; i++) {
        ctx.beginPath();
        ctx.moveTo(0, i * GRID_SIZE);
        ctx.lineTo(canvasWidth, i * GRID_SIZE);
        ctx.stroke();
    }

    // Draw snake
    snake.forEach((segment, index) => {
        if (index === 0) {
            // Head - bright green with glow
            ctx.fillStyle = '#00ff00';
            ctx.shadowColor = '#00ff00';
            ctx.shadowBlur = 8;
        } else {
            // Body - darker green
            ctx.fillStyle = '#00cc00';
            ctx.shadowColor = 'transparent';
        }

        ctx.fillRect(
            segment.x * GRID_SIZE + 2,
            segment.y * GRID_SIZE + 2,
            GRID_SIZE - 4,
            GRID_SIZE - 4
        );
    });

    ctx.shadowColor = 'transparent';

    // Draw food - red circle
    ctx.fillStyle = '#ff0000';
    ctx.shadowColor = '#ff0000';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(
        food.x * GRID_SIZE + GRID_SIZE / 2,
        food.y * GRID_SIZE + GRID_SIZE / 2,
        GRID_SIZE / 2 - 3,
        0,
        Math.PI * 2
    );
    ctx.fill();
    ctx.shadowColor = 'transparent';
}

// End game
function endGame() {
    if (gameLoopId) clearTimeout(gameLoopId);
    gameRunning = false;
    gamePaused = false;
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    pauseBtn.textContent = '暂停';
    resetBtn.disabled = false;

    finalScoreDisplay.textContent = score;

    // Check if new high score
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('snakeHighScore', highScore);
        highScoreDisplay.textContent = highScore;
        newRecordDisplay.classList.remove('hidden');
    } else {
        newRecordDisplay.classList.add('hidden');
    }

    gameOverModal.classList.remove('hidden');
}

// Initial draw
generateFood();
draw();
