import { ChevronDown } from "lucide-react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type PropriedadesCampoSelecao = React.ComponentProps<"select"> & {
  id: string;
  rotulo: string;
  erros?: string[];
};

// Uso o select nativo: no celular ele abre o seletor do próprio sistema.
export function CampoSelecao({ id, rotulo, erros, className, children, ...props }: PropriedadesCampoSelecao) {
  const erro = erros?.[0];

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id} className="text-[13px] font-normal text-muted-foreground">
        {rotulo}
      </Label>
      <div className="relative">
        <select
          id={id}
          name={id}
          aria-invalid={erro ? true : undefined}
          aria-describedby={erro ? `${id}-erro` : undefined}
          className={cn(
            "h-[49px] w-full appearance-none rounded-xl border border-input bg-card pr-10 pl-3.5 text-base outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20",
            className,
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown
          aria-hidden
          className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-muted-foreground"
        />
      </div>
      {erro && (
        <p id={`${id}-erro`} className="text-[13px] text-destructive">
          {erro}
        </p>
      )}
    </div>
  );
}
