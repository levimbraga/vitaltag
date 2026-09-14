import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type PropriedadesCampo = React.ComponentProps<typeof Input> & {
  id: string;
  rotulo: string;
  erros?: string[];
  dica?: string;
};

export function Campo({ id, rotulo, erros, dica, className, ...props }: PropriedadesCampo) {
  const erro = erros?.[0];
  const idDescricao = erro ? `${id}-erro` : dica ? `${id}-dica` : undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id} className="text-[13px] font-normal text-muted-foreground">
        {rotulo}
      </Label>
      <Input
        id={id}
        name={id}
        aria-invalid={erro ? true : undefined}
        aria-describedby={idDescricao}
        className={cn("h-[46px] rounded-xl bg-card px-3.5 text-base md:text-base", className)}
        {...props}
      />
      {erro ? (
        <p id={`${id}-erro`} className="text-[13px] text-destructive">
          {erro}
        </p>
      ) : dica ? (
        <p id={`${id}-dica`} className="text-[13px] leading-snug text-muted-foreground">
          {dica}
        </p>
      ) : null}
    </div>
  );
}
