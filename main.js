const canvas = document.getElementById("mainCanvas");
const ctx = canvas.getContext("2d");

const gravitySlider = document.getElementById("gravitySlider");
const gravityValue = document.getElementById("gravityValue");
const frequencySlider = document.getElementById("frequencySlider");
const frequencyValue = document.getElementById("frequencyValue");
const speedSlider = document.getElementById("speedSlider");
const speedValue = document.getElementById("speedValue");

let frequency = 40;
/*
unit is in percent chance per frame
for each 100% there is 1 guaranteed spawn/frame as well as the rest being a chance for an extra spawn
*/
let snowThickness = 40;
let windSpeed = 0.5;
let gravity = 0.5;

let moveAngle = Math.atan2(gravity, windSpeed);

let snow = [];

//================
// CANVAS RESIZING
//================

window.addEventListener("load", function () {
	requestAnimationFrame(resizeCanvas);
	loadSliders();
});

window.addEventListener("resize", resizeCanvas);

function resizeCanvas() {
	const area = canvas.getBoundingClientRect();
	canvas.width = area.width;
	canvas.height = area.height;
}

//===========
//  SLIDERS
//===========

gravitySlider.addEventListener("input", (e) => {
	const value = e.target.value;
	gravityValue.textContent = parseFloat(value).toFixed(1);
	gravity = parseFloat(value);
});

frequencySlider.addEventListener("input", (e) => {
	const freq = e.target.value;
	frequencyValue.textContent = parseFloat(freq).toFixed(1);
	frequency = parseFloat(freq);
});
speedSlider.addEventListener("input", (e) => {
	const spd = e.target.value;
	speedValue.textContent = parseFloat(spd).toFixed(2);
	windSpeed = parseFloat(spd);
});
function loadSliders() {
	for (let slider of document.querySelectorAll('input[type="range"]')) {
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
	const moveSpeed = Math.sqrt(gravity * gravity + windSpeed * windSpeed);

	updateSnow(moveSpeed);

	ctx.strokeStyle = "#f0f1e7";
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.beginPath();

	moveAngle = Math.atan2(gravity, windSpeed);

	for (let flake of snow) {
		const angleVariation = (Math.random() - 0.5) * 0.2;
		const dx = Math.cos(moveAngle + angleVariation);
		const dy = Math.sin(moveAngle + angleVariation);

		ctx.moveTo(flake.x, flake.y);

		flake.x += dx * (1 + flake.speed);
		flake.y += dy * (1 + flake.speed);

		ctx.lineTo(flake.x, flake.y);
	}

	ctx.stroke();
}

//=================
// SNOWFLAKE LOGIC
//=================

function updateSnow(moveSpeed) {
	snowThickness = (frequency / 100) * moveSpeed * 8;

	for (let i = 0; i < Math.floor(snowThickness); i++) {
		createFlake();
	}
	if (Math.random() < snowThickness - Math.floor(snowThickness)) {
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
		let elementaryPos = Math.random() * (canvas.width + canvas.height);
		if (elementaryPos > canvas.width) {
			if (moveAngle > Math.PI / 2) {
				return [canvas.width, elementaryPos - canvas.width];
			} else {
				return [0, elementaryPos - canvas.width];
			}
		} else {
			return [elementaryPos, 0];
			/*  all this basically makes sure that the little bit in the bottom corner 
                will be filled no matter how steep of a slope the movement is on
            */
		}
	};
	const [x, y] = pos();

	const spd = 0.1 + Math.random() * windSpeed * 2; // on average, spd = windSpeed

	snow.push({
		x: x,
		y: y,
		speed: spd, // px/frame
	});
}
