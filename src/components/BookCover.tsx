import Link from "next/link";

type BookCoverProps =
  | {
      decorative: true;
      color: string;
      accentColor: string;
      index?: number;
    }
  | {
      decorative?: false;
      title: string;
      subtitle?: string;
      href: string;
      color: string;
      accentColor: string;
      index?: number;
    };

export default function BookCover(props: BookCoverProps) {
  const { color, accentColor, index = 0 } = props;

  if (props.decorative === true) {
    return (
      <div
        aria-hidden="true"
      className="relative flex-shrink-0 w-8 sm:w-12 md:w-14 h-48 sm:h-56 md:h-64 animate-slide-up"
      style={{ animationDelay: `${0.5 + index * 0.08}s` }}
    >
        <div
          className="absolute inset-0 rounded-[2px] shadow-lg"
          style={{ backgroundColor: color }}
        >
          <div className="absolute left-0 top-0 bottom-0 w-2 bg-black/20" />
          <div className="absolute right-0 top-0 bottom-0 w-[1px] bg-white/5" />
          <div
            className="absolute top-4 left-3 right-2 h-[1px]"
            style={{ backgroundColor: accentColor, opacity: 0.3 }}
          />
          <div
            className="absolute bottom-4 left-3 right-2 h-[1px]"
            style={{ backgroundColor: accentColor, opacity: 0.3 }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="w-3 h-3 rounded-full opacity-20"
              style={{ backgroundColor: accentColor }}
            />
          </div>
        </div>
      </div>
    );
  }

  const { title, subtitle, href } = props;
  const lines = title.split("\n");

  return (
    <Link
      href={href}
      className="theme-focus-ring relative group flex h-56 w-32 flex-shrink-0 cursor-pointer animate-slide-up sm:h-64 sm:w-40 md:h-72 md:w-48"
      style={{ animationDelay: `${0.5 + index * 0.08}s` }}
    >
      <div
        className="book-cover-surface absolute inset-0 overflow-hidden rounded-[3px] shadow-lg transition-all duration-300 group-hover:-translate-y-3 group-hover:shadow-2xl"
        style={{
          backgroundColor: color,
          boxShadow: "0 24px 48px color-mix(in srgb, var(--theme-background) 70%, black)",
        }}
      >
        {/* Left spine edge */}
        <div className="absolute left-0 top-0 bottom-0 w-3 bg-black/15" />
        {/* Right edge */}
        <div className="absolute right-0 top-0 bottom-0 w-[1px] bg-white/10" />

        {/* Cover content */}
        <div className="absolute inset-0 flex flex-col justify-between p-3 sm:p-4 md:p-5 pl-4 sm:pl-5 md:pl-6">
          {/* Top accent line */}
          <div
            className="h-[2px] w-8 sm:w-10 md:w-12 rounded-full"
            style={{ backgroundColor: accentColor }}
          />

          {/* Title block */}
          <div className="flex-1 flex flex-col justify-center">
            <span
              className="text-sm font-bold leading-tight tracking-wide sm:text-base md:text-lg"
              style={{ color: "var(--theme-foreground)" }}
            >
              {lines.map((line: string, lineIndex: number) => (
                <span key={lineIndex} className="block">
                  {line}
                </span>
              ))}
            </span>
            {subtitle && (
              <p
                className="mt-1.5 text-[11px] leading-snug tracking-wide sm:text-xs md:text-sm"
                style={{ color: "color-mix(in srgb, var(--theme-foreground) 75%, transparent)" }}
              >
                {subtitle}
              </p>
            )}
          </div>

          {/* Bottom accent */}
          <div
            className="h-[2px] w-6 sm:w-8 rounded-full opacity-50"
            style={{ backgroundColor: accentColor }}
          />
        </div>

        {/* Page edge on right */}
        <div className="absolute top-2 bottom-2 right-0 w-[3px] bg-gradient-to-l from-white/5 to-transparent" />
      </div>
    </Link>
  );
}
