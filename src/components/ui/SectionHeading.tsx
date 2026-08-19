import { Reveal, SplitWords } from "./Reveal";
import { cn } from "@/lib/utils";

type Props = {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
  id?: string;
};

export function SectionHeading({ eyebrow, title, description, align = "left", className, id }: Props) {
  return (
    <div className={cn("mb-12 md:mb-16", align === "center" && "text-center mx-auto max-w-2xl", className)}>
      {eyebrow && (
        <Reveal y={12}>
          <p className="eyebrow mb-4 flex items-center gap-3">
            <span className="inline-block h-px w-8 bg-gradient-to-r from-accent to-accent-2" aria-hidden />
            {eyebrow}
          </p>
        </Reveal>
      )}
      <h2 id={id} className="display text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-fg">
        <SplitWords text={title} />
      </h2>
      {description && (
        <Reveal delay={0.15}>
          <p className="mt-6 max-w-xl text-base md:text-lg text-muted leading-relaxed">{description}</p>
        </Reveal>
      )}
    </div>
  );
}
