// generateRubiksCubeIcons.js – v6
// -----------------------------------------------------------------------------
// Generates a solved Rubik’s cube icon set (white‑top / red‑front / green‑right)
// in a 30° isometric view and rasterises to PNG sizes + favicon.
// -----------------------------------------------------------------------------
const fs = require("node:fs");
const path = require("node:path");
const sharp = require("sharp");

// -----------------------------------------------------------------------------
// Projection helpers & constants
// -----------------------------------------------------------------------------
const CANVAS = 512;
const ICON_SIZES = [72, 96, 128, 144, 152, 192, 384, 512];

const COS = Math.cos(Math.PI / 6); // 0.866 025…
const SIN = Math.sin(Math.PI / 6); // 0.5
const CELL = 50; // one cubie edge in px

// World (x, y, z)  →  screen (sx, sy)
const project = ([x, y, z], [ox, oy]) => [
	ox + (x - z) * COS * CELL,
	oy + (x + z) * SIN * CELL + y * CELL,
];

// -----------------------------------------------------------------------------
// SVG generator
// -----------------------------------------------------------------------------
function generateCubeSVG() {
	// Centre cube in 512×512 art‑board
	const height = 6 * CELL;
	const ORIGIN = [CANVAS / 2, (CANVAS - height) / 2];

	// Face descriptors (draw farthest → nearest)
	const faces = [
		// ----------  TOP  --------------------------------------------------------
		{
			colour: "#ffffff", // white
			anchor: [0, 0, 0], // world (0,0,0) == front‑left‑top
			u: [1, 0, 0], // → +x
			v: [0, 0, 1], // ↓ +z  (away from viewer)
		},
		// ----------  RIGHT  ------------------------------------------------------
		{
			colour: "#009E60", // green (right)
			anchor: [3, 0, 0], // x = 3 plane  (front‑right‑top)
			u: [0, 0, 1], // → +z
			v: [0, 1, 0], // ↓ +y
		},
		// ----------  FRONT  ------------------------------------------------------
		{
			colour: "#FF5800", // orange (front)
			anchor: [0, 0, 3], // z = 0 plane
			u: [1, 0, 0], // → +x
			v: [0, 1, 0], // ↓ +y
		},
	];

	const stickers = [];

	for (const { colour, anchor, u, v } of faces) {
		for (let row = 0; row < 3; row++) {
			for (let col = 0; col < 3; col++) {
				// top‑left cubie corner in world coordinates
				const tl = [
					anchor[0] + col * u[0] + row * v[0],
					anchor[1] + col * u[1] + row * v[1],
					anchor[2] + col * u[2] + row * v[2],
				];

				// build quad corners
				const quad = [
					tl,
					[tl[0] + u[0], tl[1] + u[1], tl[2] + u[2]],
					[tl[0] + u[0] + v[0], tl[1] + u[1] + v[1], tl[2] + u[2] + v[2]],
					[tl[0] + v[0], tl[1] + v[1], tl[2] + v[2]],
				];

				const path = `${quad
					.map((p, i) => {
						const [sx, sy] = project(p, ORIGIN);
						return `${i ? "L" : "M"} ${sx.toFixed(1)},${sy.toFixed(1)}`;
					})
					.join(" ")} Z`;

				stickers.push({ path, colour });
			}
		}
	}

	// Cube silhouette outlines (helps crisp edges)
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
					const [sx, sy] = project(p, ORIGIN);
					return `${i ? "L" : "M"} ${sx.toFixed(1)},${sy.toFixed(1)}`;
				})
				.join(" ")} Z`;
			return `<path d="${d}" fill="none" stroke="#191919" stroke-width="5"/>`;
		})
		.join("\n  ");

	// subtle drop shadow
	const shadowY = ORIGIN[1] + height + 8;
	const shadowRX = 3 * COS * CELL * 0.9;

	// -------------------------------------------------------------------------
	return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${CANVAS}" height="${CANVAS}" viewBox="0 0 ${CANVAS} ${CANVAS}"
     xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" rx="80" fill="#1a1a1a"/>
  <ellipse cx="${CANVAS / 2}" cy="${shadowY}" rx="${shadowRX}" ry="22"
           fill="#000" opacity="0.35"/>

  ${stickers
		.map(
			({ path, colour }) => `<path d="${path}" fill="${colour}" stroke="#191919" stroke-width="2"/>`
		)
		.join("\n  ")}

  ${outlineSVG}
</svg>`;
}

// -----------------------------------------------------------------------------
// PNG rasteriser helper
// -----------------------------------------------------------------------------
async function toPng(size, svgBuf, dest) {
	await sharp(svgBuf)
		.resize(size, size, {
			fit: "contain",
			background: { r: 26, g: 26, b: 26, alpha: 1 },
			kernel: sharp.kernel.lanczos3,
		})
		.png({ quality: 95, compressionLevel: 6, adaptiveFiltering: true })
		.toFile(dest);
}

// -----------------------------------------------------------------------------
// Main – build full icon set
// -----------------------------------------------------------------------------
async function buildIcons() {
	const dir = path.join(__dirname, "public", "icons");
	fs.mkdirSync(dir, { recursive: true });

	const svg = generateCubeSVG();
	fs.writeFileSync(path.join(dir, "cube-icon.svg"), svg);
	console.log("✓ cube-icon.svg");

	for (const s of ICON_SIZES) {
		await toPng(s, Buffer.from(svg), path.join(dir, `icon-${s}x${s}.png`));
		console.log(`✓ icon-${s}x${s}.png`);
	}

	await toPng(32, Buffer.from(svg), path.join(__dirname, "public", "favicon.png"));
	await toPng(180, Buffer.from(svg), path.join(__dirname, "public", "apple-touch-icon.png"));

	console.log("\n🎉 Perfectly aligned cube: white‑top, red‑front, green‑right.");
}

buildIcons().catch((err) => {
	console.error(err);
	process.exit(1);
});
