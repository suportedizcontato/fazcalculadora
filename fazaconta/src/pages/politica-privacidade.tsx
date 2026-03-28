import { useEffect } from "react";

const LAST_UPDATED = "27 de março de 2026";
const CONTACT_EMAIL = "contato@fazaconta.com";

export default function PoliticaPrivacidade() {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = "Política de Privacidade | Fazaconta";

    let metaDesc = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.name = "description";
      document.head.appendChild(metaDesc);
    }
    const prevContent = metaDesc.content;
    metaDesc.content =
      "Política de Privacidade do Fazaconta Online: saiba como tratamos dados de navegação, cookies e publicidade, e conheça seus direitos conforme a LGPD.";

    return () => {
      document.title = prevTitle;
      metaDesc!.content = prevContent;
    };
  }, []);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-display font-bold mb-3">
          Política de Privacidade
        </h1>
        <p className="text-lg text-muted-foreground">
          Esta política explica como o Fazaconta Online trata informações de navegação, utiliza
          cookies e exibe publicidade, em conformidade com a Lei Geral de Proteção de Dados
          (LGPD — Lei 13.709/2018).
        </p>
      </div>

      <div className="space-y-10 text-base text-foreground">
        <section>
          <h2 className="text-2xl font-semibold mb-3">Coleta de Dados</h2>
          <p className="text-muted-foreground">
            O Fazaconta pode registrar dados de navegação por meio de cookies e ferramentas
            analíticas, como páginas visitadas e tempo de permanência no site. Esses dados são
            coletados de forma anônima e agregada.
          </p>
          <p className="text-muted-foreground mt-3">
            O site <strong>não coleta dados pessoais identificáveis</strong>, como nome, e-mail ou
            CPF. Não há formulários de cadastro nem login neste serviço.
          </p>
          <p className="text-muted-foreground mt-3">
            A finalidade da coleta é exclusivamente a análise de uso e a melhoria da experiência
            dos visitantes.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">Uso de Cookies</h2>
          <p className="text-muted-foreground mb-3">
            O site pode utilizar os seguintes tipos de cookies:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>
              <strong>Cookies de sessão e navegação:</strong> mantêm o funcionamento básico do
              site durante a visita.
            </li>
            <li>
              <strong>Cookies analíticos e de desempenho:</strong> coletam informações sobre como
              as páginas são utilizadas, ajudando a identificar melhorias.
            </li>
            <li>
              <strong>Cookies de publicidade (AdSense):</strong> usados pelo Google para exibir
              anúncios relevantes com base nas suas preferências de navegação.
            </li>
          </ul>
          <p className="text-muted-foreground mt-3">
            Você pode desativar os cookies nas configurações do seu navegador. Consulte a seção de
            ajuda do navegador que você utiliza para saber como fazer isso.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">Publicidade</h2>
          <p className="text-muted-foreground">
            O Fazaconta pode exibir anúncios veiculados pelo Google AdSense. O Google pode usar
            cookies para mostrar anúncios baseados em visitas anteriores a este e a outros sites.
          </p>
          <p className="text-muted-foreground mt-3">
            Para saber mais sobre como o Google utiliza os dados coletados, consulte a{" "}
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Política de Privacidade do Google
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">Seus Direitos (LGPD)</h2>
          <p className="text-muted-foreground mb-3">
            De acordo com a Lei 13.709/2018 (LGPD), você tem os seguintes direitos sobre seus
            dados:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>Acesso aos dados que possam ter sido coletados</li>
            <li>Correção de dados incompletos ou inexatos</li>
            <li>Exclusão dos dados tratados com seu consentimento</li>
            <li>Portabilidade dos dados a outro fornecedor de serviço</li>
          </ul>
          <p className="text-muted-foreground mt-3">
            Para exercer seus direitos ou tirar dúvidas, entre em contato pelo e-mail{" "}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-primary hover:underline"
            >
              {CONTACT_EMAIL}
            </a>
            .
          </p>
          <p className="text-muted-foreground mt-4 text-sm">
            Última atualização: {LAST_UPDATED}
          </p>
        </section>
      </div>
    </div>
  );
}
