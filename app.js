// app.js
var board = Chessboard('myBoard')

const board = Chessboard('board', 'start');
// Initialize Chess.js and Chessboard.js
let game = new Chess();

const boardConfig = {
  draggable: true,
  position: 'start',
  onDragStart: onDragStart,
  onDrop: onDrop,
  onSnapEnd: onSnapEnd,
  onMouseoverSquare: onMouseoverSquare,
  onMouseoutSquare: onMouseoutSquare,
  pieceTheme: 'https://cdnjs.cloudflare.com/ajax/libs/chessboard.js/1.0.0/img/chesspieces/wikipedia/{piece}.png',
};

let board = Chessboard('board', boardConfig);

// Variables for timers
let whiteTime = 300; // 5 minutes in seconds
let blackTime = 300; // 5 minutes in seconds
let timerInterval = null;

// Start the game timer
startTimer();

// Event listener for the reset button
document.getElementById('resetBtn').addEventListener('click', resetGame);

function onDragStart(source, piece, position, orientation) {
	// Prevent moving pieces if the game is over
	if (game.game_over()) return false;
  
	// Only pick up pieces that correspond to the current player's turn
	if ((game.turn() === 'w' && piece.search(/^b/) !== -1) ||
		(game.turn() === 'b' && piece.search(/^w/) !== -1)) {
	  return false;
	}
  }
  
  function onDrop(source, target) {
	// Remove highlights
	removeGreySquares();
  
	// See if the move is legal
	let move = game.move({
	  from: source,
	  to: target,
	  promotion: 'q', // Always promote to a queen for simplicity
	});
  
	// Illegal move
	if (move === null) return 'snapback';
  
	updateStatus();
	updateMoveHistory();
	updateCapturedPieces(move);
  }
  
  function onSnapEnd() {
	board.position(game.fen());
  }
  

function updateStatus() {
  let status = '';

  let moveColor = game.turn() === 'b' ? 'Black' : 'White';

  // Check if game is over
  if (game.in_checkmate()) {
    status = `Game over, ${moveColor} is in checkmate.`;
  } else if (game.in_draw()) {
    status = 'Game over, drawn position.';
  } else {
    status = `Turn: ${moveColor}`;
    if (game.in_check()) {
      status += `, ${moveColor} is in check.`;
    }
  }

  document.getElementById('turn-info').innerHTML = status;
}

// Move History
function updateMoveHistory() {
  const historyElement = document.getElementById('history-body');
  const history = game.history({ verbose: true });

  // Clear history
  historyElement.innerHTML = '';

  for (let i = 0; i < history.length; i += 2) {
    let row = document.createElement('tr');

    let moveNumberCell = document.createElement('td');
    moveNumberCell.textContent = (i / 2) + 1;

    let whiteMoveCell = document.createElement('td');
    whiteMoveCell.textContent = history[i] ? history[i].san : '';

    let blackMoveCell = document.createElement('td');
    blackMoveCell.textContent = history[i + 1] ? history[i + 1].san : '';

    row.appendChild(moveNumberCell);
    row.appendChild(whiteMoveCell);
    row.appendChild(blackMoveCell);

    historyElement.appendChild(row);
  }
}

// Captured Pieces
let capturedWhite = [];
let capturedBlack = [];

function updateCapturedPieces(move) {
  if (move.captured) {
    const piece = move.captured;
    const color = move.color === 'w' ? 'b' : 'w'; // Captured piece color
    if (color === 'w') {
      capturedWhite.push(piece);
    } else {
      capturedBlack.push(piece);
    }
    displayCapturedPieces();
  }
}

function displayCapturedPieces() {
  const pieceTheme = boardConfig.pieceTheme;
  const capturedWhiteDiv = document.getElementById('captured-white');
  const capturedBlackDiv = document.getElementById('captured-black');

  capturedWhiteDiv.innerHTML = '';
  capturedBlackDiv.innerHTML = '';

  capturedWhite.forEach(piece => {
    let img = document.createElement('img');
    img.src = pieceTheme.replace('{piece}', 'w' + piece.toUpperCase());
    img.classList.add('captured-piece');
    capturedWhiteDiv.appendChild(img);
  });

  capturedBlack.forEach(piece => {
    let img = document.createElement('img');
    img.src = pieceTheme.replace('{piece}', 'b' + piece.toUpperCase());
    img.classList.add('captured-piece');
    capturedBlackDiv.appendChild(img);
  });
}

// Reset Game
function resetGame() {
  game.reset();
  board.start();
  updateStatus();
  document.getElementById('history-body').innerHTML = '';
  capturedWhite = [];
  capturedBlack = [];
  displayCapturedPieces();
  resetTimers();
}

// Timers
function startTimer() {
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(updateTimers, 1000);
}

function updateTimers() {
  if (game.game_over()) {
    clearInterval(timerInterval);
    return;
  }

  if (game.turn() === 'w') {
    whiteTime--;
  } else {
    blackTime--;
  }

  if (whiteTime <= 0 || blackTime <= 0) {
    clearInterval(timerInterval);
    const winner = whiteTime <= 0 ? 'Black' : 'White';
    alert(`Time's up! ${winner} wins.`);
    game_over = true;
  }

  document.getElementById('white-timer').textContent = formatTime(whiteTime);
  document.getElementById('black-timer').textContent = formatTime(blackTime);
}

function resetTimers() {
  whiteTime = 300;
  blackTime = 300;
  document.getElementById('white-timer').textContent = formatTime(whiteTime);
  document.getElementById('black-timer').textContent = formatTime(blackTime);
  startTimer();
}

function formatTime(time) {
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  return `${pad(minutes)}:${pad(seconds)}`;
}

function pad(num) {
  return num.toString().padStart(2, '0');
}

// Highlight Possible Moves
function onMouseoverSquare(square, piece) {
  // Get moves for this square
  let moves = game.moves({
    square: square,
    verbose: true
  });

  // Exit if there are no moves available for this square
  if (moves.length === 0) return;

  // Highlight the square they moused over
  greySquare(square);

  // Highlight the possible squares for this piece
  for (let i = 0; i < moves.length; i++) {
    greySquare(moves[i].to);
  }
}

function onMouseoutSquare(square, piece) {
  removeGreySquares();
}

function removeGreySquares() {
  const squares = document.querySelectorAll('#board .square-55d63');
  squares.forEach(square => {
    square.classList.remove('square-available');
  });
}

function greySquare(square) {
  const squareEl = document.querySelector(`#board .square-${square}`);
  if (squareEl) {
    squareEl.classList.add('square-available');
  }
}

// Initial status update
updateStatus();
