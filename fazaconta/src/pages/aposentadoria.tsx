import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ResultBox } from "@/components/result-box";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PiggyBank } from "lucide-react";

const formSchema = z.object({
  idade: z.coerce.number({ invalid_type_error: "Insira sua idade" }).min(16, "Idade inválida").max(100, "Idade inválida"),
  contribuicao: z.coerce.number({ invalid_type_error: "Insira o tempo" }).min(0, "Tempo inválido").max(80, "Tempo inválido"),
});

export default function Aposentadoria() {
  const [result, setResult] = useState<{ 
    faltaIdade: number; 
    faltaTempo: number; 
    apta: boolean;
  } | null>(null);

  useEffect(() => {
    document.title = "Simulador INSS | Fazaconta Online";
  }, []);

  const { register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    // Regra geral de aposentadoria por idade (homens e mulheres após reforma - simplificado para 65 anos para todos neste simulador básico como pede o prompt)
    const idadeMinima = 65;
    const contribuicaoMinima = 15;
    
    const faltaIdade = Math.max(0, idadeMinima - data.idade);
    const faltaTempo = Math.max(0, contribuicaoMinima - data.contribuicao);
    
    setResult({ 
      faltaIdade, 
      faltaTempo,
      apta: faltaIdade === 0 && faltaTempo === 0
    });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <div className="inline-flex items-center justify-center p-3 bg-emerald-50 rounded-xl text-emerald-500 mb-4">
          <PiggyBank className="w-8 h-8" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-bold mb-3">Simulador de Aposentadoria</h1>
        <p className="text-lg text-muted-foreground">
          Descubra quanto tempo falta para você atingir os requisitos mínimos gerais da aposentadoria por idade (INSS).
        </p>
      </div>

      <Card className="border-border shadow-md">
        <CardContent className="p-6 sm:p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="idade" className="text-base font-semibold">Sua Idade Atual</Label>
                <div className="relative">
                  <Input 
                    id="idade" 
                    type="number" 
                    placeholder="Ex: 45" 
                    className="h-14 text-lg pl-4 bg-muted/50 focus:bg-background transition-colors"
                    {...register("idade")} 
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">anos</span>
                </div>
                {errors.idade && <p className="text-sm text-destructive">{errors.idade.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="contribuicao" className="text-base font-semibold">Anos de Contribuição</Label>
                <div className="relative">
                  <Input 
                    id="contribuicao" 
                    type="number" 
                    placeholder="Ex: 10" 
                    className="h-14 text-lg pl-4 bg-muted/50 focus:bg-background transition-colors"
                    {...register("contribuicao")} 
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">anos</span>
                </div>
                {errors.contribuicao && <p className="text-sm text-destructive">{errors.contribuicao.message}</p>}
              </div>
            </div>

            <Button type="submit" className="w-full h-14 text-lg font-bold bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/25 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]">
              Verificar Situação
            </Button>
          </form>

          {result && (
            <ResultBox 
              isVisible={true}
              title="Sua Situação Atual"
              variant={result.apta ? "success" : "warning"}
              value={
                result.apta 
                  ? "Requisitos atingidos! 🎉" 
                  : "Ainda faltam requisitos."
              }
              description={
                result.apta 
                  ? "Você já possui a idade e o tempo de contribuição mínimos para dar entrada na aposentadoria por idade."
                  : `Faltam ${result.faltaIdade > 0 ? result.faltaIdade + ' anos de idade' : '0 anos de idade (já atingida)'} e ${result.faltaTempo > 0 ? result.faltaTempo + ' anos de contribuição' : '0 anos de contribuição (já atingida)'}.`
              }
            />
          )}
          
          {result !== null && (
            <p className="text-xs text-center text-muted-foreground mt-4">
              Aviso: Simulação simplificada baseada na regra geral de 65 anos de idade e 15 anos de contribuição. Não considera regras de transição, pedágios, ou diferenças de gênero específicas. Consulte o MEU INSS para dados exatos.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
