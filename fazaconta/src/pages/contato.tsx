import { Mail, MessageSquare, Clock } from "lucide-react";
import { PageMeta } from "@/components/page-meta";

export default function Contato() {
  return (
    <div className="max-w-2xl mx-auto space-y-10 pb-12">
      <PageMeta
        title="Contato | Fazaconta Online"
        description="Entre em contato com a equipe do Fazaconta Online. Dúvidas, sugestões, erros nas calculadoras ou parcerias."
      />

      <div>
        <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-xl text-primary mb-4">
          <Mail className="w-8 h-8" aria-hidden="true" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-bold mb-3">Contato</h1>
        <p className="text-lg text-muted-foreground">
          Encontrou um erro em alguma calculadora, tem uma sugestão de nova ferramenta ou quer
          propor uma parceria? Fale com a gente.
        </p>
      </div>

      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex items-start gap-4 p-5 bg-card rounded-2xl border border-border">
          <div className="shrink-0 w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Mail className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground mb-1">E-mail</h2>
            <a
              href="mailto:contato@fazaconta.online"
              className="text-primary hover:underline text-sm break-all"
            >
              contato@fazaconta.online
            </a>
          </div>
        </div>

        <div className="flex items-start gap-4 p-5 bg-card rounded-2xl border border-border">
          <div className="shrink-0 w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Clock className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground mb-1">Prazo de resposta</h2>
            <p className="text-muted-foreground text-sm">Respondemos em até 3 dias úteis.</p>
          </div>
        </div>
      </section>

      <section>
        <div className="flex items-start gap-3 p-5 bg-card rounded-2xl border border-border">
          <MessageSquare className="w-5 h-5 text-primary shrink-0 mt-0.5" aria-hidden="true" />
          <div className="space-y-2">
            <h2 className="font-semibold text-foreground">Tipos de solicitação</h2>
            <ul className="space-y-1.5 text-sm text-muted-foreground list-disc list-inside">
              <li>Erro de cálculo ou informação incorreta em alguma ferramenta</li>
              <li>Sugestão de nova calculadora</li>
              <li>Dúvida sobre os resultados apresentados</li>
              <li>Proposta de parceria ou publicidade</li>
              <li>Solicitação de remoção de dados (LGPD)</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="border-t pt-6">
        <p className="text-sm text-muted-foreground">
          As informações deste site têm caráter educativo e não substituem a orientação de
          profissionais de saúde, nutricionistas ou advogados trabalhistas.
        </p>
      </section>
    </div>
  );
}
