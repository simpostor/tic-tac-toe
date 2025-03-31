console.log("Welcome to Tic Tac Toe");

// Audio variables (if you want to enable sounds)
// let music = new Audio("music.mp3");
// let audioTurn = new Audio("ting.mp3");
// let gameover = new Audio("gameover.mp3");

let isGameOver = false;
let board = ["", "", "", "", "", "", "", "", ""];
let playerSymbol = "X";
let botSymbol = "0";
let currentTurn = "X"; // current turn indicator
let temperature = 3; // default: Easy (3 means 75% random)
  
// Get DOM elements
const boxes = document.getElementsByClassName("box");
const infoDisplay = document.getElementsByClassName("info")[0];
const resetButton = document.getElementById("reset");
const startGameButton = document.getElementById("startGame");
const openSettingsButton = document.getElementById("openSettings");
const gameContainer = document.querySelector(".gameContainer");
const settingsPanel = document.querySelector(".settings");
const welcomeMessage = document.getElementById("welcomeMessage");
const difficultySelect = document.getElementById("difficultySelect");
const symbolRadios = document.getElementsByName("playerSymbol");

// Utility: Check if board cell is empty
const isEmpty = (index) => board[index] === "";

// Function to update the board UI
const updateBoardUI = () => {
  Array.from(boxes).forEach((element, index) => {
    const boxText = element.querySelector('.boxtext');
    boxText.innerText = board[index];
  });
};

// Function to reset the board state and UI.
const resetGame = () => {
  board = ["", "", "", "", "", "", "", "", ""];
  updateBoardUI();
  isGameOver = false;
  currentTurn = playerSymbol;
  infoDisplay.innerText = "Turn for " + currentTurn;
};

// Function to check for win
const checkWin = (brd) => {
  const winCombos = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let combo of winCombos) {
    const [a, b, c] = combo;
    if (brd[a] && brd[a] === brd[b] && brd[a] === brd[c]) {
      return brd[a];
    }
  }
  return null;
};

// Function to check for draw
const checkDraw = (brd) => {
  return brd.every(cell => cell !== "");
};

// The minimax algorithm with randomness adjustment.
// temperature parameter is still passed to tahyt but randomness in computerMove is handled separately.
const tahyt = (brd, currentPlayer, temp) => {
  let winner = checkWin(brd);
  if (winner === botSymbol) return { score: 10 };
  if (winner === playerSymbol) return { score: -10 };
  if (checkDraw(brd)) return { score: 0 };

  let moves = [];
  for (let i = 0; i < brd.length; i++) {
    if (brd[i] === "") {
      let move = {};
      move.index = i;
      brd[i] = currentPlayer;
      let result = tahyt(brd, currentPlayer === botSymbol ? playerSymbol : botSymbol, temp);
      move.score = result.score;
      brd[i] = "";
      moves.push(move);
    }
  }

  // Adjust moves with a random bonus based on temp (this effect is secondary to the pure randomness in computerMove)
  moves = moves.map(m => ({ ...m, score: m.score + Math.random() * temp }));

  let bestMove;
  if (currentPlayer === botSymbol) {
    let bestScore = -Infinity;
    moves.forEach(m => {
      if (m.score > bestScore) {
        bestScore = m.score;
        bestMove = m;
      }
    });
  } else {
    let bestScore = Infinity;
    moves.forEach(m => {
      if (m.score < bestScore) {
        bestScore = m.score;
        bestMove = m;
      }
    });
  }
  return bestMove;
};

