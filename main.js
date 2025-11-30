const canvas = document.getElementById("mainCanvas");
const ctx = canvas.getContext("2d");

const gravitySlider = document.getElementById("gravitySlider");
const gravityValue = document.getElementById("gravityValue");
const frequencySlider = document.getElementById("frequencySlider");
const frequencyValue = document.getElementById("frequencyValue");
const speedSlider = document.getElementById("speedSlider");
const speedValue = document.getElementById("speedValue");

let snowMax = 40;
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
	snowMax = parseFloat(freq);
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

	console.log(
		`Flakes: ${snow.length}, First flake pos: (${snow[0]?.x}, ${snow[0]?.y})`
	);
}

//===========
//  DRAWING
//===========

function updateCanvas() {
	const moveAngleSin = Math.sin(moveAngle);
	const moveAngleCos = Math.cos(moveAngle);
	const moveSpeed = Math.sqrt(gravity * gravity + windSpeed * windSpeed);

	updateSnow(moveSpeed, moveAngleCos, moveAngleSin);

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

	const deltaAccelerationX = moveAngleCos * moveSpeed * accelerationMulti;
	const deltaAccelerationY = moveAngleSin * moveSpeed * accelerationMulti;

	for (let flake of snow) {
		// replacements for the old dx/dy system, makes for more realistic flutter
		flake.velocityX += deltaAccelerationX;
		flake.velocityY += deltaAccelerationY;

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

		ctx.beginPath();
		ctx.moveTo(flake.x, flake.y);

		flake.x += flake.velocityX;
		flake.y += Math.max(-0.1, flake.velocityY);

		ctx.lineTo(flake.x, flake.y);
		ctx.stroke();

		ctx.globalAlpha = 1; // reset opacity for next flake

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

	ctx.stroke();
}

//=================
// SNOWFLAKE LOGIC
//=================

function updateSnow(moveSpeed, moveAngleCos, moveAngleSin) {
	snowThickness = (snowMax / 10) * moveSpeed * 2;

	if (snow.length < snowMax) {
		if (consoleLogs) {
			console.log(
				"made flake! snow.length, snowMax: ",
				snow.length,
				snowMax
			);
			consoleLogs -= 1;
		}
		for (let i = 0; i < Math.floor(snowThickness); i++) {
			createFlake(moveSpeed, moveAngleCos, moveAngleSin);
		}
		if (Math.random() < snowThickness - Math.floor(snowThickness)) {
			createFlake(moveSpeed, moveAngleCos, moveAngleSin);
		}
	}
	while (snow.length > snowMax) {
		snow.pop();
	}
}

function createFlake(moveSpeed, moveAngleCos, moveAngleSin) {
	const [x, y] = [
		Math.random() * canvas.width,
		Math.random() * canvas.height,
	];

	snow.push({
		x: x,
		y: y,

		velocityX: moveAngleCos * moveSpeed * 5,
		velocityY: moveAngleSin * moveSpeed * 5,

		flutterPhase: Math.random() * Math.PI * 2,
		flutterFrequency: Math.random() * 0.5 + 0.5,

		fadeGradient: 0,
	});
}
