// Service Worker Registration Script
(() => {
	// Only register service worker in production or when explicitly enabled
	if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
		return;
	}

	// Wait for the page to load
	window.addEventListener("load", () => {
		navigator.serviceWorker
			.register("/sw.js", {
				scope: "/",
			})
			.then((registration) => {
				console.log("Service Worker registered successfully:", registration.scope);

				// Check for updates
				registration.addEventListener("updatefound", () => {
					const newWorker = registration.installing;
					if (newWorker) {
						newWorker.addEventListener("statechange", () => {
							if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
								// New content is available, refresh needed
								console.log("New content available, please refresh.");
							}
						});
					}
				});
			})
			.catch((error) => {
				console.log("Service Worker registration failed:", error);
			});

		// Listen for controlling service worker change
		navigator.serviceWorker.addEventListener("controllerchange", () => {
			// Service worker updated, reload the page
			window.location.reload();
		});
	});
})();
