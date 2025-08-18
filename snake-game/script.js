/**
 * Neural Snake Game - JavaScript Logic
 * A complete snake game implementation with neural network theme
 * Author: Tushar Thanvi
 */

class NeuralSnakeGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Game configuration
        this.gridSize = 20;
        this.tileCount = this.canvas.width / this.gridSize;
        
        // Game state
        this.snake = [{ x: 10, y: 10 }];
        this.food = { x: 15, y: 15 };
        this.dx = 0;
        this.dy = 0;
        this.score = 0;
        this.level = 1;
        this.gameRunning = false;
        this.gamePaused = false;
        this.gameLoop = null;
        
        // Speed configuration
        this.baseSpeed = 200; // Base speed in milliseconds
        this.currentSpeed = this.baseSpeed;
        
        // High score persistence
        this.highScore = this.loadHighScore();
        
        // Colors for neural theme
        this.colors = {
            background: '#0D1117',
            grid: '#21262D',
            snake: '#00F5D4',
            snakeGlow: 'rgba(0, 245, 212, 0.8)',
            food: '#FF6B6B',
            foodGlow: 'rgba(255, 107, 107, 0.8)',
            text: '#FFFFFF'
        };
        
        this.initializeGame();
        this.bindEvents();
        this.updateDisplay();
    }
    
    initializeGame() {
        this.drawGame();
        this.updateDisplay();
    }
    
    bindEvents() {
        // Keyboard controls
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        
        // Button controls
        document.getElementById('pauseBtn').addEventListener('click', () => this.togglePause());
        document.getElementById('newGameBtn').addEventListener('click', () => this.newGame());
        document.getElementById('restartBtn').addEventListener('click', () => this.newGame());
        
        // Prevent arrow key scrolling
        window.addEventListener('keydown', (e) => {
            if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].indexOf(e.code) > -1) {
                e.preventDefault();
            }
        }, false);
    }
    
    handleKeyPress(event) {
        if (!this.gameRunning && event.code !== 'Space') return;
        
        const { keyCode, code } = event;
        
        // Prevent reverse direction
        const goingUp = this.dy === -1;
        const goingDown = this.dy === 1;
        const goingRight = this.dx === 1;
        const goingLeft = this.dx === -1;
        
        // Arrow keys and WASD controls
        if ((keyCode === 37 || code === 'KeyA') && !goingRight) { // Left
            this.dx = -1;
            this.dy = 0;
            this.startGame();
        }
        if ((keyCode === 38 || code === 'KeyW') && !goingDown) { // Up
            this.dx = 0;
            this.dy = -1;
            this.startGame();
        }
        if ((keyCode === 39 || code === 'KeyD') && !goingLeft) { // Right
            this.dx = 1;
            this.dy = 0;
            this.startGame();
        }
        if ((keyCode === 40 || code === 'KeyS') && !goingUp) { // Down
            this.dx = 0;
            this.dy = 1;
            this.startGame();
        }
        
        // Pause/Resume
        if (code === 'Space') {
            event.preventDefault();
            this.togglePause();
        }
        
        // Restart
        if (code === 'KeyR') {
            this.newGame();
        }
    }
    
    startGame() {
        if (!this.gameRunning && !this.gamePaused) {
            this.gameRunning = true;
            this.gameLoop = setInterval(() => this.update(), this.currentSpeed);
        }
    }
    
    togglePause() {
        if (!this.gameRunning) return;
        
        const pauseBtn = document.getElementById('pauseBtn');
        
        if (this.gamePaused) {
            this.gamePaused = false;
            this.gameLoop = setInterval(() => this.update(), this.currentSpeed);
            pauseBtn.textContent = '⏸️ Pause';
        } else {
            this.gamePaused = true;
            clearInterval(this.gameLoop);
            pauseBtn.textContent = '▶️ Resume';
        }
    }
    
    newGame() {
        // Reset game state
        clearInterval(this.gameLoop);
        this.snake = [{ x: 10, y: 10 }];
        this.dx = 0;
        this.dy = 0;
        this.score = 0;
        this.level = 1;
        this.gameRunning = false;
        this.gamePaused = false;
        this.currentSpeed = this.baseSpeed;
        
        // Reset UI
        document.getElementById('pauseBtn').textContent = '⏸️ Pause';
        this.hideGameOver();
        
        // Generate new food
        this.generateFood();
        
        // Update display and redraw
        this.updateDisplay();
        this.drawGame();
    }
    
    update() {
        if (this.gamePaused) return;
        
        this.moveSnake();
        
        // Check if snake ate food
        if (this.snake[0].x === this.food.x && this.snake[0].y === this.food.y) {
            this.eatFood();
        }
        
        // Check collisions
        if (this.checkCollisions()) {
            this.gameOver();
            return;
        }
        
        this.drawGame();
    }
    
    moveSnake() {
        const head = { x: this.snake[0].x + this.dx, y: this.snake[0].y + this.dy };
        this.snake.unshift(head);
        
        // Remove tail if no food was eaten
        if (this.snake.length > this.score + 1) {
            this.snake.pop();
        }
    }
    
    eatFood() {
        this.score += 10;
        this.updateLevel();
        this.generateFood();
        this.updateDisplay();
        
        // Add visual feedback
        this.canvas.classList.add('glow');
        setTimeout(() => this.canvas.classList.remove('glow'), 300);
    }
    
    updateLevel() {
        const newLevel = Math.floor(this.score / 50) + 1;
        if (newLevel > this.level) {
            this.level = newLevel;
            // Increase speed (decrease interval)
            this.currentSpeed = Math.max(50, this.baseSpeed - (this.level - 1) * 15);
            
            // Update game loop with new speed
            clearInterval(this.gameLoop);
            this.gameLoop = setInterval(() => this.update(), this.currentSpeed);
        }
    }
    
    generateFood() {
        let newFood;
        do {
            newFood = {
                x: Math.floor(Math.random() * this.tileCount),
                y: Math.floor(Math.random() * this.tileCount)
            };
        } while (this.snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
        
        this.food = newFood;
    }
    
    checkCollisions() {
        const head = this.snake[0];
        
        // Wall collision
        if (head.x < 0 || head.x >= this.tileCount || head.y < 0 || head.y >= this.tileCount) {
            return true;
        }
        
        // Self collision
        for (let i = 1; i < this.snake.length; i++) {
            if (head.x === this.snake[i].x && head.y === this.snake[i].y) {
                return true;
            }
        }
        
        return false;
    }
    
    gameOver() {
        clearInterval(this.gameLoop);
        this.gameRunning = false;
        this.gamePaused = false;
        
        // Update high score
        if (this.score > this.highScore) {
            this.highScore = this.score;
            this.saveHighScore();
        }
        
        this.updateDisplay();
        this.showGameOver();
    }
    
    showGameOver() {
        const overlay = document.getElementById('gameOverOverlay');
        const finalScore = document.getElementById('finalScore');
        const gameOverMessage = document.getElementById('gameOverMessage');
        
        finalScore.textContent = `Final Score: ${this.score}`;
        
        // Different messages based on performance
        if (this.score === this.highScore && this.score > 0) {
            gameOverMessage.textContent = '🎉 New high score! Neural network optimized!';
        } else if (this.score >= 100) {
            gameOverMessage.textContent = '🚀 Excellent neural performance!';
        } else if (this.score >= 50) {
            gameOverMessage.textContent = '⚡ Good neural connectivity!';
        } else {
            gameOverMessage.textContent = '🧠 Neural network needs more training!';
        }
        
        overlay.classList.remove('hidden');
    }
    
    hideGameOver() {
        document.getElementById('gameOverOverlay').classList.add('hidden');
    }
    
    drawGame() {
        // Clear canvas
        this.ctx.fillStyle = this.colors.background;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw grid
        this.drawGrid();
        
        // Draw food with glow effect
        this.drawFood();
        
        // Draw snake with glow effect
        this.drawSnake();
    }
    
    drawGrid() {
        this.ctx.strokeStyle = this.colors.grid;
        this.ctx.lineWidth = 1;
        
        for (let i = 0; i <= this.tileCount; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(i * this.gridSize, 0);
            this.ctx.lineTo(i * this.gridSize, this.canvas.height);
            this.ctx.stroke();
            
            this.ctx.beginPath();
            this.ctx.moveTo(0, i * this.gridSize);
            this.ctx.lineTo(this.canvas.width, i * this.gridSize);
            this.ctx.stroke();
        }
    }
    
    drawSnake() {
        this.snake.forEach((segment, index) => {
            const x = segment.x * this.gridSize;
            const y = segment.y * this.gridSize;
            
            if (index === 0) {
                // Draw head with special styling
                this.ctx.fillStyle = this.colors.snake;
                this.ctx.shadowColor = this.colors.snakeGlow;
                this.ctx.shadowBlur = 15;
                this.ctx.fillRect(x + 2, y + 2, this.gridSize - 4, this.gridSize - 4);
                
                // Add eyes to the head
                this.ctx.shadowBlur = 0;
                this.ctx.fillStyle = this.colors.background;
                this.ctx.fillRect(x + 6, y + 6, 3, 3);
                this.ctx.fillRect(x + 11, y + 6, 3, 3);
            } else {
                // Draw body segments
                this.ctx.fillStyle = this.colors.snake;
                this.ctx.shadowColor = this.colors.snakeGlow;
                this.ctx.shadowBlur = 10;
                this.ctx.fillRect(x + 1, y + 1, this.gridSize - 2, this.gridSize - 2);
            }
        });
        
        this.ctx.shadowBlur = 0; // Reset shadow
    }
    
    drawFood() {
        const x = this.food.x * this.gridSize;
        const y = this.food.y * this.gridSize;
        
        // Draw food with glow effect
        this.ctx.fillStyle = this.colors.food;
        this.ctx.shadowColor = this.colors.foodGlow;
        this.ctx.shadowBlur = 15;
        this.ctx.fillRect(x + 3, y + 3, this.gridSize - 6, this.gridSize - 6);
        
        // Add a small highlight
        this.ctx.shadowBlur = 0;
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fillRect(x + 5, y + 5, 2, 2);
    }
    
    updateDisplay() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('highScore').textContent = this.highScore;
        document.getElementById('level').textContent = this.level;
    }
    
    saveHighScore() {
        try {
            localStorage.setItem('neuralSnakeHighScore', this.highScore.toString());
        } catch (e) {
            console.warn('Could not save high score to localStorage');
        }
    }
    
    loadHighScore() {
        try {
            const saved = localStorage.getItem('neuralSnakeHighScore');
            return saved ? parseInt(saved, 10) : 0;
        } catch (e) {
            console.warn('Could not load high score from localStorage');
            return 0;
        }
    }
}

