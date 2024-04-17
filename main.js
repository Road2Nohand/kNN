/** @type {HTMLCanvasElement} */
const canvas = document.getElementById("2dPlot");

canvas.width = window.innerWidth * 0.6;
canvas.height = window.innerHeight * 0.6;

/** @type {CanvasRenderingContext2D} */
const ctx = canvas.getContext("2d");

mouseX = 0;
mouseY = 0;

// Metrics for scaling the data points
let xMax = -Infinity;
let yMax = -Infinity;
let xMin = Infinity;
let yMin = Infinity;
const xPadding = 80;
const yPadding = 80;

let data = [];
let dataParsed = [];



//#region Funktionen

function transformToCanvasCoords(x, y) {
    xRange = xMax - xMin;
    yRange = yMax - yMin;

    // Skaliere x und y unter Berücksichtigung des Paddings
    scaleX = (canvas.width - 2 * xPadding) / xRange;
    scaleY = (canvas.height - 2 * yPadding) / yRange;

    // Transformiere den Punkt (x, y)
    canvasX = (x - xMin) * scaleX + xPadding;
    canvasY = canvas.height - ((y - yMin) * scaleY + yPadding) // Y-Koordinate umkehren
    return { 
        "x": canvasX, 
        "y": canvasY 
    };
}

function transformToDataCoords(x, y) {
    xRange = xMax - xMin;
    yRange = yMax - yMin;

    // Skaliere x und y unter Berücksichtigung des Paddings
    scaleX = (canvas.width - 2 * xPadding) / xRange;
    scaleY = (canvas.height - 2 * yPadding) / yRange;

    // Transformiere den Punkt (x, y)
    dataX = (x - xPadding) / scaleX + xMin;
    dataY = (canvas.height - y - yPadding) / scaleY + yMin; // Y-Koordinate umkehren
    return { 
        "x": dataX, 
        "y": dataY 
    };
}


function drawMousePosition() {
    ctx.fillStyle = "white";
    ctx.font = "20px Consolas";

    // Transformiere die Mausposition in Datenkoordinaten
    dataCoords = transformToDataCoords(mouseX, mouseY);
    x = dataCoords.x;
    y = dataCoords.y;

    ctx.fillText(`(${x.toFixed(1)}, ${y.toFixed(1)})`, mouseX, mouseY - 10);
}


function drawPoint(x, y, label) {
    if (label) {
        if (label === "Adeliepinguin") {
            ctx.strokeStyle = '#ff8205'; // orange / "adelie"
        }
        if (label === "Eselspinguin") {
            ctx.strokeStyle = '#0e7475'; // blau / "gentoo"
        }
        if (label === "Zuegelpinguin") {
            ctx.strokeStyle = '#c45cc9'; // pink / "chinstrap"
        }

    } else {
        ctx.strokeStyle = 'red';
    }
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, 2 * Math.PI); // Kleine Punkte zeichnen
    ctx.stroke();
}


function processData(csvText) {
    try {
        data = csvText.split('\n')
            .slice(1).map(row => row.split(','))
            .filter(row => row[2] !== 'NULL' && row[3] !== 'NULL');
        console.log("penguin.csv geparsed:", data);
    } catch (error) {
        console.error("Error while parsing .csv:", error);
    }
    
    
    // Find the maximum values for x and y
    data.forEach(row => {
        x = parseFloat(row[2]);
        y = parseFloat(row[3]);
        xMax = Math.max(xMax, x);
        yMax = Math.max(yMax, y);
        xMin = Math.min(xMin, x);
        yMin = Math.min(yMin, y);
    });

    // print each row
    data.forEach(row => {
        x = parseFloat(row[2]);
        y = parseFloat(row[3]);
        canvasPoint  = transformToCanvasCoords(x, y);
        // extend object with string from row[1]
        canvasPoint.species = row[1];
        dataParsed.push(canvasPoint);
    });
}


function drawAxes() {
    ctx.fillStyle = 'white';
    ctx.font = "20px Consolas";
    const xText = 'Schnabellänge (mm)';
    const yText = 'Schnabelhöhe (mm)';
    const xTextWidth = ctx.measureText(xText).width;
    const yTextWidth = ctx.measureText(yText).width;
    ctx.fillText(xText, (canvas.width - xTextWidth) / 2, canvas.height - 15);
    ctx.save();
    ctx.translate(15, canvas.height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(yText, -yTextWidth / 2, 10);
    ctx.restore();
}

//#endregion Funktionen




//#region main

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    dataParsed.forEach(point => { drawPoint(point.x, point.y, point.species)}); // Draw the data points
    drawMousePosition();
    drawAxes();

    requestAnimationFrame(animate);
}


fetch("penguin.csv")
    .then(response => response.text())
    .then(csvText => {
        processData(csvText);
        console.log("Data parsed successfull");
    })
    .catch(error => {
        console.error("Error while parsing .csv:", error);
    });

animate();

//#endregion main





//#region EventListener

canvas.addEventListener("mousemove", e => {
    // Get the mouse position relative to the canvas
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
});


window.onresize = () => {
    canvas.width = window.innerWidth * 0.6;
    canvas.height = window.innerHeight * 0.6;

    // Re-scale the data points
    dataParsed = [];
    data.forEach(row => {
        x = parseFloat(row[2]);
        y = parseFloat(row[3]);
        canvasPoint  = transformToCanvasCoords(x, y);
        dataParsed.push(canvasPoint);
    });
};

//#endregion EventListener