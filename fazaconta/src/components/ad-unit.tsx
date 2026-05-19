import { useEffect, useRef } from "react";
import { ADSENSE_CLIENT, ADSENSE_SLOTS, type AdSlot } from "@/config/adsense";

declare global {
  interface Window {
    adsbygoogle: Record<string, unknown>[];
  }
}

interface AdUnitProps {
  slot: AdSlot;
  className?: string;
}

export function AdUnit({ slot, className }: AdUnitProps) {
  const insRef = useRef<HTMLElement>(null);
  const pushed = useRef(false);

  const slotId = ADSENSE_SLOTS[slot];

  useEffect(() => {
    if (pushed.current || !insRef.current || !slotId) return;
    pushed.current = true;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // AdSense script não carregado
    }
  }, [slotId]);

  if (!slotId) return null;

  return (
    <div className={`overflow-hidden text-center ${className ?? ""}`}>
      <ins
        ref={insRef as React.RefObject<HTMLModElement>}
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={slotId}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
