"use strict"

// telegram interaction variables(still not implemented)
let userId; 
let chatId;
let messageId;
// end of telegram interaction variables

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;

// Colori
const WHITE = "rgb(255, 255, 255)";
const BLACK = "rgb(0, 0, 0)";
const RED = "rgb(255, 0, 0)";
const GREEN = "rgb(0, 255, 0)";
const BROWN = "rgb(139, 69, 19)";

// Variabili di gioco
const player_width = WIDTH / 10;
const player_height = HEIGHT / 4;
const tree_width = WIDTH / 20;
const branch_height = player_height / 2;
const branch_width = player_width;
const HARD_MAX_TIMER = 5;
let start = Date.now();
let current = start;
let delta = 0;
let sent = false;
let score = 0;
let max_score = 0;
let max_timer = HARD_MAX_TIMER;
let timer = max_timer;
let game_started = false;
let game_over = false;
const num_branches = Math.floor((HEIGHT - player_height) / branch_height);
const P_LEFT = WIDTH / 2 - tree_width / 2 - player_width / 2
const P_RIGHT = WIDTH / 2 + tree_width / 2 + player_width / 2
let player_x = P_RIGHT;
let player_y = HEIGHT - player_height;

let branches = [];

// Suoni

let chopSound = new Audio("sounds/Chop_Log_Sound.mp3");
let manSprite = new Image();
manSprite.src = "sprites/man.png";
let flippedManSprite = new Image();
flippedManSprite.src = "sprites/flipped_man.png";

// Funzione per generare un nuovo ramo
function generate_branch(type = null) {
    const sides = ["left", "right", "none"];
    const side = type ? type : sides[Math.floor(Math.random() * sides.length)];
    return { side: side, y: 0 };
}

// Genera i primi rami
function generate_first_branches() {
    for (let i = 0; i < num_branches; i++) {
        // if (i < num_branches - 2) {
            branches.push(generate_branch());
        // }
        // else {
        //     branches.push(generate_branch("none"));
        // }
        branches[branches.length - 1].y = i * branch_height;
    }
}

generate_first_branches();

// Gestione degli input
document.addEventListener('keydown', handleKeyDown);
canvas.addEventListener('mousedown', handleMouseDown);

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
    branches.forEach(branch => branch.y += branch_height);
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
        ctx.fillRect(WIDTH / 2 - tree_width / 2, 0, tree_width, HEIGHT);

        // Disegna i rami
        ctx.fillStyle = GREEN;
        branches.forEach(branch => {
            /*if (branch === branches[branches.length - 1]){
                return;
            }
            else */if (branch.side === "left") {
                ctx.fillRect(WIDTH / 2 - tree_width / 2 - branch_width, branch.y, branch_width, branch_height);
            } else if (branch.side === "right") {
                ctx.fillRect(WIDTH / 2 + tree_width / 2, branch.y, branch_width, branch_height);
            }
        });

        // Disegna il giocatore
        if (player_x === P_LEFT) {
			ctx.drawImage(manSprite, player_x - player_width / 2, player_y, player_width, player_height);
		}
		else if (player_x === P_RIGHT) {
			ctx.drawImage(flippedManSprite, player_x - player_width / 2, player_y, player_width, player_height);
		}
		// ctx.fillStyle = RED;
        // ctx.fillRect(player_x - player_width / 2, player_y, player_width, player_height);

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
        ctx.fillRect(12, HEIGHT - 28, (WIDTH / 5 - 1) * (timer / max_timer), 16);
    }
}

function gameLoop() {
    current = Date.now();
    delta = current - start;
    start = current;
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();
