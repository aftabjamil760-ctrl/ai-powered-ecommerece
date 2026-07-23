export default function SectionHeader({ eyebrow, title, description, align = "left", action }) {
  return (
    <div
      className={`mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between ${
        align === "center" ? "text-center md:flex-col md:items-center" : ""
      }`}
    >
      <div className={align === "center" ? "mx-auto max-w-2xl" : "max-w-2xl"}>
        {eyebrow && (
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            {eyebrow}
          </p>
        )}
        <h2 className="font-display text-3xl md:text-5xl">
          {title}
        </h2>
        {description && (
          <p className="mt-3 text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}

