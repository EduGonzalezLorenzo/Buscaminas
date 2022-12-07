function getPredConfig() {
    let dif = document.getElementById("dificultad").value;
    localStorage.setItem("modo", dif);
    if (dif == 'Fácil') {
        localStorage.setItem("columns", 10);
        localStorage.setItem("rows", 10);
        localStorage.setItem("nMines", 10);
        localStorage.setItem("time", 60);
    } else if (document.getElementById("dificultad").value == 'Intermedio') {
        localStorage.setItem("columns", 15);
        localStorage.setItem("rows", 15);
        localStorage.setItem("nMines",45 );
        localStorage.setItem("time", 90);
    } else if (document.getElementById("dificultad").value == 'Difícil') {
        localStorage.setItem("columns", 20);
        localStorage.setItem("rows", 20);
        localStorage.setItem("nMines", 132);
        localStorage.setItem("time", 120);
    }
}

function getConfig() {
    let size =  document.getElementById("columns").value;
    let nMines = document.getElementById("nMines").value;
    if (nMines > (size * size)){
        nMines = (size * size) -1;
    }
    localStorage.setItem("modo", "Personalizada");
    localStorage.setItem("columns",size);
    localStorage.setItem("rows", size);
    localStorage.setItem("nMines", nMines);
    localStorage.setItem("time", document.getElementById("time").value);
}