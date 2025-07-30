// generate-og-image.js
// -----------------------------------------------------------------------------
// Generates an OG image (1200x630) for social media sharing
// Inspired by the Rubik's cube icon design with isometric cube and branding
// -----------------------------------------------------------------------------
const fs = require("node:fs");
const path = require("node:path");
const sharp = require("sharp");

// -----------------------------------------------------------------------------
// Constants & Configuration
// -----------------------------------------------------------------------------
const OG_WIDTH = 1200;
const OG_HEIGHT = 630;
const CUBE_SIZE = 180; // Larger cube for OG image

const COS = Math.cos(Math.PI / 6); // 0.866
const SIN = Math.sin(Math.PI / 6); // 0.5
const CELL = CUBE_SIZE / 6; // Scale cube size

// Project 3D world coordinates to 2D screen coordinates
const project = ([x, y, z], [ox, oy]) => [
	ox + (x - z) * COS * CELL,
	oy + (x + z) * SIN * CELL + y * CELL,
];

// -----------------------------------------------------------------------------
// SVG OG Image Generator
// -----------------------------------------------------------------------------
function generateOGImageSVG() {
	// Position cube in the left side of the OG image
	const cubeHeight = 6 * CELL;
	const cubeOrigin = [200, (OG_HEIGHT - cubeHeight) / 2];

	// Define cube faces (same as icon: white top, orange front, green right)
	const faces = [
		{
			colour: "#ffffff", // white top
			anchor: [0, 0, 0],
			u: [1, 0, 0],
			v: [0, 0, 1],
		},
		{
			colour: "#009E60", // green right
			anchor: [3, 0, 0],
			u: [0, 0, 1],
			v: [0, 1, 0],
		},
		{
			colour: "#FF5800", // orange front
			anchor: [0, 0, 3],
			u: [1, 0, 0],
			v: [0, 1, 0],
		},
	];

	const stickers = [];

	// Generate cube stickers
	for (const { colour, anchor, u, v } of faces) {
		for (let row = 0; row < 3; row++) {
			for (let col = 0; col < 3; col++) {
				const tl = [
					anchor[0] + col * u[0] + row * v[0],
					anchor[1] + col * u[1] + row * v[1],
					anchor[2] + col * u[2] + row * v[2],
				];

				const quad = [
					tl,
					[tl[0] + u[0], tl[1] + u[1], tl[2] + u[2]],
					[tl[0] + u[0] + v[0], tl[1] + u[1] + v[1], tl[2] + u[2] + v[2]],
					[tl[0] + v[0], tl[1] + v[1], tl[2] + v[2]],
				];

				const path = `${quad
					.map((p, i) => {
						const [sx, sy] = project(p, cubeOrigin);
						return `${i ? "L" : "M"} ${sx.toFixed(1)},${sy.toFixed(1)}`;
					})
					.join(" ")} Z`;

				stickers.push({ path, colour });
			}
		}
	}

	// Cube outlines for crisp edges
	const outlines = {
		front: [
			[0, 0, 3],
			[3, 0, 3],
			[3, 3, 3],
			[0, 3, 3],
		],
		right: [
			[3, 0, 0],
			[3, 0, 3],
			[3, 3, 3],
			[3, 3, 0],
		],
		top: [
			[0, 0, 0],
			[3, 0, 0],
			[3, 0, 3],
			[0, 0, 3],
		],
	};

	const outlineSVG = Object.values(outlines)
		.map((poly) => {
			const d = `${poly
				.map((p, i) => {
					const [sx, sy] = project(p, cubeOrigin);
					return `${i ? "L" : "M"} ${sx.toFixed(1)},${sy.toFixed(1)}`;
				})
				.join(" ")} Z`;
			return `<path d="${d}" fill="none" stroke="#191919" stroke-width="3"/>`;
		})
		.join("\n  ");

	// Drop shadow for the cube
	const shadowY = cubeOrigin[1] + cubeHeight + 12;
	const shadowRX = 3 * COS * CELL * 0.9;

	// Text content positioning
	const textX = 350;
	const titleY = 200;
	const subtitleY = 280;
	const featuresY = 360;

	return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${OG_WIDTH}" height="${OG_HEIGHT}" viewBox="0 0 ${OG_WIDTH} ${OG_HEIGHT}"
     xmlns="http://www.w3.org/2000/svg">

  <!-- Background gradient -->
  <defs>
    <radialGradient id="bgGradient" cx="25%" cy="25%" r="75%">
      <stop offset="0%" style="stop-color:#1e40af;stop-opacity:0.8"/>
      <stop offset="100%" style="stop-color:#0f0f23;stop-opacity:1"/>
    </radialGradient>
    <radialGradient id="accentGradient" cx="75%" cy="75%" r="50%">
      <stop offset="0%" style="stop-color:#dc2626;stop-opacity:0.6"/>
      <stop offset="100%" style="stop-color:#0f0f23;stop-opacity:0"/>
    </radialGradient>
    <linearGradient id="titleGradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#3b82f6"/>
      <stop offset="100%" style="stop-color:#ef4444"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="100%" height="100%" fill="#0f0f23"/>
  <rect width="100%" height="100%" fill="url(#bgGradient)"/>
  <rect width="100%" height="100%" fill="url(#accentGradient)"/>

  <!-- Grid pattern overlay -->
  <defs>
    <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
      <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="url(#grid)" opacity="0.3"/>

  <!-- Cube shadow -->
  <ellipse cx="${cubeOrigin[0] + 1.5 * COS * CELL}" cy="${shadowY}"
           rx="${shadowRX}" ry="18" fill="#000" opacity="0.4"/>

  <!-- Cube stickers -->
  ${stickers
		.map(
			({ path, colour }) => `<path d="${path}" fill="${colour}" stroke="#191919" stroke-width="2"/>`
		)
		.join("\n  ")}

  <!-- Cube outlines -->
  ${outlineSVG}

  <!-- Main title -->
  <text x="${textX}" y="${titleY}" font-family="system-ui, -apple-system, sans-serif"
        font-size="72" font-weight="bold" fill="url(#titleGradient)">
    Rubik's Cube Timer
  </text>

  <!-- Subtitle -->
  <text x="${textX}" y="${subtitleY}" font-family="system-ui, -apple-system, sans-serif"
        font-size="32" font-weight="500" fill="#94a3b8">
    Professional Speedcubing Timer
  </text>

  <!-- Feature badges -->
  <g transform="translate(${textX}, ${featuresY})">
    <!-- Statistics badge -->
    <rect x="0" y="0" width="140" height="40" rx="20" fill="rgba(59, 130, 246, 0.2)"
          stroke="rgba(59, 130, 246, 0.3)" stroke-width="1"/>
    <text x="70" y="26" font-family="system-ui, -apple-system, sans-serif"
          font-size="16" font-weight="500" fill="#93c5fd" text-anchor="middle">
      Statistics
    </text>

    <!-- Analytics badge -->
    <rect x="160" y="0" width="120" height="40" rx="20" fill="rgba(59, 130, 246, 0.2)"
          stroke="rgba(59, 130, 246, 0.3)" stroke-width="1"/>
    <text x="220" y="26" font-family="system-ui, -apple-system, sans-serif"
          font-size="16" font-weight="500" fill="#93c5fd" text-anchor="middle">
      Analytics
    </text>

    <!-- Offline badge -->
    <rect x="300" y="0" width="180" height="40" rx="20" fill="rgba(59, 130, 246, 0.2)"
          stroke="rgba(59, 130, 246, 0.3)" stroke-width="1"/>
    <text x="390" y="26" font-family="system-ui, -apple-system, sans-serif"
          font-size="16" font-weight="500" fill="#93c5fd" text-anchor="middle">
      Offline Support
    </text>
  </g>

  <!-- Domain/URL -->
  <text x="${OG_WIDTH - 40}" y="${OG_HEIGHT - 30}" font-family="system-ui, -apple-system, sans-serif"
        font-size="18" font-weight="500" fill="#64748b" text-anchor="end">
    rubikscubetimer.triformine.dev
  </text>

  <!-- Subtle accent elements -->
  <circle cx="1050" cy="150" r="100" fill="rgba(59, 130, 246, 0.1)"/>
  <circle cx="950" cy="480" r="80" fill="rgba(239, 68, 68, 0.1)"/>

</svg>`;
}

// -----------------------------------------------------------------------------
// Generate and save OG image
// -----------------------------------------------------------------------------
async function generateOGImage() {
	const svg = generateOGImageSVG();

	// Save SVG version
	const svgPath = path.join(__dirname, "public", "og-image.svg");
	fs.writeFileSync(svgPath, svg);
	console.log("✓ og-image.svg generated");

	// Generate PNG version
	const pngPath = path.join(__dirname, "public", "og-image.png");
	await sharp(Buffer.from(svg)).png({ quality: 95, compressionLevel: 6 }).toFile(pngPath);
	console.log("✓ og-image.png generated");

	// Generate WebP version for better compression
	const webpPath = path.join(__dirname, "public", "og-image.webp");
	await sharp(Buffer.from(svg)).webp({ quality: 90 }).toFile(webpPath);
	console.log("✓ og-image.webp generated");

	console.log("\n🎉 OG image generated successfully!");
	console.log(`   Dimensions: ${OG_WIDTH}x${OG_HEIGHT}`);
	console.log("   Perfect for social media sharing!");
}

// Run the generator
generateOGImage().catch((err) => {
	console.error("Error generating OG image:", err);
	process.exit(1);
});
