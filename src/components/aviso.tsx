import { cn } from "@/lib/utils";

const TONS = {
  info: "bg-secondary text-muted-foreground",
  sucesso: "border border-emerald-200 bg-emerald-50 text-emerald-800",
  erro: "border border-destructive/25 bg-emergencia-suave text-destructive",
} as const;

export function Aviso({
  tom = "info",
  children,
  className,
}: {
  tom?: keyof typeof TONS;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      role={tom === "erro" ? "alert" : "status"}
      className={cn("rounded-xl px-4 py-3.5 text-sm leading-relaxed", TONS[tom], className)}
    >
      {children}
    </div>
  );
}
