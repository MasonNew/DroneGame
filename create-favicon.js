const { createCanvas } = require('canvas');
const fs = require('fs');

// Create a 32x32 canvas for the favicon
const canvas = createCanvas(32, 32);
const ctx = canvas.getContext('2d');

// Set background to transparent
ctx.clearRect(0, 0, 32, 32);

// Draw crosshair
ctx.strokeStyle = '#ff0000';
ctx.lineWidth = 2;

// Draw circle
ctx.beginPath();
ctx.arc(16, 16, 12, 0, Math.PI * 2);
ctx.stroke();

// Draw cross
ctx.beginPath();
ctx.moveTo(16, 4);
ctx.lineTo(16, 28);
ctx.moveTo(4, 16);
ctx.lineTo(28, 16);
ctx.stroke();

// Save as PNG
const buffer = canvas.toBuffer('image/png');
fs.writeFileSync('public/crosshair.png', buffer); 