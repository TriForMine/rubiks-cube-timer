import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
	"inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background relative overflow-hidden group cursor-pointer disabled:cursor-not-allowed touch-manipulation select-none",
	{
		variants: {
			variant: {
				default:
					"bg-primary text-primary-foreground shadow-md hover:shadow-lg hover:shadow-primary/25 hover:bg-primary/90 active:scale-95 before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/20 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity",
				destructive:
					"bg-destructive text-destructive-foreground shadow-md hover:shadow-lg hover:shadow-destructive/25 hover:bg-destructive/90 active:scale-95 before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/20 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity",
				outline:
					"border-2 border-border bg-background shadow-sm hover:shadow-md hover:bg-accent hover:text-accent-foreground hover:border-accent-foreground/20 active:scale-95 backdrop-blur-sm",
				secondary:
					"bg-secondary text-secondary-foreground shadow-sm hover:shadow-md hover:bg-secondary/80 active:scale-95 before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/10 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity",
				ghost:
					"hover:bg-accent hover:text-accent-foreground active:scale-95 hover:shadow-sm rounded-lg",
				link: "text-primary underline-offset-4 hover:underline hover:text-primary/80 active:scale-95",
				gradient:
					"bg-gradient-to-r from-primary via-primary/90 to-primary/80 text-primary-foreground shadow-lg hover:shadow-xl hover:shadow-primary/30 hover:from-primary/90 hover:via-primary/80 hover:to-primary/70 active:scale-95 before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/25 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity",
				glass:
					"bg-white/10 backdrop-blur-md border border-white/20 text-foreground shadow-lg hover:bg-white/20 hover:shadow-xl active:scale-95 dark:bg-black/10 dark:border-white/10 dark:hover:bg-black/20",
				success:
					"bg-green-600 text-white shadow-md hover:shadow-lg hover:shadow-green-600/25 hover:bg-green-500 active:scale-95 before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/20 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity",
				warning:
					"bg-amber-500 text-white shadow-md hover:shadow-lg hover:shadow-amber-500/25 hover:bg-amber-400 active:scale-95 before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/20 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity",
				info: "bg-blue-600 text-white shadow-md hover:shadow-lg hover:shadow-blue-600/25 hover:bg-blue-500 active:scale-95 before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/20 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity",
			},
			size: {
				default: "h-10 px-6 py-2 text-sm",
				sm: "h-8 rounded-lg px-4 text-xs",
				lg: "h-12 rounded-xl px-8 text-base font-semibold",
				xl: "h-14 rounded-2xl px-10 text-lg font-semibold",
				icon: "size-10 rounded-xl",
				"icon-sm": "size-8 rounded-lg",
				"icon-lg": "size-12 rounded-xl",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	}
);

interface ButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement>,
		VariantProps<typeof buttonVariants> {
	asChild?: boolean;
	loading?: boolean;
	leftIcon?: React.ReactNode;
	rightIcon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	(
		{
			className,
			variant,
			size,
			asChild = false,
			loading = false,
			leftIcon,
			rightIcon,
			children,
			disabled,
			...props
		},
		ref
	) => {
		const Comp = asChild ? Slot : "button";
		const isDisabled = disabled || loading;

		return (
			<Comp
				className={cn(buttonVariants({ variant, size, className }))}
				ref={ref}
				disabled={isDisabled}
				aria-disabled={isDisabled}
				data-loading={loading}
				style={{ WebkitTapHighlightColor: "transparent", ...props.style }}
				onTouchStart={() => {}} // Enable mobile hover states
				{...props}
			>
				{loading && (
					<div className="absolute inset-0 flex items-center justify-center">
						<div className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
					</div>
				)}

				<div className={cn("flex items-center gap-2 transition-opacity", loading && "opacity-0")}>
					{leftIcon && <span className="shrink-0 [&_svg]:size-4">{leftIcon}</span>}

					{children}

					{rightIcon && <span className="shrink-0 [&_svg]:size-4">{rightIcon}</span>}
				</div>

				{/* Ripple effect */}
				<span className="absolute inset-0 overflow-hidden rounded-[inherit]">
					<span className="absolute inset-0 rounded-[inherit] bg-white/20 scale-0 group-active:scale-100 transition-transform duration-300 ease-out" />
				</span>
			</Comp>
		);
	}
);
Button.displayName = "Button";

export { Button, buttonVariants, type ButtonProps };
