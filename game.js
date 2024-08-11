const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const WIDTH = 400;
const HEIGHT = 600;

// Colori
const WHITE = "rgb(255, 255, 255)";
const BLACK = "rgb(0, 0, 0)";
const RED = "rgb(255, 0, 0)";
const GREEN = "rgb(0, 255, 0)";
const BROWN = "rgb(139, 69, 19)";

// Variabili di gioco
let player_x = WIDTH / 2;
const player_y = HEIGHT - 50;
const player_width = 40;
const player_height = 50;
const tree_width = 20;
const branch_height = 50;
let score = 0;
let timer = 10;
let max_timer = 10;
let game_started = false;
let game_over = false;
const num_branches = Math.floor(HEIGHT / branch_height);

let branches = [];

// Funzione per generare un nuovo ramo
function generate_branch(type = null) {
    const sides = ["left", "right", "none"];
    const side = type ? type : sides[Math.floor(Math.random() * sides.length)];
    return { side: side, y: -branch_height };
}

// Genera i primi rami
function generate_first_branches() {
    for (let i = 0; i < num_branches - 2; i++) {
        branches.push(generate_branch());
        branches[branches.length - 1].y = i * branch_height;
    }
    for (let i = 0; i < 2; i++) {
        branches.push(generate_branch("none"));
        branches[branches.length - 1].y = (num_branches - 2) * branch_height + i * branch_height;
    }
}

generate_first_branches();

// Gestione degli input
document.addEventListener('keydown', handleKeyDown);
canvas.addEventListener('mousedown', handleMouseDown);

function handleKeyDown(event) {
    if (!game_started) {
        if (event.code === 'Space') {
            startGame();
        }
    } else if (!game_over) {
        if (event.code === 'ArrowLeft') {
            movePlayer('left');
        } else if (event.code === 'ArrowRight') {
            movePlayer('right');
        }
    } else {
        if (event.code === 'Space') {
            restartGame();
        }
    }
}

function handleMouseDown(event) {
    if (!game_started || game_over) {
        startGame();
    } else {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        movePlayer(x < WIDTH / 2 ? 'left' : 'right');
    }
}

function movePlayer(direction) {
    player_x = direction === 'left' ? WIDTH / 4 : 3 * WIDTH / 4;
    moveBranchesDown();
    score++;
    timer = max_timer;
}

function moveBranchesDown() {
    branches.forEach(branch => branch.y += branch_height);
}

function startGame() {
    game_started = true;
    timer = max_timer;
    score = 0;
}

function restartGame() {
    game_started = true;
    game_over = false;
    max_timer = 10;
    timer = max_timer;
    score = 0;
    branches = [];
    generate_first_branches();
}

function update() {
    if (game_started && !game_over) {
        // Aggiorna il timer
        timer -= 1 / 60;  // Circa 60 FPS
        if (timer <= 0) {
            game_over = true;
        }

        // Aggiorna il valore massimo del timer
        max_timer = Math.max(10 - score * 0.02, 1);

        // Controllo collisione e aggiunta nuovo ramo
        if (branches[branches.length - 1].y >= HEIGHT) {
            branches.pop();
            branches.unshift(generate_branch());
        }

        // Controllo collisione con il giocatore
        if (branches[branches.length - 1].y + branch_height > player_y) {
            if ((branches[branches.length - 1].side === "left" && player_x < WIDTH / 2) ||
                (branches[branches.length - 1].side === "right" && player_x > WIDTH / 2)) {
                game_over = true;
            }
        }
    }
}

function draw() {
    ctx.canvas.width = window.innerWidth;
    ctx.canvas.height = window.innerHeight;
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
        ctx.fillText(`Game Over! Punteggio: ${score}`, WIDTH / 2, HEIGHT / 2);
        ctx.fillText("Premi per ricominciare", WIDTH / 2, HEIGHT / 2 + 40);
    } else {
        // Disegna l'albero
        ctx.fillStyle = BROWN;
        ctx.fillRect(WIDTH / 2 - tree_width / 2, 0, tree_width, HEIGHT);

        // Disegna i rami
        ctx.fillStyle = GREEN;
        branches.forEach(branch => {
            if (branch.side === "left") {
                ctx.fillRect(WIDTH / 2 - tree_width / 2 - branch_height, branch.y, branch_height, branch_height);
            } else if (branch.side === "right") {
                ctx.fillRect(WIDTH / 2 + tree_width / 2, branch.y, branch_height, branch_height);
            }
        });

        // Disegna il giocatore
        ctx.fillStyle = RED;
        ctx.fillRect(player_x - player_width / 2, player_y, player_width, player_height);

        // Disegna il punteggio
        ctx.fillStyle = BLACK;
        ctx.font = "36px Arial";
        ctx.textAlign = "left";
        ctx.fillText(`Punteggio: ${score}`, 10, 40);

        // Disegna il timer
        ctx.strokeStyle = BLACK;
        ctx.lineWidth = 2;
        ctx.strokeRect(10, HEIGHT - 30, WIDTH - 20, 20);
        ctx.fillStyle = GREEN;
        ctx.fillRect(12, HEIGHT - 28, (WIDTH - 24) * (timer / max_timer), 16);
    }
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();