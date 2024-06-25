let canvas = document.getElementById("fsmCanvas");
let ctx = canvas.getContext("2d");

let nodes = [];
let edges = [];
let selectedNode = null;
let startNode = null;
let isDragging = false;
let isCreatingTransition = false;
let initialState = null;
let acceptingStates = new Set();

// Crear un nuevo estado al hacer doble clic
canvas.addEventListener("dblclick", (e) => {
    let nodeName = prompt("Nombre del estado:");
    if (nodeName) {
        let newNode = {
            x: e.offsetX,
            y: e.offsetY,
            name: nodeName,
            isAccepting: false
        };
        if (nodes.length === 0) {
            initialState = newNode; // Establecer el primer nodo como el estado inicial
        }
        nodes.push(newNode);
        draw();
    }
});

// Seleccionar un nodo al hacer clic
canvas.addEventListener("click", (e) => {
    if (!isDragging && !isCreatingTransition) {
        selectedNode = nodes.find(node => isInsideNode(e.offsetX, e.offsetY, node));
        draw();
    }
});

// Empezar a arrastrar al hacer mousedown
canvas.addEventListener("mousedown", (e) => {
    if (e.shiftKey) {
        startNode = nodes.find(node => isInsideNode(e.offsetX, e.offsetY, node));
        isCreatingTransition = true;
    } else {
        let node = nodes.find(node => isInsideNode(e.offsetX, e.offsetY, node));
        if (node) {
            isDragging = true;
            selectedNode = node;
            canvas.style.cursor = "grabbing";
        }
    }
});

// Detener el arrastre o la creación de transiciones al hacer mouseup
canvas.addEventListener("mouseup", (e) => {
    if (isCreatingTransition && startNode) {
        let endNode = nodes.find(node => isInsideNode(e.offsetX, e.offsetY, node));
        if (endNode) {
            let label = prompt("Nombre de la transición:");
            if (label) {
                let existingEdge = edges.find(edge => edge.from === startNode && edge.to === endNode && edge.label === label);
                if (!existingEdge) {
                    edges.push({ from: startNode, to: endNode, label: label });
                }
            }
        }
        isCreatingTransition = false;
        startNode = null;
        selectedNode = null; // Deseleccionar nodo
        draw();
    } else if (isDragging) {
        isDragging = false;
        canvas.style.cursor = "default";
    }
});

// Arrastrar nodo
canvas.addEventListener("mousemove", (e) => {
    if (isDragging && selectedNode && !e.shiftKey) {
        selectedNode.x = e.offsetX;
        selectedNode.y = e.offsetY;
        draw();
    }
});

// Eliminar nodo seleccionado al presionar Backspace
document.addEventListener("keydown", (e) => {
    if (e.key === "Backspace" && selectedNode) {
        nodes = nodes.filter(node => node !== selectedNode);
        edges = edges.filter(edge => edge.from !== selectedNode && edge.to !== selectedNode);
        if (selectedNode === initialState) {
            initialState = nodes.length > 0 ? nodes[0] : null;
        }
        selectedNode = null;
        draw();
    }
});

// Hacer clic derecho para cambiar el estado de aceptación
canvas.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    let node = nodes.find(node => isInsideNode(e.offsetX, e.offsetY, node));
    if (node) {
        node.isAccepting = !node.isAccepting;
        if (node.isAccepting) {
            acceptingStates.add(node);
        } else {
            acceptingStates.delete(node);
        }
        draw();
    }
});

// Comprobar si un punto está dentro de un nodo
function isInsideNode(x, y, node) {
    return Math.sqrt((x - node.x) ** 2 + (y - node.y) ** 2) < 20;
}

// Dibujar todo
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Dibujar aristas
    edges.forEach(edge => {
        ctx.beginPath();
        if (edge.from === edge.to) {
            // Auto-transición
            ctx.arc(edge.from.x, edge.from.y - 25, 15, 0, 2 * Math.PI);
            ctx.stroke();
            ctx.fillText(edge.label, edge.from.x, edge.from.y - 35);
        } else {
            ctx.moveTo(edge.from.x, edge.from.y);
            ctx.lineTo(edge.to.x, edge.to.y);
            ctx.stroke();
            ctx.fillText(edge.label, (edge.from.x + edge.to.x) / 2, (edge.from.y + edge.to.y) / 2);
        }
    });

    // Dibujar nodos
    nodes.forEach(node => {
        ctx.beginPath();
        ctx.arc(node.x, node.y, 20, 0, 2 * Math.PI);
        ctx.fillStyle = selectedNode === node ? "red" : "white";
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "black";
        ctx.fillText(node.name, node.x - 10, node.y + 5);
        if (node.isAccepting) {
            ctx.beginPath();
            ctx.arc(node.x, node.y, 15, 0, 2 * Math.PI);
            ctx.stroke();
        }
        if (node === initialState) {
            // Dibujar flecha indicadora del estado inicial
            ctx.beginPath();
            ctx.moveTo(node.x - 30, node.y);
            ctx.lineTo(node.x - 20, node.y - 10);
            ctx.lineTo(node.x - 20, node.y + 10);
            ctx.closePath();
            ctx.fill();
        }
    });
}

// Validar cadena
function validateString() {
    let inputString = document.getElementById("inputString").value;
    if (!initialState) {
        alert("Debe haber al menos un estado inicial.");
        return;
    }
    let currentState = initialState;
    let isValid = true;
    for (let i = 0; i < inputString.length; i++) {
        let transition = edges.find(edge => edge.from === currentState && edge.label === inputString[i]);
        if (transition) {
            currentState = transition.to;
        } else {
            isValid = false;
            break;
        }
    }
    if (!acceptingStates.has(currentState)) {
        isValid = false;
    }
    alert(isValid ? "Cadena válida" : "Cadena inválida");
}

// Resetear el diagrama
function resetDiagram() {
    nodes = [];
    edges = [];
    selectedNode = null;
    initialState = null;
    acceptingStates.clear();
    draw();
}
