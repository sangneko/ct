const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");

const rows = 10, cols = 9, size = 50;
let currentTurn = "red";

// --- Vẽ bàn cờ ---
function drawBoard() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "#333";
  ctx.lineWidth = 1.2;

  ctx.strokeRect(size / 2, size / 2, (cols - 1) * size, (rows - 1) * size);

  for (let r = 1; r < rows - 1; r++) {
    ctx.beginPath();
    ctx.moveTo(size / 2, r * size + size / 2);
    ctx.lineTo((cols - 1) * size + size / 2, r * size + size / 2);
    ctx.stroke();
  }

  for (let c = 0; c < cols; c++) {
    ctx.beginPath();
    ctx.moveTo(c * size + size / 2, size / 2);
    if (c === 0 || c === cols - 1) {
      ctx.lineTo(c * size + size / 2, (rows - 1) * size + size / 2);
    } else {
      ctx.lineTo(c * size + size / 2, 4 * size + size / 2);
      ctx.moveTo(c * size + size / 2, 5 * size + size / 2);
      ctx.lineTo(c * size + size / 2, (rows - 1) * size + size / 2);
    }
    ctx.stroke();
  }

  // 2 cung tướng
  drawPalace(3, 0, 5, 2);
  drawPalace(5, 0, 3, 2);
  drawPalace(3, 9, 5, 7);
  drawPalace(5, 9, 3, 7);
}

function drawPalace(x1, y1, x2, y2) {
  ctx.beginPath();
  ctx.moveTo(x1 * size + size / 2, y1 * size + size / 2);
  ctx.lineTo(x2 * size + size / 2, y2 * size + size / 2);
  ctx.stroke();
}

// --- Vẽ quân ---
function drawPiece(x, y, text, color) {
  ctx.beginPath();
  ctx.arc(x * size + size / 2, y * size + size / 2, 20, 0, Math.PI * 2);
  ctx.fillStyle = "#fff";
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.stroke();

  ctx.fillStyle = color;
  ctx.font = "20px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, x * size + size / 2, y * size + size / 2);
}

// --- Khởi tạo quân ---
function initialPieces() {
  return [
    // Đen (AI)
    {x:0,y:0,text:"車",color:"black"},{x:1,y:0,text:"馬",color:"black"},
    {x:2,y:0,text:"象",color:"black"},{x:3,y:0,text:"士",color:"black"},
    {x:4,y:0,text:"將",color:"black"},{x:5,y:0,text:"士",color:"black"},
    {x:6,y:0,text:"象",color:"black"},{x:7,y:0,text:"馬",color:"black"},
    {x:8,y:0,text:"車",color:"black"},{x:1,y:2,text:"砲",color:"black"},
    {x:7,y:2,text:"砲",color:"black"},{x:0,y:3,text:"卒",color:"black"},
    {x:2,y:3,text:"卒",color:"black"},{x:4,y:3,text:"卒",color:"black"},
    {x:6,y:3,text:"卒",color:"black"},{x:8,y:3,text:"卒",color:"black"},
    // Đỏ (người chơi)
    {x:0,y:9,text:"車",color:"red"},{x:1,y:9,text:"馬",color:"red"},
    {x:2,y:9,text:"相",color:"red"},{x:3,y:9,text:"士",color:"red"},
    {x:4,y:9,text:"帥",color:"red"},{x:5,y:9,text:"士",color:"red"},
    {x:6,y:9,text:"相",color:"red"},{x:7,y:9,text:"馬",color:"red"},
    {x:8,y:9,text:"車",color:"red"},{x:1,y:7,text:"炮",color:"red"},
    {x:7,y:7,text:"炮",color:"red"},{x:0,y:6,text:"兵",color:"red"},
    {x:2,y:6,text:"兵",color:"red"},{x:4,y:6,text:"兵",color:"red"},
    {x:6,y:6,text:"兵",color:"red"},{x:8,y:6,text:"兵",color:"red"},
  ];
}

let pieces = initialPieces();

function drawPieces() {
  for (let p of pieces) drawPiece(p.x, p.y, p.text, p.color);
}

function getPiece(x,y){ return pieces.find(p=>p.x===x && p.y===y); }
function sameColor(a,b){ return a && b && a.color===b.color; }

