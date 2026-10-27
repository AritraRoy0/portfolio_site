import { portfolio, type SocialKey } from "@/data/portfolio";
import { socialIcons } from "./Icons";

const ORDER: SocialKey[] = ["linkedin", "github", "email", "x"];

const LABELS: Record<SocialKey, string> = {
  linkedin: "LinkedIn",
  github: "GitHub",
  email: "Email",
  x: "X (Twitter)",
};

export function SocialLinks({ className = "" }: { className?: string }) {
  const keys = ORDER.filter((key) => portfolio.socials[key]);

  return (
    <ul className={`flex gap-2.5 ${className}`}>
      {keys.map((key) => {
        const value = portfolio.socials[key]!;
        const isEmail = key === "email";
        const Icon = socialIcons[key];
        return (
          <li key={key}>
            <a
              href={isEmail ? `mailto:${value}` : value}
              aria-label={LABELS[key]}
              title={LABELS[key]}
              {...(isEmail ? {} : { target: "_blank", rel: "noopener noreferrer" })}
              className="grid size-11 place-items-center rounded-xl border border-line bg-surface text-muted transition hover:-translate-y-0.5 hover:border-accent hover:text-accent"
            >
              <Icon className="size-5" />
            </a>
          </li>
        );
      })}
    </ul>
  );
}
