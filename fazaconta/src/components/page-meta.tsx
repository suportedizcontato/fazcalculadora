import { useEffect } from "react";

interface JsonLdFaq {
  question: string;
  answer: string;
}

interface PageMetaProps {
  title: string;
  description: string;
  faq?: JsonLdFaq[];
}

export function PageMeta({ title, description, faq }: PageMetaProps) {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = title;

    let metaDesc = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.name = "description";
      document.head.appendChild(metaDesc);
    }
    const prevDesc = metaDesc.content;
    metaDesc.content = description;

    let jsonLdScript: HTMLScriptElement | null = null;
    if (faq && faq.length > 0) {
      jsonLdScript = document.createElement("script");
      jsonLdScript.type = "application/ld+json";
      jsonLdScript.id = "page-jsonld";
      jsonLdScript.textContent = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faq.map(({ question, answer }) => ({
          "@type": "Question",
          name: question,
          acceptedAnswer: { "@type": "Answer", text: answer },
        })),
      });
      document.head.appendChild(jsonLdScript);
    }

    return () => {
      document.title = prevTitle;
      metaDesc!.content = prevDesc;
      if (jsonLdScript) jsonLdScript.remove();
    };
  }, [title, description, faq]);

  return null;
}
