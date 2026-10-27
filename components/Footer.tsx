import { portfolio } from "@/data/portfolio";

export function Footer() {
  return (
    <footer className="border-t border-line py-7 text-center text-sm text-muted">
      <p className="container-page">
        &copy; {new Date().getFullYear()} {portfolio.name}
      </p>
    </footer>
  );
}
