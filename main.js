//=======================
// VARIABLES & CONSTANTS
//=======================

const canvas = document.getElementById("mainCanvas");
const ctx = canvas.getContext("2d");

const gravitySlider = document.getElementById("gravitySlider");
const gravityValue = document.getElementById("gravityValue");
const frequencySlider = document.getElementById("frequencySlider");
const frequencyValue = document.getElementById("frequencyValue");
const speedSlider = document.getElementById("speedSlider");
const speedValue = document.getElementById("speedValue");

let snowMax = 400;

/*
for each 100% there is 1 guaranteed spawn/frame as well as the rest being a chance for an extra spawn

the max amount of snowflakes is also capped to be equal to snowMax
*/

let snowFrequency = snowMax;
let windSpeed = 0.5;
let gravity = 0.5;

let moveAngle = Math.atan2(gravity, windSpeed);

let moveAngleSin = Math.sin(moveAngle);
let moveAngleCos = Math.cos(moveAngle);
let moveSpeed = Math.sqrt(gravity * gravity + windSpeed * windSpeed);

let snow = [];

//====================================
// CANVAS RESIZING & ONLOAD FUNCTIONS
//====================================

window.addEventListener("load", function () {
	resizeCanvas();
	loadSliders();

	// "kickstarts" the loop (see lines 101-106)
	animationLoop();
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
	if (gravity == 0) {
		gravity = 0.01;
	}
});
frequencySlider.addEventListener("input", (e) => {
	const value = e.target.value;
	frequencyValue.textContent = parseFloat(value).toFixed(1);
	snowMax = parseFloat(value);
});
speedSlider.addEventListener("input", (e) => {
	const spd = e.target.value;
	speedValue.textContent = parseFloat(spd).toFixed(2);
	windSpeed = parseFloat(spd);
	if (windSpeed == 0) {
		windSpeed = 0.01;
	}
});
function loadSliders() {
	// make the sliders listen for changes and update accordingly
	for (let slider of document.querySelectorAll('input[type="range"]')) {
		slider.addEventListener("input", (e) => {
			const slider = e.target;
			const percent =
				((slider.value - slider.min) / (slider.max - slider.min)) * 100;

			const gradient = `linear-gradient(to right, #222 ${percent}%, #777 ${percent}%)`;

			slider.style.background = gradient;
		});
	}

	// set up the sliders' initial highlighted area based on the default values
	document.querySelectorAll('input[type="range"]').forEach((slider) => {
		const percent =
			((slider.value - slider.min) / (slider.max - slider.min)) * 100;
		slider.style.background = `linear-gradient(to right, #222 ${percent}%, #777 ${percent}%)`;
	});
}

//===========
//  LOOPING
//===========

function animationLoop() {
	// keep the loop going
	requestAnimationFrame(animationLoop);

	updateCanvas();
}

//===========
//  DRAWING
//===========

function updateCanvas() {
	moveAngle = Math.atan2(gravity, windSpeed);

	moveAngleSin = Math.sin(moveAngle);
	moveAngleCos = Math.cos(moveAngle);
	moveSpeed = Math.sqrt(gravity * gravity + windSpeed * windSpeed);

	updateSnow();

	ctx.strokeStyle = "#f0f1e7";
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.beginPath();

	//======================
	// PHYSICS CALCULATIONS
	//======================

	// some constants to make the sim look better and more balanced
	const accelerationMulti = 0.1;
	const flutterStrength = 0.2;
	const dragCoefficient = 0.02;

	const deltaVelocityX = moveAngleCos * moveSpeed * accelerationMulti;
	const deltaVelocityY = moveAngleSin * moveSpeed * accelerationMulti;

	for (let flake of snow) {
		// replacements for the old dx/dy system, makes for more realistic flutter
		flake.velocityX += deltaVelocityX;
		flake.velocityY += deltaVelocityY;

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

		// logic for fading in
		if (flake.fadeGradient < 1) {
			flake.fadeGradient = Math.min(flake.fadeGradient + 0.01, 1);
		}
		ctx.globalAlpha = flake.fadeGradient;

		// occasional spirals to mimic real snowflakes
		let spiralX = 0;
		let spiralY = 0;

		if (flake.spiralTimer > 0) {
			flake.spiralPhase += 0.2;

			spiralY = flake.spiralRadius * Math.sin(flake.spiralPhase);
			if (moveAngle > Math.PI / 2) {
				spiralX = flake.spiralRadius * Math.cos(flake.spiralPhase);
			} else {
				// x is flipped so that the arc
				spiralX = -1 * flake.spiralRadius * Math.cos(flake.spiralPhase);
			}

			flake.spiralTimer -= 1;
		} else {
			if (Math.random() < 0.001) {
				flake.spiralTimer = 30;
				flake.spiralPhase = Math.random() * Math.PI * 2;
				flake.spiralRadius =
					(Math.random() * 3 + 2) / Math.max(3, moveSpeed / 5);
			}
		}

		//=========
		// DRAWING
		//=========

		ctx.beginPath();
		ctx.moveTo(flake.x, flake.y);

		flake.x += flake.velocityX + spiralX;
		flake.y += Math.max(-0.1, flake.velocityY) + spiralY;

		ctx.lineTo(flake.x, flake.y);
		ctx.stroke();

		ctx.globalAlpha = 1; // reset opacity for next flake

		// teleport flakes to the other side of the canvas
		if (flake.y > canvas.height) {
			flake.y = 0;
		}
		if (flake.x > canvas.width) {
			flake.x = 0;
		}
		if (flake.x < 0) {
			flake.x = canvas.width;
		}
	}
}

//=================
// SNOWFLAKE LOGIC
//=================

function updateSnow() {
	snowFrequency = (snowMax / 10) * moveSpeed * 2;

	if (snow.length < snowMax) {
		// create a flake for every 100% in snowFrequency
		for (let i = 0; i < Math.floor(snowFrequency); i++) {
			createFlake();
		}
		// then take the bit under 100% and take a chance at making another flake
		if (Math.random() < snowFrequency - Math.floor(snowFrequency)) {
			createFlake();
		}
	}

	// delete flakes over the total, when changing the value using the slider for example
	while (snow.length > snowMax) {
		snow.pop();
	}
}

function createFlake() {
	snow.push({
		// position
		x: Math.random() * canvas.width,
		y: Math.random() * canvas.height,

		// velocity
		velocityX: moveAngleCos * moveSpeed * 5,
		velocityY: moveAngleSin * moveSpeed * 5,

		// phase definition and frequency for the little pattern each of the flakes make
		flutterPhase: Math.random() * Math.PI * 2,
		flutterFrequency: Math.random() * 0.5 + 0.5,

		// length, phase definition and radius for the circular pattern the flakes occasionally do
		spiralTimer: 0,
		sprialPhase: 0,
		spiralRadius: 0,

		// gradient for the flake first spawning in, so it doesn't look like it appeared from thin air
		fadeGradient: 0,
	});
}