// Game Messages and Tips
const gameTips = [
    "💡 Tip: The snake moves faster as you level up!",
    "🎯 Tip: Plan your path to avoid trapping yourself!",
    "⚡ Tip: Use WASD or arrow keys to control the snake!",
    "🧠 Tip: Think ahead - neural networks require strategy!",
    "🚀 Tip: Challenge yourself to beat your high score!"
];

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // Create game instance
    window.neuralSnake = new NeuralSnakeGame();
    
    // Add some interactive elements
    const canvas = document.getElementById('gameCanvas');
    
    // Add click-to-focus functionality
    canvas.addEventListener('click', () => {
        canvas.focus();
        if (!window.neuralSnake.gameRunning) {
            // Show a tip
            const tip = gameTips[Math.floor(Math.random() * gameTips.length)];
            console.log(tip);
        }
    });
    
    // Add loading animation effect
    setTimeout(() => {
        document.querySelector('.game-header').classList.add('glow');
        setTimeout(() => {
            document.querySelector('.game-header').classList.remove('glow');
        }, 2000);
    }, 500);
    
    // Responsive canvas sizing
    function resizeCanvas() {
        const container = document.querySelector('.game-area');
        const maxWidth = Math.min(400, container.clientWidth - 40);
        const size = Math.floor(maxWidth / 20) * 20; // Keep it a multiple of grid size
        
        canvas.width = size;
        canvas.height = size;
        canvas.style.width = size + 'px';
        canvas.style.height = size + 'px';
        
        // Update game grid
        window.neuralSnake.tileCount = size / window.neuralSnake.gridSize;
        window.neuralSnake.drawGame();
    }
    
    // Initial resize and add resize listener
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    console.log('🐍 Neural Snake Game initialized! Ready to train your neural network!');
    console.log('🎮 Use arrow keys or WASD to start playing!');
});

// Add some fun console messages
console.log(`
🧠 =============================================
   Welcome to Neural Snake Game!
   
   🎯 Objective: Guide your neural snake to consume data nodes
   ⚡ Controls: Arrow keys or WASD
   🚀 Features: Progressive speed, score tracking, local high scores
   
   Built with ❤️ by Tushar Thanvi
🧠 =============================================
`);

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NeuralSnakeGame;
}