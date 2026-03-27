import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, Info } from "lucide-react";

export type ResultVariant = "default" | "success" | "warning" | "danger" | "info";

interface ResultBoxProps {
  title: string;
  value: string | React.ReactNode;
  description?: string;
  variant?: ResultVariant;
  isVisible: boolean;
}

export function ResultBox({ 
  title, 
  value, 
  description, 
  variant = "default",
  isVisible 
}: ResultBoxProps) {
  
  const getColors = () => {
    switch (variant) {
      case "success": return "bg-success/25 border-success/40 text-foreground";
      case "warning": return "bg-warning/10 border-warning/20 text-warning-foreground";
      case "danger": return "bg-destructive/25 border-destructive/40 text-foreground";
      case "info": return "bg-primary/10 border-primary/20 text-primary";
      default: return "bg-card border-border text-foreground";
    }
  };

  const getIcon = () => {
    switch (variant) {
      case "success": return <CheckCircle2 className="w-6 h-6 text-success" />;
      case "warning": return <AlertCircle className="w-6 h-6 text-warning" />;
      case "danger": return <AlertCircle className="w-6 h-6 text-destructive" />;
      case "info": return <Info className="w-6 h-6 text-primary" />;
      default: return null;
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, height: 0, scale: 0.95 }}
          animate={{ opacity: 1, height: "auto", scale: 1 }}
          exit={{ opacity: 0, height: 0, scale: 0.95 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="overflow-hidden"
        >
          <div data-variant={variant} className={`mt-8 p-6 rounded-2xl border-2 shadow-sm relative overflow-hidden ${getColors()}`}>
            {variant !== "default" && (
              <div className="absolute top-0 left-0 w-1 h-full" 
                   style={{ backgroundColor: `hsl(var(--${variant === 'danger' ? 'destructive' : variant}))` }} />
            )}
            
            <div className="flex items-start gap-4">
              {getIcon()}
              <div className="flex-1">
                <h3 className="text-sm font-medium uppercase tracking-wider opacity-80 mb-1">
                  {title}
                </h3>
                <div className="text-3xl sm:text-4xl font-display font-bold tracking-tight mb-2">
                  {value}
                </div>
                {description && (
                  <p className="text-sm opacity-90 leading-relaxed">
                    {description}
                  </p>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
