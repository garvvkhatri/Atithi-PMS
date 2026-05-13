import { cn } from "../../lib/utils";

export function Button({ className, variant = "primary", size = "md", ...props }) {
  const variants = {
    primary: "bg-slate-950 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200",
    secondary: "bg-white/80 text-slate-900 ring-1 ring-slate-200 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-100 dark:ring-slate-800",
    ghost: "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800",
    danger: "bg-rose-600 text-white hover:bg-rose-700"
  };
  const sizes = {
    sm: "h-9 px-3 text-sm",
    md: "h-11 px-4 text-sm",
    lg: "h-12 px-5 text-base"
  };
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
}
