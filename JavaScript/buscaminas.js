//Declaracion de variables globales

//El canvas sobre el que se dibujará el tablero
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
let board;

//Número de columnas y filas, se obtendrá de la configuración definida por el usuario.
let columns = localStorage.getItem("columns") || 10;
let rows = localStorage.getItem("rows") || 10;
let nMines = localStorage.getItem("nMines") || 10;


//Dimensiones de cada celda.
let cellWidth = canvas.width / columns;
let cellHeight = canvas.height / rows;

//Variables de control para victoria.
let clickedCells = 0;
let flagedMines = 0;
let flagedCells = 0;
let timer;
let elapsedTime = 0;
let time = localStorage.getItem("time") || 60;


//Declaración y carga de las imagenes.
const background = new Image();
background.src = "./JavaScript/imgs/cells/Minesweeper_unopened_square.png";
const flagImage = new Image();
flagImage.src = "./JavaScript/imgs/cells/1200px-Minesweeper_flag_generic.png";
const mineImage = new Image();
mineImage.src = "./JavaScript/imgs/cells/png-transparent-red-circle-minesweeper-minesweeper-deluxe-minesweeper-adfree-video-games-land-mine-naval-mine-android-thumbnail.png";
const adjacentMinesNumber = new Array(9).fill().map((item, index) => {
    const image = new Image();
    image.src = "./JavaScript/imgs/Numbers/Minesweeper_" + index + ".png";
    return image;
});


//Creación de la clase Cell, utilizada para definir todas las casillas del buscaminas de forma independiente.

class Cell {
    constructor() {
        this.isMine = false;
        this.clicked = false;
        this.flaged = false;
        this.adjacentMines = 0;
    }
}


//Declaración de funciones del juego.

function drawBoard() {
    //Función que dibuja el tablero del buscaminas con unas dimensiones de "rows" filas y "columns" columnas.
    for (let row = 0; row <= rows; row++) {
        for (let column = 0; column <= columns; column++) {
            const y = row * cellHeight;
            const x = column * cellWidth;
            ctx.drawImage(background, x, y, cellWidth, cellHeight);
        }
    }
}

function fillBoard() {
    //Se crea un array de las dimensiones del board.
    board = new Array(Number(columns)).fill().map(function () {
        return new Array(Number(rows)).fill().map(function () {
            return new Cell();
        });
    });

    //Se llena el array de n minas (dadas por dificultad) en posiciones aleatorias.
    let minesToPut = nMines;
    while (minesToPut > 0) {
        let x = Math.floor(Math.random() * rows);
        let y = Math.floor(Math.random() * columns);
        if (!board[x][y].isMine) {
            board[x][y].isMine = true;
            minesToPut--;
        }
    }
}

function checkAroundCells(row, col) {
    //Función encargada de comprobar las casillas alrededor de la clicada y obtener la cantidad de minas alrededor.
    let mines = 0;
    for (let i = row - 1; i <= row + 1; i++) {
        for (let j = col - 1; j <= col + 1; j++) {
            if (i >= 0 && i < board.length && j >= 0 && j < board[i].length) {
                if (board[i][j].isMine == true) {
                    mines++;
                }
            }
        }
    }
    //Se pinta el dibujo correspondiente a las minas encontradas y se guarda el valor.
    ctx.drawImage(adjacentMinesNumber[mines], col * cellHeight, row * cellHeight, cellWidth, cellHeight);
    board[row][col].adjacentMines = mines;
}

function spanCheckArroundCells(board, row, col) {
    //Función aplicada a las casillas que tienen 0 minas al rededor para expandiarse.
    for (let i = row - 1; i <= row + 1; i++) {
        for (let j = col - 1; j <= col + 1; j++) {
            if (i >= 0 && i < board.length && j >= 0 && j < board[i].length) {
                if (!board[i][j].isMine && !board[i][j].clicked) {
                    rightClickCell(board, i, j);
                }
            }
        }
    }
}

function rightClickCell(board, row, col) {
    //Función con los escenarios al hacer click derecho en una celda.
    board[row][col].clicked = true;
    clickedCells++;
    if (board[row][col].isMine) {
        //Si es mina se indica.
        if (board[row][col].flaged) {
            ctx.drawImage(flagImage, col * cellHeight, row * cellHeight, cellWidth, cellHeight);
        } else {
            ctx.drawImage(mineImage, col * cellHeight, row * cellHeight, cellWidth, cellHeight);
        }
    }
    else {
        //Si no es mina se revisan las casillas al rededor
        checkAroundCells(row, col);
        if (board[row][col].adjacentMines == 0) {
            //Si hay 0 minas al rededor se clican todas las casillas al rededor.
            spanCheckArroundCells(board, row, col);
        }
    }
}

