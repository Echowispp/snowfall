let area = null;

const canvas = document.getElementById("mainCanvas");
const ctx = canvas.getContext("2d");

const angleSlider = document.getElementById("angleSlider");
const angleValue = document.getElementById("angleValue");
const frequencySlider = document.getElementById("frequencySlider");
const frequencyValue = document.getElementById("frequencyValue");
const speedSlider = document.getElementById("speedSlider");
const speedValue = document.getElementById("speedValue");

let moveAngle = 1;
let frequency = 40; //in percent
let speedMulti = 0.5;

snow = [];

//================
// CANVAS RESIZING
//================

window.addEventListener("load", function () {
	requestAnimationFrame(resizeCanvas);
	loadSliders();
});

window.addEventListener("resize", resizeCanvas);

function resizeCanvas() {
	area = canvas.getBoundingClientRect();
	canvas.width = area.width;
	canvas.height = area.height;
}

//===========
//  SLIDERS
//===========

angleSlider.addEventListener("input", (e) => {
	const degrees = e.target.value;
	angleValue.textContent = parseFloat(degrees).toFixed(1);
	moveAngle = degrees * (Math.PI / 180);
	console.log("moveAngle: ", moveAngle, moveAngle / Math.PI);
});
frequencySlider.addEventListener("input", (e) => {
	const freq = e.target.value;
	frequencyValue.textContent = parseFloat(freq).toFixed(1);
	frequency = freq;
});
speedSlider.addEventListener("input", (e) => {
	const spd = e.target.value;
	speedValue.textContent = parseFloat(spd).toFixed(2);
	speedMulti = spd;
});
function loadSliders() {
	for (slider of document.querySelectorAll('input[type="range"]')) {
		slider.addEventListener("input", (e) => {
			const slider = e.target;
			const percent =
				((slider.value - slider.min) / (slider.max - slider.min)) * 100;

			const gradient = `linear-gradient(to right, #222 ${percent}%, #777 ${percent}%)`;

			slider.style.background = gradient;
		});
	}

	document.querySelectorAll('input[type="range"]').forEach((slider) => {
		const percent =
			((slider.value - slider.min) / (slider.max - slider.min)) * 100;
		slider.style.background = `linear-gradient(to right, #222 ${percent}%, #777 ${percent}%)`;
	});
}
// =======================================
animationLoop(); // the loop 'kickstarter'
// =======================================

function animationLoop() {
	// keep the loop going
	requestAnimationFrame(animationLoop);

	// includes drawing flakes, making new ones and removing ones that are below the canvas
	updateCanvas();
}

//===========
//  DRAWING
//===========

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
		const inYArea = flake.y > -25 && flake.y < canvas.height + 25;
		const inXArea = flake.x > -25 && flake.x < canvas.width + 25;

		return inYArea && inXArea;
	});
}

function createFlake() {
	const pos = () => {
		elementaryPos = Math.random() * (canvas.width + canvas.height);
		if (elementaryPos > canvas.width) {
			if (moveAngle > Math.PI / 2) {
				return [canvas.width, elementaryPos - canvas.width];
			} else {
				return [0, elementaryPos - canvas.width];
			}
		} else {
			return [elementaryPos, 0];
			/*  all this basically makes sure that the little bit in the bottom corner 
                will be filled no matter the steepess of moveAngle
            */
		}
	};
	const [x, y] = pos();

	spd =
		/*() => {
		let elementrySpd = */ Math.random() * speedMulti; /*
		if (elementrySpd < 0.1) {
			return 0.1;
		} else {
			return elementrySpd;
		}
	};*/
	snow.push({
		x: x,
		y: y,
		speed: spd, // px/frame
	});
}
