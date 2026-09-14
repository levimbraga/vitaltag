import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span
        aria-hidden
        className="flex h-[29px] w-10 items-center justify-center rounded-lg bg-primary text-lg font-bold text-primary-foreground"
      >
        V
      </span>
      <span className="text-2xl font-bold tracking-tight text-primary">VitalTag</span>
    </span>
  );
}
