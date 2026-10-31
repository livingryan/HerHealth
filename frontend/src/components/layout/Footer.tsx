import { Link } from "../ui/Link";
import { Logo } from "../Logo";

const footerLinks = [
  {
    heading: "Platform",
    items: [
      { label: "How anemia screening works", href: "/screening/anemia" },
      { label: "Cycle tracking", href: "/cycle-tracking" },
      { label: "Health education library", href: "/education" },
      { label: "Reports & history", href: "/reports" },
    ],
  },
  {
    heading: "About",
    items: [
      { label: "Our approach to responsible screening", href: "#responsible-screening" },
      { label: "Privacy & data", href: "#privacy" },
      { label: "Limitations", href: "#limitations" },
    ],
  },
];

export const Footer = () => (
  <footer className="border-t border-border bg-white mt-auto">
    <div className="page-container py-10 md:py-16">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
        <div className="col-span-1 lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <Logo />
          </div>
          <p className="text-sm text-ink/70 leading-relaxed max-w-xs">
            A gentler way to understand your health, notice patterns, and take
            informed next steps. Local prototype — not a clinical tool.
          </p>
        </div>
        {footerLinks.map((group) => (
          <div key={group.heading}>
            <h3 className="text-sm font-semibold text-deep mb-4">{group.heading}</h3>
            <ul className="space-y-2">
              {group.items.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-sm text-ink/70 hover:text-deep">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-xs text-ink/50">
          HerHealth AI &middot; Early risk awareness &amp; wellness education
        </p>
        <p className="text-xs text-ink/50">
          Not a diagnostic device. Images and questionnaire answers are not a
          substitute for professional medical advice, diagnosis, or treatment.
        </p>
      </div>
    </div>
  </footer>
);