function showAllCells(condition) {
    //En caso de finalziar partida (ya sea victoria o derrota) se destapa el tablero.
    for (let row = 0; row < rows; row++) {
        for (let column = 0; column < columns; column++) {
            if (!board[row][column].clicked) {
                board[row][column].clicked = true;
                clickedCells++;
                rightClickCell(board, row, column);
                if (condition == "win") {
                    if (board[row][column].isMine) {
                        ctx.drawImage(background, column * cellHeight, row * cellHeight, cellWidth, cellHeight);
                        ctx.drawImage(flagImage, column * cellHeight, row * cellHeight, cellWidth, cellHeight);
                    }
                }

            }
        }
    }
}

function gameTimer() {
    if (elapsedTime == 0) {
        let minutesLimit = Math.floor(time / 60);
        let secondsLimit = time - (minutesLimit * 60);
        if (minutesLimit < 10) {
            minutesLimit = "0" + minutesLimit;
        }
        if (secondsLimit < 10) {
            secondsLimit = "0" + secondsLimit;
        }
        document.getElementById("limiteTiempo").innerHTML = minutesLimit + ":" + secondsLimit;
    }
    if (elapsedTime != -1) {
        let minutes = Math.floor(elapsedTime / 60);
        let seconds = elapsedTime - (minutes * 60);
        if (minutes < 10) {
            minutes = "0" + minutes;
        }
        if (seconds < 10) {
            seconds = "0" + seconds;
        }
        document.getElementById("timer").innerHTML = minutes + ":" + seconds;
        elapsedTime++;
    }
    if (elapsedTime > time) {
        elapsedTime = -1;
        gameOver();
    }
}

function gameOver() {
    elapsedTime = -1;
    showAllCells("lose");
    document.getElementById("gameStatus").innerHTML = "DERROTA";
}

function win() {
    showAllCells("win");
    if (localStorage.getItem("modo") != "Personalizada") {
        checkRanking();
    }
    document.getElementById("gameStatus").innerHTML = "VICTORIA";
    elapsedTime = -1;
}

function startRanking() {
    localStorage.setItem("firstPlace", "Sin registro;0;3599");
    localStorage.setItem("secondPlace", "Sin registro;0;3599");
    localStorage.setItem("thirdPlace", "Sin registro;0;3599");
    localStorage.setItem("forthPlace", "Sin registro;0;3599");
    localStorage.setItem("fifthPlace", "Sin registro;0;3599");
}

function setRanking() {
    let firstPlace = localStorage.getItem("firstPlace").split(";");
    let secondPlace = localStorage.getItem("secondPlace").split(";");
    let thirdPlace = localStorage.getItem("thirdPlace").split(";");
    let forthPlace = localStorage.getItem("forthPlace").split(";");
    let fifthPlace = localStorage.getItem("fifthPlace").split(";");
    let topFive = [firstPlace, secondPlace, thirdPlace, forthPlace, fifthPlace];
    updateRanking(topFive);
}

function updateRanking(topFive) {
    document.getElementById("n1").innerHTML = topFive[0][0];
    document.getElementById("d1").innerHTML = getDif(topFive[0][1]);
    document.getElementById("t1").innerHTML = getTime(topFive[0][2]);
    localStorage.setItem("firstPlace", topFive[0][0] + ";" + topFive[0][1] + ";" + topFive[0][2]);

    document.getElementById("n2").innerHTML = topFive[1][0];
    document.getElementById("d2").innerHTML = getDif(topFive[1][1]);
    document.getElementById("t2").innerHTML = getTime(topFive[1][2]);
    localStorage.setItem("secondPlace", topFive[1][0] + ";" + topFive[1][1] + ";" + topFive[1][2]);

    document.getElementById("n3").innerHTML = topFive[2][0];
    document.getElementById("d3").innerHTML = getDif(topFive[2][1]);
    document.getElementById("t3").innerHTML = getTime(topFive[2][2]);
    localStorage.setItem("thirdPlace", topFive[2][0] + ";" + topFive[2][1] + ";" + topFive[2][2]);

    document.getElementById("n4").innerHTML = topFive[3][0];
    document.getElementById("d4").innerHTML = getDif(topFive[3][1]);
    document.getElementById("t4").innerHTML = getTime(topFive[3][2]);
    localStorage.setItem("forthPlace", topFive[3][0] + ";" + topFive[3][1] + ";" + topFive[3][2]);

    document.getElementById("n5").innerHTML = topFive[4][0];
    document.getElementById("d5").innerHTML = getDif(topFive[4][1]);
    document.getElementById("t5").innerHTML = getTime(topFive[4][2]);
    localStorage.setItem("fifthPlace", topFive[4][0] + ";" + topFive[4][1] + ";" + topFive[4][2]);
}