// Function for the computer to make its move.
const computerMove = () => {
  if (isGameOver) return;
  
  // Set random move probability based on temperature level:
  // Temperature 3: 75% random, 2: 50% random, 1: 25% random.
  let randomChance = 0;
  if (temperature == 3) {
    randomChance = 0.75;
  } else if (temperature == 2) {
    randomChance = 0.5;
  } else if (temperature == 1) {
    randomChance = 0.25;
  }
  
  if (Math.random() < randomChance) {
    let availableMoves = [];
    board.forEach((cell, index) => {
      if (cell === "") availableMoves.push(index);
    });
    if (availableMoves.length > 0) {
      let randomIndex = availableMoves[Math.floor(Math.random() * availableMoves.length)];
      board[randomIndex] = botSymbol;
      updateBoardUI();
      if (checkWin(board)) {
        infoDisplay.innerText = botSymbol + " Won!";
        isGameOver = true;
        return;
      } else if (checkDraw(board)) {
        infoDisplay.innerText = "Draw!";
        isGameOver = true;
        return;
      }
      currentTurn = playerSymbol;
      infoDisplay.innerText = "Turn for " + currentTurn;
      return;
    }
  }

  let move = tahyt(board.slice(), botSymbol, temperature);
  if (move && move.index !== undefined) {
    board[move.index] = botSymbol;
    updateBoardUI();
    if (checkWin(board)) {
      infoDisplay.innerText = botSymbol + " Won!";
      isGameOver = true;
      return;
    } else if (checkDraw(board)) {
      infoDisplay.innerText = "Draw!";
      isGameOver = true;
      return;
    }
    currentTurn = playerSymbol;
    infoDisplay.innerText = "Turn for " + currentTurn;
  }
};

// Handle player's click on a box.
Array.from(boxes).forEach((element, index) => {
  element.addEventListener("click", () => {
    if (isGameOver) return;
    if (board[index] !== "") return;
    if (currentTurn !== playerSymbol) return; // wait for bot move

    board[index] = playerSymbol;
    updateBoardUI();

    let winner = checkWin(board);
    if (winner) {
      infoDisplay.innerText = winner + " Won!";
      isGameOver = true;
      return;
    } else if (checkDraw(board)) {
      infoDisplay.innerText = "Draw!";
      isGameOver = true;
      return;
    }
    currentTurn = botSymbol;
    infoDisplay.innerText = "Bot's turn...";
    setTimeout(computerMove, 500);
  });
});

// Reset game functionality.
resetButton.addEventListener("click", () => {
  resetGame();
});

// Open settings functionality.
openSettingsButton.addEventListener("click", () => {
  settingsPanel.style.display = "block";
  gameContainer.style.display = "none";
  resetGame();
});

// Start game: initialize settings and reset game.
startGameButton.addEventListener("click", () => {
  // Update player symbol.
  let symbolChoice = document.querySelector('input[name="playerSymbol"]:checked').value;
  playerSymbol = symbolChoice;
  botSymbol = playerSymbol === "X" ? "0" : "X";
  
  // Update temperature based on difficulty selection.
  temperature = parseInt(difficultySelect.value, 10);
  
  // Hide settings panel, show game.
  settingsPanel.style.display = "none";
  gameContainer.style.display = "flex";
  welcomeMessage.innerText = "You are " + playerSymbol + " and Bot is " + botSymbol;
  currentTurn = playerSymbol;
  infoDisplay.innerText = "Turn for " + currentTurn;
  
  resetGame();
});

// Auto-reset game when settings change.
[symbolRadios, difficultySelect].forEach(inputGroup => {
  if (inputGroup.length) {
    Array.from(inputGroup).forEach(input => {
      input.addEventListener("change", () => {
        // If game is in progress, update settings and reset.
        let symbolChoice = document.querySelector('input[name="playerSymbol"]:checked').value;
        playerSymbol = symbolChoice;
        botSymbol = playerSymbol === "X" ? "0" : "X";
        temperature = parseInt(difficultySelect.value, 10);
        welcomeMessage.innerText = "You are " + playerSymbol + " and Bot is " + botSymbol;
        resetGame();
      });
    });
  } else {
    // For non-array element (difficultySelect)
    inputGroup.addEventListener("change", () => {
      temperature = parseInt(difficultySelect.value, 10);
      resetGame();
    });
  }
});
