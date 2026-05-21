import { useEffect } from "react";
import { useLocation } from "wouter";

const BASE_URL = "https://www.fazacontaonline.com";
const SITE_NAME = "Fazaconta";
const DEFAULT_OG_IMAGE = `${BASE_URL}/opengraph.jpg`;

interface JsonLdFaq {
  question: string;
  answer: string;
}

export interface HowToStep {
  name: string;
  text: string;
}

interface PageMetaProps {
  title: string;
  description: string;
  faq?: JsonLdFaq[];
  howTo?: {
    name: string;
    description: string;
    steps: HowToStep[];
  };
  softwareApp?: boolean;
  isHome?: boolean;
  dateModified?: string;
  ogImage?: string;
  ogType?: "website" | "article";
  noindex?: boolean;
}

type MetaRecord = { el: HTMLMetaElement; wasCreated: boolean; prevContent: string };

function applyMeta(
  selector: string,
  attrName: string,
  attrValue: string,
  content: string
): MetaRecord {
  let el = document.querySelector<HTMLMetaElement>(selector);
  let wasCreated = false;
  let prevContent = "";
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attrName, attrValue);
    document.head.appendChild(el);
    wasCreated = true;
  } else {
    prevContent = el.content;
  }
  el.content = content;
  return { el, wasCreated, prevContent };
}

export function PageMeta({
  title,
  description,
  faq,
  howTo,
  softwareApp,
  isHome,
  dateModified,
  ogImage,
  ogType = "website",
  noindex = false,
}: PageMetaProps) {
  const [location] = useLocation();
  const path = location === "/" ? "/" : location.replace(/\/$/, "");
  const canonicalUrl = `${BASE_URL}${path}`;
  const imageUrl = ogImage ?? DEFAULT_OG_IMAGE;

  useEffect(() => {
    const prevTitle = document.title;
    document.title = title;

    const records: MetaRecord[] = [];

    function setMeta(selector: string, attrName: string, attrValue: string, content: string) {
      records.push(applyMeta(selector, attrName, attrValue, content));
    }

    // Description
    setMeta('meta[name="description"]', "name", "description", description);

    // Open Graph
    setMeta('meta[property="og:title"]', "property", "og:title", title);
    setMeta('meta[property="og:description"]', "property", "og:description", description);
    setMeta('meta[property="og:type"]', "property", "og:type", ogType);
    setMeta('meta[property="og:url"]', "property", "og:url", canonicalUrl);
    setMeta('meta[property="og:site_name"]', "property", "og:site_name", SITE_NAME);
    setMeta('meta[property="og:image"]', "property", "og:image", imageUrl);
    setMeta('meta[property="og:image:width"]', "property", "og:image:width", "1200");
    setMeta('meta[property="og:image:height"]', "property", "og:image:height", "630");
    setMeta('meta[property="og:locale"]', "property", "og:locale", "pt_BR");

    // Twitter Cards
    setMeta('meta[name="twitter:card"]', "name", "twitter:card", "summary_large_image");
    setMeta('meta[name="twitter:title"]', "name", "twitter:title", title);
    setMeta('meta[name="twitter:description"]', "name", "twitter:description", description);
    setMeta('meta[name="twitter:image"]', "name", "twitter:image", imageUrl);

    // Robots
    if (noindex) {
      setMeta('meta[name="robots"]', "name", "robots", "noindex, follow");
    }

    // JSON-LD
    const graph: object[] = [];

    if (faq && faq.length > 0) {
      graph.push({
        "@type": "FAQPage",
        mainEntity: faq.map(({ question, answer }) => ({
          "@type": "Question",
          name: question,
          acceptedAnswer: { "@type": "Answer", text: answer },
        })),
      });
    }

    if (howTo) {
      graph.push({
        "@type": "HowTo",
        name: howTo.name,
        description: howTo.description,
        step: howTo.steps.map((step, i) => ({
          "@type": "HowToStep",
          position: i + 1,
          name: step.name,
          text: step.text,
        })),
      });
    }

    if (softwareApp) {
      const appName = title.split("|")[0].replace("—", "").trim();
      graph.push({
        "@type": "SoftwareApplication",
        name: appName,
        applicationCategory: "UtilityApplication",
        operatingSystem: "Web Browser",
        offers: { "@type": "Offer", price: "0", priceCurrency: "BRL" },
        url: canonicalUrl,
        ...(dateModified ? { dateModified } : {}),
      });
    }

    if (isHome) {
      graph.push(
        {
          "@type": "Organization",
          "@id": `${BASE_URL}/#organization`,
          name: SITE_NAME,
          url: BASE_URL,
        },
        {
          "@type": "WebSite",
          "@id": `${BASE_URL}/#website`,
          url: BASE_URL,
          name: SITE_NAME,
          publisher: { "@id": `${BASE_URL}/#organization` },
        }
      );
    }

    if (!isHome) {
      const breadcrumbName = title.split(/\s*[—|]\s*/)[0].trim();
      graph.push({
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Início", item: BASE_URL },
          { "@type": "ListItem", position: 2, name: breadcrumbName, item: canonicalUrl },
        ],
      });
    }

    document.querySelector("#page-jsonld")?.remove();
    let jsonLdScript: HTMLScriptElement | null = null;
    if (graph.length > 0) {
      jsonLdScript = document.createElement("script");
      jsonLdScript.type = "application/ld+json";
      jsonLdScript.id = "page-jsonld";
      jsonLdScript.textContent = JSON.stringify({ "@context": "https://schema.org", "@graph": graph });
      document.head.appendChild(jsonLdScript);
    }

    return () => {
      document.title = prevTitle;
      for (const { el, wasCreated, prevContent } of records) {
        if (wasCreated) el.remove();
        else el.content = prevContent;
      }
      jsonLdScript?.remove();
    };
  }, [title, description, canonicalUrl, faq, howTo, softwareApp, isHome, dateModified, imageUrl, ogType, noindex]);

  return null;
}
