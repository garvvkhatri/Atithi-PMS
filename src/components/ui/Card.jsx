import { cn } from "../../lib/utils";

export function Card({ className, ...props }) {
  return <div className={cn("rounded-lg border border-slate-200/80 bg-white/85 shadow-premium backdrop-blur dark:border-slate-800 dark:bg-slate-950/75", className)} {...props} />;
}

export function CardHeader({ className, ...props }) {
  return <div className={cn("flex items-start justify-between gap-4 p-5", className)} {...props} />;
}

export function CardContent({ className, ...props }) {
  return <div className={cn("p-5 pt-0", className)} {...props} />;
}
