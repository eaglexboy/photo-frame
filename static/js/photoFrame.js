let gridAnimation,
    gridNum = 3,
    gridSize = [gridNum, gridNum], // number of cells in cols and rows
    gutter = 1, // in px
    container = getElements(".container")[0],
    boxes = [];

/**
 * This function will create the Photo Grid to show the media in the Frame
 */
function createGrid() {
    let grid = document.createElement("div"),
        cols = gridSize[0],
        rows = gridSize[1],
        numCells = cols * rows,
        box;

    grid.style.cssText = `grid-template-columns: repeat(${cols}, 1fr); grid-template-rows: repeat(${rows}, 1fr); grid-gap: ${gutter}px;`;
    grid.setAttribute("class", "grid");

    for (let i = 0; i < numCells; i++) {
        box = new Box({
            parent: grid,
        });
        boxes.push(box);
    }
    container.appendChild(grid);
}

function animateBoxes() {
    boxes.forEach((box) => box.startAnimation());
    gridAnimation = gsap.to(".grid", {
        duration: 36,
        rotateX: 2160,
        rotateY: 720,
        ease: "none",
        repeat: -1
    });
    setTimeout(() => (focusedBox = null), 5000);
}
onDocReady(() => {
    showLoadingDialog();
    createGrid();
    hideLoadingDialog();
    animateBoxes();
});
