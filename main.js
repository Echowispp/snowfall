let area = null;

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const moveAngle = 2;

function resizeCanvas() {
	canvas.width = area.width;
	canvas.height = area.height;
}

window.addEventListener("load", function () {
	area = canvas.getBoundingClientRect();
	requestAnimationFrame(resizeCanvas);
});

function animationLoop() {
	// keep the loop going
	requestAnimationFrame(animationLoop);

	// includes drawing flakes, making new ones and removing ones that are below the canvas
	updateCanvas();
}

// ================
// animationLoop(); // the loop kickstarter, highlighted with equals signs so I can comment it out for memory conservation (the test site is pretty hard to pause) and still easily uncomment it for testing
// ================

function updateCanvas() {
	// add drawing logic
}

function updateSnow() {
	let frequency = 0.4; // 0.1 = 10%

	if (Math.random() < frequency) {
		createFlake();
	}
	snow = snow.filter((flake) => flake.y > canvas.height);
}

function createFlake() {
	dir = Math.random() / 10 + moveAngle;
	pos = Math.random() * canvas.width;
	snow.push({
		x: pos,
		y: 0,
		direction: dir,
		speed: 0,
	});
}

snow = [];
