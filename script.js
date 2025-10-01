const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");

const rows = 10, cols = 9, size = 50;

// --- Vẽ bàn cờ ---
function drawBoard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#333";

    for (let c = 0; c < cols; c++) {
        ctx.beginPath();
        ctx.moveTo(c * size + size / 2, size / 2);
        ctx.lineTo(c * size + size / 2, (rows - 1) * size + size / 2);
        ctx.stroke();
    }
    for (let r = 0; r < rows; r++) {
        ctx.beginPath();
        ctx.moveTo(size / 2, r * size + size / 2);
        ctx.lineTo((cols - 1) * size + size / 2, r * size + size / 2);
        ctx.stroke();
    }
}

// --- Vẽ quân cờ ---
function drawPiece(x, y, text, color) {
    ctx.beginPath();
    ctx.arc(x * size + size / 2, y * size + size / 2, 20, 0, Math.PI * 2);
    ctx.fillStyle = "#fff";
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.stroke();

    ctx.fillStyle = color;
    ctx.font = "16px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, x * size + size / 2, y * size + size / 2);
}

// --- Danh sách quân ---
let pieces = [
    // Đen
    {x:0,y:0,text:"車",color:"black"},{x:1,y:0,text:"馬",color:"black"},
    {x:2,y:0,text:"象",color:"black"},{x:3,y:0,text:"士",color:"black"},
    {x:4,y:0,text:"將",color:"black"},{x:5,y:0,text:"士",color:"black"},
    {x:6,y:0,text:"象",color:"black"},{x:7,y:0,text:"馬",color:"black"},
    {x:8,y:0,text:"車",color:"black"},{x:1,y:2,text:"砲",color:"black"},
    {x:7,y:2,text:"砲",color:"black"},{x:0,y:3,text:"卒",color:"black"},
    {x:2,y:3,text:"卒",color:"black"},{x:4,y:3,text:"卒",color:"black"},
    {x:6,y:3,text:"卒",color:"black"},{x:8,y:3,text:"卒",color:"black"},
    // Đỏ
    {x:0,y:9,text:"車",color:"red"},{x:1,y:9,text:"馬",color:"red"},
    {x:2,y:9,text:"相",color:"red"},{x:3,y:9,text:"仕",color:"red"},
    {x:4,y:9,text:"帥",color:"red"},{x:5,y:9,text:"仕",color:"red"},
    {x:6,y:9,text:"相",color:"red"},{x:7,y:9,text:"馬",color:"red"},
    {x:8,y:9,text:"車",color:"red"},{x:1,y:7,text:"炮",color:"red"},
    {x:7,y:7,text:"炮",color:"red"},{x:0,y:6,text:"兵",color:"red"},
    {x:2,y:6,text:"兵",color:"red"},{x:4,y:6,text:"兵",color:"red"},
    {x:6,y:6,text:"兵",color:"red"},{x:8,y:6,text:"兵",color:"red"},
];

function drawPieces() {
    for (let p of pieces) drawPiece(p.x, p.y, p.text, p.color);
}

// --- Hàm phụ ---
function getPiece(x,y){ return pieces.find(p=>p.x===x && p.y===y); }
function sameColor(a,b){ return a && b && a.color===b.color; }

// --- Kiểm tra nước đi hợp lệ ---
function isValidMove(piece,x,y) {
    let dx=x-piece.x, dy=y-piece.y;
    let adx=Math.abs(dx), ady=Math.abs(dy);

    switch(piece.text){
        case "將": case "帥": {
            if(adx+ady!==1) return false;
            if(piece.color==="black" && (x<3||x>5||y<0||y>2)) return false;
            if(piece.color==="red" && (x<3||x>5||y<7||y>9)) return false;
            return true;
        }
        case "士": case "仕": {
            if(adx!==1||ady!==1) return false;
            if(piece.color==="black" && (x<3||x>5||y<0||y>2)) return false;
            if(piece.color==="red" && (x<3||x>5||y<7||y>9)) return false;
            return true;
        }
        case "象": case "相": {
            if(adx!==2||ady!==2) return false;
            let mid=getPiece(piece.x+dx/2,piece.y+dy/2);
            if(mid) return false;
            if(piece.color==="black" && y>4) return false;
            if(piece.color==="red" && y<5) return false;
            return true;
        }
        case "車": {
            if(dx!==0 && dy!==0) return false;
            let stepX=dx===0?0:dx/Math.abs(dx);
            let stepY=dy===0?0:dy/Math.abs(dy);
            for(let i=1;i<Math.max(adx,ady);i++){
                if(getPiece(piece.x+i*stepX,piece.y+i*stepY)) return false;
            }
            return true;
        }
        case "砲": case "炮": {
            if(dx!==0 && dy!==0) return false;
            let stepX=dx===0?0:dx/Math.abs(dx);
            let stepY=dy===0?0:dy/Math.abs(dy);
            let count=0;
            for(let i=1;i<Math.max(adx,ady);i++){
                if(getPiece(piece.x+i*stepX,piece.y+i*stepY)) count++;
            }
            let target=getPiece(x,y);
            if(target){ return count===1; }
            else { return count===0; }
        }
        case "馬": {
            if(!((adx===1&&ady===2)||(adx===2&&ady===1))) return false;
            if(adx===2){
                let block=getPiece(piece.x+dx/2,piece.y);
                if(block) return false;
            } else {
                let block=getPiece(piece.x,piece.y+dy/2);
                if(block) return false;
            }
            return true;
        }
        case "卒": case "兵": {
            if(piece.color==="black"){
                if(y<piece.y) return false; 
                if(piece.y<=4){
                    return dx===0 && dy===1;
                } else {
                    return (dx===0&&dy===1)||(adx===1&&dy===0);
                }
            } else {
                if(y>piece.y) return false;
                if(piece.y>=5){
                    return dx===0 && dy===-1;
                } else {
                    return (dx===0&&dy===-1)||(adx===1&&dy===0);
                }
            }
        }
    }
    return false;
}

// --- Quản lý lượt ---
let selected=null;
let turn="red"; // đỏ đi trước

function updateTurnText() {
    let turnDiv = document.getElementById("turn");
    turnDiv.innerText = "Lượt: " + (turn==="red" ? "Đỏ" : "Đen");
    turnDiv.style.color = (turn==="red" ? "red" : "black");
}

canvas.addEventListener("click", e=>{
    const rect=canvas.getBoundingClientRect();
    const x=Math.floor((e.clientX-rect.left)/size);
    const y=Math.floor((e.clientY-rect.top)/size);

    if(selected){
        let target=getPiece(x,y);
        if(target && sameColor(selected,target)){
            selected=null; return;
        }
        if(isValidMove(selected,x,y)){
            if(target) pieces=pieces.filter(p=>p!==target);
            selected.x=x; selected.y=y;
            turn = (turn==="red" ? "black" : "red"); // đổi lượt
            updateTurnText();
        }
        selected=null;
        drawBoard(); drawPieces();
    } else {
        let p=getPiece(x,y);
        if(p && p.color===turn){ 
            selected=p;
        }
    }
});

// --- Khởi tạo ---
function init(){ 
    drawBoard(); 
    drawPieces(); 
    updateTurnText();
}
init();