// --- Kiểm tra nước đi hợp lệ ---
function isValidMove(piece,x,y) {
  const dx=x-piece.x, dy=y-piece.y;
  const adx=Math.abs(dx), ady=Math.abs(dy);
  const target=getPiece(x,y);

  switch(piece.text){
    case "將": case "帥":
      if(adx+ady!==1) return false;
      if(piece.color==="black" && (x<3||x>5||y<0||y>2)) return false;
      if(piece.color==="red" && (x<3||x>5||y<7||y>9)) return false;
      return true;
    case "士":
      if(adx!==1||ady!==1) return false;
      if(piece.color==="black" && (x<3||x>5||y<0||y>2)) return false;
      if(piece.color==="red" && (x<3||x>5||y<7||y>9)) return false;
      return true;
    case "象": case "相":
      if(adx!==2||ady!==2) return false;
      if(getPiece(piece.x+dx/2,piece.y+dy/2)) return false;
      if(piece.color==="black" && y>4) return false;
      if(piece.color==="red" && y<5) return false;
      return true;
    case "車":
      if(dx!==0 && dy!==0) return false;
      for(let i=1;i<Math.max(adx,ady);i++){
        if(getPiece(piece.x+(dx===0?0:i*Math.sign(dx)),piece.y+(dy===0?0:i*Math.sign(dy)))) return false;
      }
      return true;
    case "砲": case "炮":
      if(dx!==0 && dy!==0) return false;
      let count=0;
      for(let i=1;i<Math.max(adx,ady);i++){
        if(getPiece(piece.x+(dx===0?0:i*Math.sign(dx)),piece.y+(dy===0?0:i*Math.sign(dy)))) count++;
      }
      return target ? count===1 : count===0;
    case "馬":
      if(!((adx===1&&ady===2)||(adx===2&&ady===1))) return false;
      if(adx===2 && getPiece(piece.x+dx/2,piece.y)) return false;
      if(ady===2 && getPiece(piece.x,piece.y+dy/2)) return false;
      return true;
    case "卒": case "兵":
      if(piece.color==="black"){
        if(y<piece.y) return false;
        if(piece.y<=4) return dx===0&&dy===1;
        else return (dx===0&&dy===1)||(adx===1&&dy===0);
      } else {
        if(y>piece.y) return false;
        if(piece.y>=5) return dx===0&&dy===-1;
        else return (dx===0&&dy===-1)||(adx===1&&dy===0);
      }
  }
  return false;
}

// --- Kiểm tra thắng ---
function checkWin() {
  const redGeneral = pieces.find(p => p.text === "帥");
  const blackGeneral = pieces.find(p => p.text === "將");
  if (!redGeneral) resetGame("black");
  if (!blackGeneral) resetGame("red");
}

// --- Reset game ---
function resetGame(winnerColor) {
  setTimeout(() => {
    alert(`Bên ${winnerColor === "red" ? "Đỏ" : "Đen"} thắng!`);
    pieces = initialPieces();
    currentTurn = "red";
    document.getElementById("turn").textContent = "Lượt: Đỏ";
    drawBoard(); drawPieces();
  }, 300);
}

// --- AI logic ---
// Nếu không ăn được, AI sẽ tìm nước di chuyển hợp lệ ngẫu nhiên.
function aiAttack() {
  let attackMoves = [];
  let moveList = [];

  for (let piece of pieces.filter(p => p.color === "black")) {
    for (let x = 0; x < cols; x++) {
      for (let y = 0; y < rows; y++) {
        const target = getPiece(x, y);
        if (isValidMove(piece, x, y)) {
          if (target && target.color === "red") attackMoves.push({piece, x, y});
          else moveList.push({piece, x, y});
        }
      }
    }
  }

  let move = attackMoves.length > 0 
    ? attackMoves[Math.floor(Math.random() * attackMoves.length)]
    : moveList[Math.floor(Math.random() * moveList.length)];

  if (!move) {
    currentTurn = "red";
    document.getElementById("turn").textContent = "Lượt: Đỏ";
    return;
  }

  const target = getPiece(move.x, move.y);
  if (target) pieces = pieces.filter(p => p !== target);
  move.piece.x = move.x;
  move.piece.y = move.y;

  checkWin();
  currentTurn = "red";
  document.getElementById("turn").textContent = "Lượt: Đỏ";
  drawBoard(); drawPieces();
}

// --- Chọn quân & di chuyển ---
let selected = null;
canvas.addEventListener("click", e => {
  if (currentTurn !== "red") return;

  const rect = canvas.getBoundingClientRect();
  const x = Math.floor((e.clientX - rect.left) / size);
  const y = Math.floor((e.clientY - rect.top) / size);

  if (selected) {
    let target = getPiece(x, y);
    if (target && sameColor(selected, target)) {
      selected = null;
      return;
    }
    if (isValidMove(selected, x, y)) {
      if (target) pieces = pieces.filter(p => p !== target);
      selected.x = x;
      selected.y = y;
      currentTurn = "black";
      document.getElementById("turn").textContent = "Lượt: Đen";
      drawBoard(); drawPieces();
      checkWin();
      setTimeout(aiAttack, 800);
    }
    selected = null;
  } else {
    let p = getPiece(x, y);
    if (p && p.color === "red") selected = p;
  }
});

// --- Khởi tạo ---
function init(){ drawBoard(); drawPieces(); }
init();
