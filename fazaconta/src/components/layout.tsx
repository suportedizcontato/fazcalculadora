import { Link, useLocation } from "wouter";
import { Calculator, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCanonical } from "@/hooks/use-canonical";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const isHome = location === "/";
  useCanonical();

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-background">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 right-0 h-[400px] w-full z-0 pointer-events-none opacity-40">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent" />
        <img 
          src={`${import.meta.env.BASE_URL}images/hero-abstract.png`} 
          alt="" 
          className="w-full h-full object-cover mix-blend-overlay"
        />
      </div>

      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group outline-none">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white shadow-lg shadow-primary/20 group-hover:shadow-primary/40 group-hover:scale-105 transition-all duration-300">
              <Calculator className="w-5 h-5" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight text-foreground">
              Fazaconta <span className="text-primary font-medium">Online</span>
            </span>
          </Link>
        </div>
      </header>

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-8 md:py-12 z-10">
        {!isHome && (
          <div className="mb-6">
            <Button
              asChild
              className="min-h-[44px] px-5 gap-2 rounded-xl bg-accent hover:bg-accent/85 text-accent-foreground font-semibold shadow-md shadow-accent/20 border-0 focus-visible:ring-2 focus-visible:ring-accent active:scale-[0.97] transition-transform"
            >
              <Link href="/">
                <ArrowLeft className="w-4 h-4 shrink-0" />
                Voltar
              </Link>
            </Button>
          </div>
        )}
        <div key={location} className="animate-page-enter">
          {children}
        </div>
      </main>

      <footer className="border-t bg-card py-8 mt-auto z-10 relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col items-center justify-center gap-2">
          <div className="flex items-center gap-2 opacity-50">
            <Calculator className="w-4 h-4" />
            <span className="font-display font-semibold">Fazaconta Online</span>
          </div>
          <p className="text-sm text-muted-foreground text-center">
            © {new Date().getFullYear()} - Calculadoras gratuitas e ferramentas para o dia a dia.
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="/sobre"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Sobre
            </Link>
            <Link
              href="/politica-de-privacidade"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Política de Privacidade
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
