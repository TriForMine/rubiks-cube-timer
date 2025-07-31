import withSerwistInit from "@serwist/next";
import type { NextConfig } from "next";

// Only enable Serwist in production or when explicitly building
const isDev = process.env.NODE_ENV === "development";

const withSerwist = withSerwistInit({
	swSrc: "src/app/sw.ts",
	swDest: "public/sw.js",
	disable: isDev,
	scope: "/",
	swUrl: "/sw.js",
});

const nextConfig: NextConfig = {
	output: "export",

	experimental: {
		optimizePackageImports: ["lucide-react"],
	},

	// Turbopack configuration (moved from experimental)
	turbopack: {
		rules: {
			"*.svg": {
				loaders: ["@svgr/webpack"],
				as: "*.js",
			},
		},
	},

	images: {
		formats: ["image/webp", "image/avif"],
		unoptimized: true,
	},

	// Webpack configuration fallback
	webpack: (config, { dev, isServer }) => {
		// Skip webpack modifications in development with Turbopack
		if (dev && process.env.TURBOPACK) {
			return config;
		}

		// Enable WASM support only for client-side
		if (!isServer) {
			config.experiments = {
				...config.experiments,
				asyncWebAssembly: true,
			};

			// Handle WASM files
			config.module.rules.push({
				test: /\.wasm$/,
				type: "webassembly/async",
			});

			// Set target to support async/await for WASM
			config.target = ["web", "es2017"];
		}

		// Add fallbacks for Node.js modules
		config.resolve.fallback = {
			...config.resolve.fallback,
			fs: false,
			net: false,
			tls: false,
		};

		// Exclude WASM from server-side bundling
		if (isServer) {
			config.externals = config.externals || [];
			config.externals.push({
				"../../cube-wasm/pkg-bundler/cube_wasm": "commonjs ../../cube-wasm/pkg-bundler/cube_wasm",
			});
		}

		return config;
	},

	// Improve build performance
	eslint: {
		ignoreDuringBuilds: false,
	},

	typescript: {
		ignoreBuildErrors: false,
	},
};

export default withSerwist(nextConfig);
