import { LocalClock } from "@/components/ui/local-clock";
import { copyrightYear } from "@/config/site";
import type { Profile, UiStrings } from "@/content/types";

interface SiteFooterProps {
  profile: Profile;
  ui: UiStrings["footer"];
}

/**
 * Continues the contact section's closing panel. The full name is set huge and
 * widens from condensed to expanded as it scrolls into view.
 */
export function SiteFooter({ profile, ui }: SiteFooterProps) {
  return (
    <footer className="overflow-clip bg-closing px-5 pt-6 pb-8 text-on-closing md:px-10">
      <div className="mx-auto max-w-[90rem]">
        <p
          aria-hidden="true"
          className="widen-in -ml-[0.04em] text-[clamp(3.25rem,12.5vw,13rem)] leading-[0.8] font-black tracking-[-0.03em] whitespace-nowrap text-on-closing/90"
        >
          {profile.fullName}
        </p>
        <div className="mt-8 flex flex-wrap items-baseline justify-between gap-4 border-t border-on-closing/20 pt-6 text-sm text-on-closing/70">
          <p>
            © {copyrightYear} {profile.fullName}
          </p>
          <p className="tabular">
            {ui.now}{" "}
            <LocalClock
              id="footer-clock"
              timeZone={profile.timeZone}
              className="text-on-closing"
            />
          </p>
          <a
            href="#top"
            className="underline underline-offset-4 hover:text-on-closing"
          >
            {ui.backToTop}
          </a>
        </div>
      </div>
    </footer>
  );
}