function getTime(time){
    let minutesLimit = Math.floor(time / 60);
    let secondsLimit = time - (minutesLimit * 60);
    if (minutesLimit < 10) {
        minutesLimit = "0" + minutesLimit;
    }
    if (secondsLimit < 10) {
        secondsLimit = "0" + secondsLimit;
    }
    return minutesLimit + ":" + secondsLimit;
}

function getDif(dif) {
    if (dif == "0") {
        return "Fácil";
    } else if (dif == "1") {
        return "Intermedio";
    } else if (dif == "2") {
        return "Difícil";
    } if (dif == "Fácil") {
        return "0";
    } else if (dif == "Intermedio") {
        return "1";
    } else if (dif == "Difícil") {
        return "2";
    }
    else return "error";
}


function checkRanking() {
    let firstPlace = localStorage.getItem("firstPlace").split(";");
    let secondPlace = localStorage.getItem("secondPlace").split(";");
    let thirdPlace = localStorage.getItem("thirdPlace").split(";");
    let forthPlace = localStorage.getItem("forthPlace").split(";");
    let fifthPlace = localStorage.getItem("fifthPlace").split(";");
    let candidate = [localStorage.getItem("name") || "Desconocido", getDif(localStorage.getItem("modo")), elapsedTime];
    let topFive = [firstPlace, secondPlace, thirdPlace, forthPlace, fifthPlace, candidate];

    topFiveByDif = topFive.sort(([a, b, c], [d, e, f]) => Number(e) - Number(b) || Number(c) - Number(f));

    updateRanking(topFive);

}

function saveName() {
    localStorage.setItem("name", document.getElementById("playerName").value);
}

canvas.addEventListener("mousedown", function (event) {
    const boundingRect = canvas.getBoundingClientRect();
    // Coordenadas "x" e "y" que indican donde ha clicado el usuario
    const x = event.clientX - boundingRect.left;
    const y = event.clientY - boundingRect.top;
    // Coordenadas "x" e "y" convertidas a columna y fila.
    const col = Math.floor(x / cellWidth);
    const row = Math.floor(y / cellHeight);
    if (!board[row][col].clicked) {
        if (event.button == 0) {
            rightClickCell(board, row, col);
            if (board[row][col].isMine) {
                gameOver();
                return;
            }
        } else if (event.button == 2) {
            board[row][col].flaged = !board[row][col].flaged;
            if (board[row][col].flaged) {
                if (board[row][col].isMine) {
                    flagedMines++;
                } else {
                    flagedCells++;
                }
                ctx.drawImage(flagImage, col * cellHeight, row * cellHeight, cellWidth, cellHeight);
            } else {
                if (board[row][col].isMine) {
                    flagedMines--;
                } else {
                    flagedCells--;
                }
                ctx.drawImage(background, col * cellHeight, row * cellHeight, cellWidth, cellHeight);
            }
        }
    }
    if ((nMines == ((columns * rows) - clickedCells)) || ((flagedMines == nMines) && (flagedCells == 0))) {
        win();
    }
});

canvas.addEventListener("contextmenu", function (event) {
    event.preventDefault();
})

function restartGame() {
    window.location.href = "/juego.html";
}

background.onload = function () {
    //Una vez cargadas las imagenes se le dice al html la dificultad actual para mostrarla.
    if (localStorage.getItem("modo") == null) {
        localStorage.setItem("modo", "Fácil");
    }
    document.getElementById("configuracionActual").innerHTML = "Dificultad: " + (localStorage.getItem("modo"));
    //Se dibuja el tablero con las dimensiones dadas por la dificultad.
    drawBoard();
    //Y se llena de las minas dadas por la dificultad.
    fillBoard();
    //En caso de estar el ranking vacio lo incia.
    if (localStorage.getItem("firstPlace") == null) {
        startRanking();
    }
    setRanking();
    //Se inicia el contador de tiempo;
    setInterval(gameTimer, 1000);
};