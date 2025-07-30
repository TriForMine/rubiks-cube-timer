import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const cardVariants = cva(
	"rounded-2xl border bg-card text-card-foreground transition-all duration-200",
	{
		variants: {
			variant: {
				default: "shadow-sm hover:shadow-md border-border/50",
				elevated: "shadow-lg hover:shadow-xl border-border/30",
				flat: "shadow-none border-border",
				glass:
					"bg-white/10 backdrop-blur-md border-white/20 shadow-lg dark:bg-black/10 dark:border-white/10",
				gradient: "bg-gradient-to-br from-card via-card to-muted/50 shadow-md hover:shadow-lg",
				interactive:
					"shadow-sm hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] cursor-pointer border-border/50 hover:border-border",
			},
			padding: {
				none: "p-0",
				sm: "p-4",
				default: "p-6",
				lg: "p-8",
				xl: "p-10",
			},
		},
		defaultVariants: {
			variant: "default",
			padding: "default",
		},
	}
);

interface CardProps
	extends React.HTMLAttributes<HTMLDivElement>,
		VariantProps<typeof cardVariants> {
	asChild?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
	({ className, variant, padding, asChild = false, ...props }, ref) => {
		const Comp = asChild ? "div" : "div";

		return (
			<Comp ref={ref} className={cn(cardVariants({ variant, padding, className }))} {...props} />
		);
	}
);
Card.displayName = "Card";

const cardHeaderVariants = cva("flex flex-col space-y-1.5", {
	variants: {
		padding: {
			none: "p-0",
			sm: "p-4 pb-2",
			default: "p-6 pb-4",
			lg: "p-8 pb-6",
			xl: "p-10 pb-8",
		},
	},
	defaultVariants: {
		padding: "default",
	},
});

interface CardHeaderProps
	extends React.HTMLAttributes<HTMLDivElement>,
		VariantProps<typeof cardHeaderVariants> {}

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
	({ className, padding, ...props }, ref) => (
		<div ref={ref} className={cn(cardHeaderVariants({ padding, className }))} {...props} />
	)
);
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement> & {
		level?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
	}
>(({ className, level = "h3", children, ...props }, ref) => {
	const Comp = level;
	return (
		<Comp
			ref={ref}
			className={cn(
				"font-semibold leading-none tracking-tight",
				{
					"text-2xl": level === "h1",
					"text-xl": level === "h2",
					"text-lg": level === "h3",
					"text-base": level === "h4",
					"text-sm": level === "h5",
					"text-xs": level === "h6",
				},
				className
			)}
			{...props}
		>
			{children}
		</Comp>
	);
});
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
	HTMLParagraphElement,
	React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
	<p
		ref={ref}
		className={cn("text-sm text-muted-foreground leading-relaxed", className)}
		{...props}
	/>
));
CardDescription.displayName = "CardDescription";

const cardContentVariants = cva("", {
	variants: {
		padding: {
			none: "p-0",
			sm: "p-4 pt-2",
			default: "p-6 pt-4",
			lg: "p-8 pt-6",
			xl: "p-10 pt-8",
		},
	},
	defaultVariants: {
		padding: "default",
	},
});

interface CardContentProps
	extends React.HTMLAttributes<HTMLDivElement>,
		VariantProps<typeof cardContentVariants> {}

const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
	({ className, padding, ...props }, ref) => (
		<div ref={ref} className={cn(cardContentVariants({ padding, className }))} {...props} />
	)
);
CardContent.displayName = "CardContent";

const cardFooterVariants = cva("flex items-center border-t bg-muted/30 rounded-b-2xl", {
	variants: {
		padding: {
			none: "p-0",
			sm: "p-4",
			default: "p-6",
			lg: "p-8",
			xl: "p-10",
		},
		variant: {
			default: "border-border/50",
			muted: "bg-muted/50 border-muted",
			accent: "bg-accent/50 border-accent",
			transparent: "bg-transparent border-transparent",
		},
	},
	defaultVariants: {
		padding: "default",
		variant: "default",
	},
});

interface CardFooterProps
	extends React.HTMLAttributes<HTMLDivElement>,
		VariantProps<typeof cardFooterVariants> {}

const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
	({ className, padding, variant, ...props }, ref) => (
		<div ref={ref} className={cn(cardFooterVariants({ padding, variant, className }))} {...props} />
	)
);
CardFooter.displayName = "CardFooter";

// Specialized Card Components
const GlassCard = React.forwardRef<HTMLDivElement, Omit<CardProps, "variant">>(
	({ className, ...props }, ref) => (
		<Card ref={ref} variant="glass" className={cn("backdrop-blur-lg", className)} {...props} />
	)
);
GlassCard.displayName = "GlassCard";

const InteractiveCard = React.forwardRef<
	HTMLDivElement,
	Omit<CardProps, "variant"> & {
		onClick?: () => void;
	}
>(({ className, onClick, ...props }, ref) => (
	<Card
		ref={ref}
		variant="interactive"
		className={cn(
			"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
			className
		)}
		onClick={onClick}
		onKeyDown={(e) => {
			if ((e.key === "Enter" || e.key === " ") && onClick) {
				e.preventDefault();
				onClick();
			}
		}}
		tabIndex={onClick ? 0 : undefined}
		role={onClick ? "button" : undefined}
		{...props}
	/>
));
InteractiveCard.displayName = "InteractiveCard";

const StatCard = React.forwardRef<
	HTMLDivElement,
	CardProps & {
		title: string;
		value: string | number;
		description?: string;
		icon?: React.ReactNode;
		trend?: "up" | "down" | "neutral";
		trendValue?: string;
	}
>(({ title, value, description, icon, trend, trendValue, className, ...props }, ref) => {
	const trendColor = {
		up: "text-green-600 dark:text-green-400",
		down: "text-red-600 dark:text-red-400",
		neutral: "text-muted-foreground",
	}[trend || "neutral"];

	return (
		<Card ref={ref} className={cn("relative overflow-hidden", className)} {...props}>
			<CardHeader className="pb-2">
				<div className="flex items-center justify-between">
					<CardTitle level="h6" className="text-muted-foreground font-medium">
						{title}
					</CardTitle>
					{icon && <div className="text-muted-foreground [&_svg]:size-4">{icon}</div>}
				</div>
			</CardHeader>
			<CardContent className="pt-0">
				<div className="flex items-baseline justify-between">
					<div className="text-3xl font-bold tabular-nums">{value}</div>
					{trend && trendValue && (
						<div className={cn("text-xs font-medium", trendColor)}>{trendValue}</div>
					)}
				</div>
				{description && <p className="text-xs text-muted-foreground mt-2">{description}</p>}
			</CardContent>

			{/* Subtle background gradient */}
			<div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
		</Card>
	);
});
StatCard.displayName = "StatCard";

export {
	Card,
	CardHeader,
	CardFooter,
	CardTitle,
	CardDescription,
	CardContent,
	GlassCard,
	InteractiveCard,
	StatCard,
	cardVariants,
	type CardProps,
};
