import { useEffect } from "react";
import { useLocation } from "wouter";

const BASE_URL = "https://www.fazacontaonline.com";

export function useCanonical() {
  const [location] = useLocation();

  useEffect(() => {
    const path = location === "/" ? "/" : location.replace(/\/$/, "");
    const canonical = `${BASE_URL}${path}`;

    let tag = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!tag) {
      tag = document.createElement("link");
      tag.rel = "canonical";
      document.head.appendChild(tag);
    }
    tag.href = canonical;
  }, [location]);
}
