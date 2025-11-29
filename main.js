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

let consoleLogs = 1000;

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

	//======================
	// PHYSICS CALCULATIONS
	//======================

	moveAngle = Math.atan2(gravity, windSpeed);

	const accelerationMulti = 0.1;
	const flutterStrength = 0.2;
	const dragCoefficient = 0.02;

	for (let flake of snow) {
		// replacements for the old dx/dy system, makes for more realistic flutter
		flake.velocityX += Math.cos(moveAngle) * moveSpeed * accelerationMulti;
		flake.velocityY += Math.sin(moveAngle) * moveSpeed * accelerationMulti;

		// drag, basically stops infinite acceleration which would otherwise happen with this model
		const speed = Math.sqrt(flake.velocityX ** 2 + flake.velocityY ** 2);
		const drag = 1 - dragCoefficient * speed;

		flake.velocityX *= Math.max(0, drag);
		flake.velocityY *= Math.max(0, drag);

		// little flutter to make the snowflakes look lighter
		flake.flutterPhase += flake.flutterFrequency * 0.1;
		const flutterOffset = Math.sin(flake.flutterPhase) * 0.3;
		const flutterAngle = moveAngle + flutterOffset;

		flake.velocityX += Math.cos(flutterAngle) * flutterStrength;
		flake.velocityY += Math.sin(flutterAngle) * flutterStrength;

		ctx.moveTo(flake.x, flake.y);

		flake.x += flake.velocityX;
		flake.y += Math.max(-0.1, flake.velocityY);

		ctx.lineTo(flake.x, flake.y);

		if (consoleLogs) {
			console.log(
				`Flake at (${flake.x}, ${flake.y}), vel: (${flake.velocityX}, ${flake.velocityY})`
			);
			console.log(
				`accelerationMulti: ${accelerationMulti}, flutterStrength: ${flutterStrength}`
			);
			consoleLogs -= 1;
		}
	}

	ctx.stroke();
}

//=================
// SNOWFLAKE LOGIC
//=================

function updateSnow(moveSpeed) {
	snowThickness = (frequency / 100) * moveSpeed * 2;

	if (consoleLogs) {
		console.log("snowThickness: ", snowThickness);
	}
	for (let i = 0; i < Math.floor(snowThickness); i++) {
		createFlake(moveSpeed);
	}
	if (Math.random() < snowThickness - Math.floor(snowThickness)) {
		createFlake(moveSpeed);
	}

	snow = snow.filter((flake) => {
		const inYArea = flake.y > -25 && flake.y < canvas.height + 25;
		const inXArea = flake.x > -25 && flake.x < canvas.width + 25;

		return inYArea && inXArea;
	});
}

function createFlake(moveSpeed) {
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

	snow.push({
		x: x,
		y: y,
		velocityX: Math.cos(moveAngle) * moveSpeed * 5,
		velocityY: Math.sin(moveAngle) * moveSpeed * 5,
		flutterPhase: Math.random() * Math.PI * 2,
		flutterFrequency: Math.random() * 0.5 + 0.5,
	});
}
