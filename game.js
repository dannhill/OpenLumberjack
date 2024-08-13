"use strict"

// telegram interaction variables(still not implemented)
let userId; 
let chatId;
let messageId;
// end of telegram interaction variables

// Colors
const WHITE = "rgb(255, 255, 255)";
const BLACK = "rgb(0, 0, 0)";
const RED = "rgb(255, 0, 0)";
const GREEN = "rgb(0, 255, 0)";
const BROWN = "rgb(139, 69, 19)";

// GAME CONSTANTS
// Canvas
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
// Canvas dimensions
const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;
// Player dimensions
const PLAYER_WIDTH = WIDTH / 10;
const PLAYER_HEIGHT = HEIGHT / 4;
// Tree dimensions
const TREE_WIDTH = WIDTH / 20;
// Branch dimensions
const BRANCH_HEIGHT = PLAYER_HEIGHT / 2;
const BRANCH_WIDTH = PLAYER_WIDTH;
// Timer
const HARD_MAX_TIMER = 5;
// Number of branches
const NUM_BRANCHES = Math.floor((HEIGHT - PLAYER_HEIGHT) / BRANCH_HEIGHT);
// Player positions
const P_LEFT = WIDTH / 2 - TREE_WIDTH / 2 - PLAYER_WIDTH / 2
const P_RIGHT = WIDTH / 2 + TREE_WIDTH / 2 + PLAYER_WIDTH / 2

// GAME VARIABLES
// Time
let start = Date.now();
let current = start;
let delta = 0;
// Game variables
let score = 0;
let max_score = 0;
let max_timer = HARD_MAX_TIMER;
let timer = max_timer;
let game_started = false;
let game_over = false;
// Player position
let player_x = P_RIGHT;
let player_y = HEIGHT - PLAYER_HEIGHT;

// DATA STRUCTURES
let branches = [];

// MEDIA VARIABLES
// Sounds
let chopSound = new Audio("sounds/Chop_Log_Sound.mp3");
// Sprites
let manSprite = new Image();
manSprite.src = "sprites/man.png";
let flippedManSprite = new Image();
flippedManSprite.src = "sprites/flipped_man.png";

function generate_branch(type = null) {
    const sides = ["left", "right", "none"];
    const side = type ? type : sides[Math.floor(Math.random() * sides.length)];
    return { side: side, y: 0 };
}

function generate_first_branches() {
    for (let i = 0; i < NUM_BRANCHES; i++) {
        branches.push(generate_branch());
        branches[branches.length - 1].y = i * BRANCH_HEIGHT;
    }
}

function handleKeyDown(event) {
    if (!game_started && !game_over) {
        if (event.code === 'Space') {
            startGame();
        }
    } else if (game_started && !game_over) {
        if (event.code === 'ArrowLeft') {
            movePlayer('left');
        } else if (event.code === 'ArrowRight') {
            movePlayer('right');
        }
    } else if (game_over) {
        if (event.code === 'Space') {
            restartGame();
        }
    }
}

function handleMouseDown(event) {
    if (!game_started && !game_over) {
        startGame();
    } else if (game_over){
        restartGame();
    } 
    else {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        movePlayer(x < WIDTH / 2 ? 'left' : 'right');
    }
}

function movePlayer(direction) {
    player_x = (direction === 'left' ? P_LEFT : direction === 'right' ? P_RIGHT : player_x);

	if ((branches[branches.length - 1].side === "left" && direction === "left") ||
		(branches[branches.length - 1].side === "right" && direction === "right")) {
		game_over = true;
	}
	moveBranchesDown();
    score++;

    chopSound.cloneNode(true).play();//TODOcreates new instance but hopefully it will be removed by garbage collector

	// Update record
    if (max_score < score) {
		max_score = score;
	}

    // Gestione tempo gioco
    let inverseProportionalToTimer = max_timer / timer / 2; // valore compreso tra 1 e max_timer(per timer maggiore o uguale a 1), poi diviso per 2
    let percentageInverseProportionalToTimer = inverseProportionalToTimer / max_timer; // percentuale compresa tra 0 e 1(per timer maggiore o uguale a 1)
    addTime(percentageInverseProportionalToTimer);
}

