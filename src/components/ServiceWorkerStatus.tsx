"use client";

import { RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";

interface ServiceWorkerState {
	isUpdateAvailable: boolean;
	isUpdating: boolean;
}

export function ServiceWorkerStatus() {
	const [state, setState] = useState<ServiceWorkerState>({
		isUpdateAvailable: false,
		isUpdating: false,
	});

	useEffect(() => {
		// Check for service worker updates
		if ("serviceWorker" in navigator) {
			navigator.serviceWorker.addEventListener("controllerchange", () => {
				// Service worker updated
				setState((prev) => ({
					...prev,
					isUpdateAvailable: false,
					isUpdating: false,
				}));
			});

			// Check for waiting service worker
			navigator.serviceWorker.ready.then((registration) => {
				if (registration.waiting) {
					setState((prev) => ({ ...prev, isUpdateAvailable: true }));
				}

				registration.addEventListener("updatefound", () => {
					const newWorker = registration.installing;
					if (newWorker) {
						newWorker.addEventListener("statechange", () => {
							if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
								setState((prev) => ({ ...prev, isUpdateAvailable: true }));
							}
						});
					}
				});
			});
		}

		return () => {};
	}, []);

	const handleUpdate = async () => {
		if (!("serviceWorker" in navigator)) return;

		setState((prev) => ({ ...prev, isUpdating: true }));

		try {
			const registration = await navigator.serviceWorker.ready;
			if (registration.waiting) {
				registration.waiting.postMessage({ type: "SKIP_WAITING" });
			}
		} catch (error) {
			console.error("Error updating service worker:", error);
			setState((prev) => ({ ...prev, isUpdating: false }));
		}
	};

	return (
		<>
			{/* Update available banner */}
			{state.isUpdateAvailable && (
				<div className="fixed top-20 right-4 z-50">
					<div className="bg-primary/90 backdrop-blur-sm text-primary-foreground px-3 py-2 rounded-md shadow-lg flex items-center gap-2">
						<RefreshCw className={`h-4 w-4 ${state.isUpdating ? "animate-spin" : ""}`} />
						<span className="text-sm font-medium">
							{state.isUpdating ? "Updating..." : "Update available"}
						</span>
						{!state.isUpdating && (
							<button
								type="button"
								onClick={handleUpdate}
								className="ml-2 px-2 py-1 bg-primary-foreground/20 hover:bg-primary-foreground/30 rounded text-xs font-medium transition-colors"
							>
								Update
							</button>
						)}
					</div>
				</div>
			)}
		</>
	);
}
