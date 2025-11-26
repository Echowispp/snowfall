let area = null;

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const moveAngle = 1;
let frequency = 40; // 0.1 = 10%
// I'll add a slider to change this later on

snow = [];

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
animationLoop(); // the loop kickstarter, highlighted with equals signs so I can comment it out for memory conservation (the test site is pretty hard to pause) and still easily uncomment it for testing
// ================

function updateCanvas() {
	updateSnow();

	const dx = Math.cos(moveAngle);
	const dy = Math.sin(moveAngle);
	ctx.strokeStyle = "#f0f1e7";

	ctx.clearRect(0, 0, canvas.width, canvas.height);

	for (flake of snow) {
		mvX = dx * flake.speed;
		mvY = dy * flake.speed;

		ctx.beginPath();
		ctx.moveTo(flake.x, flake.y);
		ctx.lineTo(flake.x + mvX, flake.y + mvY);
		ctx.stroke();

		flake.x += mvX;
		flake.y += mvY;
	}
}

function updateSnow() {
	if (Math.floor(Math.random(0, 100)) + 1 < frequency) {
		createFlake();
	}
	snow = snow.filter((flake) => {
		const inYArea = flake.y < canvas.height + 25;
		const inXArea = flake.x > -25 && flake.x < canvas.width + 25;

		return inYArea && inXArea;
	});
}

function createFlake() {
	const pos = () => {
		elementaryPos = Math.random() * (canvas.width + canvas.height);
		if (elementaryPos > canvas.width) {
			if (moveAngle > Math.PI) {
				return [canvas.width, elementaryPos - canvas.width];
			} else {
				return [0, elementaryPos - canvas.width];
			}
		} else {
			return [elementaryPos, 0];
		}
	};
	const [x, y] = pos();

	dir = Math.random() / 5 + moveAngle;
	spd = Math.random() * 0.5;
	snow.push({
		x: x,
		y: y,
		direction: dir,
		speed: spd, // px/frame
	});
}