function addTime(percentage) {
    if (timer + percentage * max_timer >= max_timer) {
        timer = max_timer;
        return;
    }
    else {
        timer += percentage * max_timer;
    }
}

function moveBranchesDown() {
    branches.forEach(branch => branch.y += BRANCH_HEIGHT);
    pop_push_new_branch();
    
}

function startGame() {
    game_started = true;
    timer = max_timer;
    score = 0;
}

function restartGame() {
    game_started = true;
    game_over = false;
	sent = false;
    max_timer = HARD_MAX_TIMER;
    timer = max_timer;
    score = 0;
    branches = [];
    generate_first_branches();
}

function pop_push_new_branch() {
    branches.pop();
    branches.unshift(generate_branch());
}

function update() {
    if (game_started && !game_over) {
        // Aggiorna il timer
        timer -=  delta / 1000;
        if (timer <= 0) {
            game_over = true;
        }

        // Aggiorna il valore massimo del timer
        max_timer = Math.max(HARD_MAX_TIMER - score * 0.02, 1);
        
    }
}

function draw() {
    ctx.canvas.width = WIDTH;
    ctx.canvas.height = HEIGHT;
    ctx.fillStyle = WHITE;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    if (!game_started) {
        ctx.fillStyle = BLACK;
        ctx.font = "36px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Premi per iniziare", WIDTH / 2, HEIGHT / 2);
    } else if (game_over) {
        ctx.fillStyle = BLACK;
        ctx.font = "36px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Game Over!", WIDTH / 2, HEIGHT / 2);
        ctx.fillText(`Punteggio: ${score}`, WIDTH / 2, HEIGHT / 2 + 40);
        ctx.fillText(`Record: ${max_score}`, WIDTH / 2, HEIGHT / 2 + 80);
        ctx.fillText("Premi per ricominciare", WIDTH / 2, HEIGHT / 2 + 120);
    } else {
        // Disegna l'albero
        ctx.fillStyle = BROWN;
        ctx.fillRect(WIDTH / 2 - TREE_WIDTH / 2, 0, TREE_WIDTH, HEIGHT);

        // Disegna i rami
        ctx.fillStyle = GREEN;
        branches.forEach(branch => {
            /*if (branch === branches[branches.length - 1]){
                return;
            }
            else */if (branch.side === "left") {
                ctx.fillRect(WIDTH / 2 - TREE_WIDTH / 2 - BRANCH_WIDTH, branch.y, BRANCH_WIDTH, BRANCH_HEIGHT);
            } else if (branch.side === "right") {
                ctx.fillRect(WIDTH / 2 + TREE_WIDTH / 2, branch.y, BRANCH_WIDTH, BRANCH_HEIGHT);
            }
        });

        // Disegna il giocatore
        if (player_x === P_LEFT) {
			ctx.drawImage(manSprite, player_x - PLAYER_WIDTH / 2, player_y, PLAYER_WIDTH, PLAYER_HEIGHT);
		}
		else if (player_x === P_RIGHT) {
			ctx.drawImage(flippedManSprite, player_x - PLAYER_WIDTH / 2, player_y, PLAYER_WIDTH, PLAYER_HEIGHT);
		}
		// ctx.fillStyle = RED;
        // ctx.fillRect(player_x - PLAYER_WIDTH / 2, player_y, PLAYER_WIDTH, PLAYER_HEIGHT);

        // Disegna il punteggio
        ctx.fillStyle = BLACK;
        ctx.font = "36px Arial";
        ctx.textAlign = "left";
        ctx.fillText(`Punteggio: ${score}`, 10, 40);
        ctx.fillText(`Record: ${max_score}`, 10, 100);

        // Disegna il timer
        ctx.strokeStyle = BLACK;
        ctx.lineWidth = 2;
        ctx.strokeRect(10, HEIGHT - 30, WIDTH / 5, 20);
        ctx.fillStyle = GREEN;
        ctx.fillRect(12, HEIGHT - 28, (WIDTH / 5 - 2) * (timer / max_timer), 16);
    }
}

generate_first_branches();

// Input handling
document.addEventListener('keydown', handleKeyDown);
canvas.addEventListener('mousedown', handleMouseDown);

function gameLoop() {
    current = Date.now();
    delta = current - start;
    start = current;
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();
