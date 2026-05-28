/**
 * prerender.mjs
 *
 * Gera um index.html estático por rota com title, description, og:* e canonical
 * corretos — sem precisar de SSR nem de headless browser.
 *
 * Como funciona:
 *   1. Lê dist/public/index.html (gerado pelo `vite build`)
 *   2. Para cada rota, substitui os meta tags genéricos pelos específicos
 *   3. Salva dist/public/<rota>/index.html
 *
 * Resultado: o Googlebot recebe HTML único por URL, resolvendo "conteúdo de baixo valor".
 *
 * Uso:
 *   node prerender.mjs
 *
 * Script de build recomendado (package.json):
 *   "build": "vite build --config vite.config.ts && node prerender.mjs"
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const BASE_URL = 'https://www.fazacontaonline.com';

/**
 * Mapa de rotas → metadados SEO.
 * Manter sincronizado com os PageMeta de cada página.
 */
const ROUTES = {
  '/': {
    title: 'Fazaconta Online — Calculadoras Gratuitas para o Dia a Dia',
    description:
      'Calculadoras online gratuitas para brasileiros: IMC, porcentagem, consumo de água, xícaras, rescisão CLT e muito mais. Sem cadastro, resultado imediato.',
  },
  '/calculadora-imc': {
    title: 'Calculadora de IMC Online | Descubra Seu Peso Ideal | Fazaconta',
    description:
      'Calcule seu IMC em segundos e descubra se está no peso ideal. Fórmula da OMS, tabela completa e resultado imediato. Gratuito, sem cadastro.',
  },
  '/consumo-agua': {
    title: 'Calculadora de Água Diária — Quantos Litros Você Precisa? | Fazaconta',
    description:
      'Descubra quantos litros de água você deve beber por dia pelo seu peso. Resultado em segundos, sem cadastro. Baseado na fórmula 35 ml/kg.',
  },
  '/conversor-xicaras': {
    title: 'Conversor de Xícaras para ML e Copos — Resultado Imediato | Fazaconta',
    description:
      'Converta xícaras para ml e copos em segundos. 1 xícara = 240 ml. Ideal para receitas. Gratuito e sem cadastro.',
  },
  '/calculadora-porcentagem': {
    title: 'Calculadora de Porcentagem Online Grátis | Fazaconta',
    description:
      'Calcule porcentagens, descontos, aumentos e variações em segundos. Resultado imediato, sem cadastro.',
  },
  '/calculadora-trabalhista-clt': {
    title: 'Calculadora Trabalhista CLT | Rescisão, Férias e 13º | Fazaconta',
    description:
      'Calcule rescisão CLT, férias proporcionais e 13º salário. Resultado imediato, sem cadastro.',
  },
  '/banco-de-horas': {
    title: 'Calculadora de Banco de Horas CLT | Saldo e Valor | Fazaconta',
    description:
      'Calcule o saldo do banco de horas, valor monetário e alertas de prazo legal. Grátis e sem cadastro.',
  },
  '/calculadora-horas-extras': {
    title: 'Calculadora de Horas Extras e Adicional Noturno CLT | Fazaconta',
    description:
      'Calcule horas extras (50% ou 100%) e adicional noturno pela CLT. Resultado imediato, sem cadastro.',
  },
  '/simulador-demissao': {
    title: 'Simulador de Demissão CLT | Comparativo de Rescisão | Fazaconta',
    description:
      'Compare rescisão sem justa causa, pedido de demissão e acordo mútuo lado a lado. Grátis e sem cadastro.',
  },
  '/como-calcular-porcentagem': {
    title: 'Como Calcular Porcentagem | Fórmula, Exemplos e Calculadora | Fazaconta',
    description:
      'Aprenda como calcular porcentagem com fórmulas e exemplos práticos. Descubra como calcular descontos, aumentos e use nossa calculadora online.',
    ogType: 'article',
  },
  '/como-calcular-desconto': {
    title: 'Como Calcular Desconto Percentual | Fórmula e Exemplos | Fazaconta',
    description:
      'Aprenda como calcular desconto percentual com fórmulas e exemplos práticos. Descubra o valor final com desconto de forma simples.',
    ogType: 'article',
  },
  '/como-calcular-aumento-percentual': {
    title: 'Como Calcular Aumento Percentual | Fórmula e Exemplos | Fazaconta',
    description:
      'Aprenda como calcular aumento percentual com fórmula e exemplos práticos. Descubra o valor final após reajustes de forma simples.',
    ogType: 'article',
  },
  '/como-calcular-imc': {
    title: 'Como Calcular IMC | Fórmula, Tabela e Exemplo Prático | Fazaconta',
    description:
      'Aprenda como calcular IMC com fórmula, exemplo prático e tabela completa. Veja como interpretar o resultado e use nossa calculadora de IMC online.',
    ogType: 'article',
  },
  '/quanto-e-x-porcento-de-y': {
    title: 'Quanto é X% de um valor? | Exemplos e Calculadora | Fazaconta',
    description:
      'Descubra quanto é X% de um valor com exemplos práticos. Aprenda a calcular porcentagem e use nossa calculadora online gratuita.',
    ogType: 'article',
  },
  '/sobre': {
    title: 'Sobre o Fazaconta Online | Calculadoras Gratuitas',
    description:
      'Conheça o Fazaconta Online: calculadoras gratuitas para brasileiros, sem cadastro e sem anúncios intrusivos.',
  },
  '/contato': {
    title: 'Contato | Fazaconta Online',
    description:
      'Entre em contato com a equipe do Fazaconta Online. Dúvidas, sugestões, erros nas calculadoras ou parcerias.',
  },
  '/politica-de-privacidade': {
    title: 'Política de Privacidade | Fazaconta Online',
    description:
      'Política de Privacidade do Fazaconta Online: saiba como tratamos dados de navegação, cookies e publicidade, e conheça seus direitos conforme a LGPD.',
  },
};

