import { cn } from "@/lib/utils";

interface GlitchTextProps {
  children: string;
  className?: string;
  as?: "h1" | "h2" | "h3" | "span" | "p";
}

export function GlitchText({ children, className, as = "span" }: GlitchTextProps) {
  const Tag = as;
  return (
    <Tag className={cn("glitch-text", className)} data-text={children}>
      {children}
    </Tag>
  );
}
