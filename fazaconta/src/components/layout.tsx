import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Calculator, Menu, X, Sun, Moon, ChevronDown } from "lucide-react";
import { useCanonical } from "@/hooks/use-canonical";

interface LayoutProps {
  children: React.ReactNode;
}

const NAV_GROUPS = [
  {
    label: "Saúde",
    items: [
      { href: "/calculadora-imc", label: "Calculadora de IMC" },
      { href: "/consumo-agua", label: "Consumo de Água" },
    ],
  },
  {
    label: "Culinária",
    items: [
      { href: "/conversor-xicaras", label: "Conversor de Xícaras" },
    ],
  },
  {
    label: "Trabalho CLT",
    items: [
      { href: "/calculadora-trabalhista-clt", label: "Calculadora CLT" },
      { href: "/banco-de-horas", label: "Banco de Horas" },
      { href: "/calculadora-horas-extras", label: "Horas Extras" },
      { href: "/simulador-demissao", label: "Simulador de Demissão" },
    ],
  },
  {
    label: "Matemática",
    items: [
      { href: "/calculadora-porcentagem", label: "Calculadora de Porcentagem" },
    ],
  },
];

function useTheme() {
  const [dark, setDark] = useState(() =>
    typeof window !== "undefined"
      ? document.documentElement.classList.contains("dark")
      : false
  );

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const shouldBeDark = saved ? saved === "dark" : prefersDark;
    setDark(shouldBeDark);
    document.documentElement.classList.toggle("dark", shouldBeDark);
  }, []);

  return { dark, toggle };
}

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const isHome = location === "/";
  const { dark, toggle } = useTheme();
  useCanonical();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);

  // Fecha menu mobile ao navegar
  useEffect(() => {
    setMobileOpen(false);
    setOpenGroup(null);
  }, [location]);

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-background">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 right-0 h-[520px] w-full z-0 pointer-events-none opacity-40">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent" />
        <img
          src={`${import.meta.env.BASE_URL}images/hero-abstract.png`}
          alt=""
          className="w-full h-full object-cover mix-blend-overlay"
        />
      </div>

      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group outline-none shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white shadow-lg shadow-primary/20 group-hover:shadow-primary/40 group-hover:scale-105 transition-all duration-300">
              <Calculator className="w-5 h-5" aria-hidden="true" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight text-foreground">
              Fazaconta <span className="text-primary font-medium">Online</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Categorias">
            {NAV_GROUPS.map((group) => (
              <div key={group.label} className="relative group/nav">
                <button
                  className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  aria-haspopup="true"
                >
                  {group.label}
                  <ChevronDown className="w-3.5 h-3.5 group-hover/nav:rotate-180 transition-transform duration-200" aria-hidden="true" />
                </button>
                <div className="absolute top-full left-0 mt-1 w-56 bg-card border border-border rounded-xl shadow-xl p-1.5 opacity-0 invisible group-hover/nav:opacity-100 group-hover/nav:visible transition-all duration-150 z-50">
                  {group.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`block px-3 py-2.5 rounded-lg text-sm transition-colors ${
                        location === item.href
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-foreground hover:bg-muted"
                      }`}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </nav>

          {/* Right controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggle}
              aria-label={dark ? "Ativar modo claro" : "Ativar modo escuro"}
              className="w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              {dark ? <Sun className="w-4 h-4" aria-hidden="true" /> : <Moon className="w-4 h-4" aria-hidden="true" />}
            </button>

            <button
              className="md:hidden w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((v) => !v)}
            >
              {mobileOpen
                ? <X className="w-5 h-5" aria-hidden="true" />
                : <Menu className="w-5 h-5" aria-hidden="true" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t bg-background/95 backdrop-blur-xl px-4 py-3 space-y-1">
            {NAV_GROUPS.map((group) => (
              <div key={group.label}>
                <button
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold text-foreground hover:bg-muted transition-colors"
                  onClick={() => setOpenGroup((g) => (g === group.label ? null : group.label))}
                  aria-expanded={openGroup === group.label}
                >
                  {group.label}
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${openGroup === group.label ? "rotate-180" : ""}`}
                    aria-hidden="true"
                  />
                </button>
                {openGroup === group.label && (
                  <div className="mt-1 ml-3 space-y-1">
                    {group.items.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`block px-3 py-2.5 rounded-lg text-sm transition-colors ${
                          location === item.href
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </header>

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-8 md:py-12 z-10">
        {!isHome && (
          <div className="mb-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <span aria-hidden="true">←</span>
              Voltar para início
            </Link>
          </div>
        )}
        <div key={location} className="animate-page-enter">
          {children}
        </div>
      </main>

      <footer className="border-t bg-card py-8 mt-auto z-10 relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 opacity-60">
              <Calculator className="w-4 h-4" aria-hidden="true" />
              <span className="font-display font-semibold text-sm">Fazaconta Online</span>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              © {new Date().getFullYear()} · Calculadoras gratuitas para o dia a dia
            </p>
            <nav className="flex items-center gap-4" aria-label="Links do rodapé">
              <Link href="/sobre" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Sobre
              </Link>
              <Link href="/contato" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Contato
              </Link>
              <Link href="/politica-de-privacidade" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Política de Privacidade
              </Link>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}