// ---------------------------------------------------------------------------
// Utilitários
// ---------------------------------------------------------------------------

function escapeAttr(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Substitui o conteúdo de um meta tag pelo seletor de atributo.
 * Ex: replaceMetaContent(html, 'name', 'description', 'Novo texto')
 */
function replaceMetaContent(html, attr, attrValue, newContent) {
  // Suporta atributos em qualquer ordem e espaçamento variável
  const re = new RegExp(
    `(<meta[^>]*${attr}="${escapeRegex(attrValue)}"[^>]*content=")[^"]*(")|` +
    `(<meta[^>]*content=")[^"]*("[^>]*${attr}="${escapeRegex(attrValue)}"[^>]*)`,
    'i'
  );
  return html.replace(re, (match) =>
    match.replace(/content="[^"]*"/, `content="${escapeAttr(newContent)}"`)
  );
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const outDir = join(__dirname, 'dist/public');

let template;
try {
  template = readFileSync(join(outDir, 'index.html'), 'utf-8');
} catch {
  console.error('❌ dist/public/index.html não encontrado. Execute `vite build` primeiro.');
  process.exit(1);
}

let count = 0;

for (const [route, seo] of Object.entries(ROUTES)) {
  const urlPath = route === '/' ? '' : route;
  const canonicalUrl = `${BASE_URL}${urlPath}`;
  const ogType = seo.ogType ?? 'website';

  let html = template;

  // <title>
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${escapeAttr(seo.title)}</title>`);

  // meta description
  html = replaceMetaContent(html, 'name', 'description', seo.description);

  // og:title
  html = replaceMetaContent(html, 'property', 'og:title', seo.title);

  // og:description
  html = replaceMetaContent(html, 'property', 'og:description', seo.description);

  // og:url
  html = replaceMetaContent(html, 'property', 'og:url', canonicalUrl);

  // og:type
  html = replaceMetaContent(html, 'property', 'og:type', ogType);

  // twitter:title
  html = replaceMetaContent(html, 'name', 'twitter:title', seo.title);

  // twitter:description
  html = replaceMetaContent(html, 'name', 'twitter:description', seo.description);

  // canonical — injeta se não existir, atualiza se existir
  if (html.includes('rel="canonical"')) {
    html = html.replace(
      /(<link\s+rel="canonical"\s+href=")[^"]*(")/,
      `$1${canonicalUrl}$2`
    );
  } else {
    html = html.replace(
      '</head>',
      `  <link rel="canonical" href="${canonicalUrl}" />\n</head>`
    );
  }

  // Salva o arquivo
  if (route === '/') {
    writeFileSync(join(outDir, 'index.html'), html, 'utf-8');
  } else {
    const routeDir = join(outDir, route.slice(1)); // remove o "/" inicial
    mkdirSync(routeDir, { recursive: true });
    writeFileSync(join(routeDir, 'index.html'), html, 'utf-8');
  }

  count++;
  console.log(`  ✓ ${route}`);
}

console.log(`\n✅ ${count} rotas pré-renderizadas em dist/public/`);
