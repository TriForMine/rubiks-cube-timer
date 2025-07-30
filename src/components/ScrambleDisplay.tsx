"use client";

import { Check, Copy, Eye, RefreshCw, Shuffle } from "lucide-react";
import { memo, useState } from "react";
import { ScrambleDialog } from "@/components/ScrambleDialog";
import { Button } from "@/components/ui/button";
import { generateScramble } from "@/lib/scramble";
import { cn } from "@/lib/utils";

interface ScrambleDisplayProps {
	scramble: string;
	onScrambleChange?: (newScramble: string) => void;
	scrambleLength?: number;
}

function ScrambleDisplayComponent({
	scramble,
	onScrambleChange,
	scrambleLength = 20,
}: ScrambleDisplayProps) {
	const [copied, setCopied] = useState(false);
	const [isGenerating, setIsGenerating] = useState(false);

	const handleNewScramble = async () => {
		setIsGenerating(true);
		// Add a small delay for visual feedback
		setTimeout(() => {
			const newScramble = generateScramble(scrambleLength);
			if (onScrambleChange) {
				onScrambleChange(newScramble);
			}
			setIsGenerating(false);
		}, 200);
	};

	const handleCopyScramble = async () => {
		try {
			await navigator.clipboard.writeText(scramble);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch (err) {
			console.error("Failed to copy scramble:", err);
		}
	};

	const scrambleMoves = scramble.split(" ");

	return (
		<div className="w-full bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-4 shadow-sm">
			<div className="flex items-center gap-4">
				{/* Icon and Label */}
				<div className="flex items-center gap-2 flex-shrink-0">
					<div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-lg border border-primary/20">
						<Shuffle className="w-4 h-4 text-primary" />
					</div>
				</div>

				{/* Scramble moves in a single line */}
				<div className="flex-1 min-w-0">
					<div className="flex flex-wrap items-center gap-1 font-mono text-sm font-bold">
						{scrambleMoves.map((move, index) => (
							<span
								key={`move-${index}-${move}`}
								className={cn(
									"px-2 py-2 bg-muted/50 rounded-md border transition-colors duration-200",
									"hover:bg-muted hover:border-border text-foreground",
									"min-w-[2x  rem] text-center"
								)}
							>
								{move}
							</span>
						))}
					</div>
				</div>

				{/* Action buttons */}
				<div className="flex items-center gap-2 flex-shrink-0">
					<ScrambleDialog scramble={scramble} onNewScramble={handleNewScramble}>
						<Button variant="ghost" size="sm" className="h-8 px-3 hover:bg-accent">
							<Eye className="w-3 h-3 mr-1" />
							<span className="text-xs">View</span>
						</Button>
					</ScrambleDialog>

					<Button
						variant="ghost"
						size="sm"
						onClick={handleCopyScramble}
						className={cn(
							"h-8 px-3 transition-all duration-200",
							copied
								? "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/50"
								: "hover:bg-accent"
						)}
					>
						{copied ? (
							<>
								<Check className="w-3 h-3 mr-1" />
								<span className="text-xs font-semibold">Copied</span>
							</>
						) : (
							<>
								<Copy className="w-3 h-3 mr-1" />
								<span className="text-xs">Copy</span>
							</>
						)}
					</Button>

					<Button
						variant="default"
						size="sm"
						onClick={handleNewScramble}
						disabled={isGenerating}
						className="h-8 px-3"
					>
						<RefreshCw
							className={cn(
								"w-3 h-3 mr-1 transition-transform duration-300",
								isGenerating ? "animate-spin" : "group-hover:rotate-180"
							)}
						/>
						<span className="text-xs font-semibold">{isGenerating ? "..." : "New"}</span>
					</Button>
				</div>
			</div>

			{/* Move count indicator with scramble source */}
			<div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
				<span>{scrambleMoves.length} moves • 3×3×3 Cube</span>
				<div className="flex items-center gap-1">
					<div className="w-1.5 h-1.5 rounded-full bg-green-500" />
					<span>Ready</span>
				</div>
			</div>
		</div>
	);
}

export const ScrambleDisplay = memo(ScrambleDisplayComponent);
