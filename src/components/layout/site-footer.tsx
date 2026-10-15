import { LocalClock } from "@/components/ui/local-clock";
import { copyrightYear } from "@/config/site";
import type { Profile, UiStrings } from "@/content/types";

interface SiteFooterProps {
  profile: Profile;
  ui: UiStrings["footer"];
}

/**
 * Continues the contact section's ink panel. The full name is set huge and
 * widens from condensed to expanded as it scrolls into view.
 */
export function SiteFooter({ profile, ui }: SiteFooterProps) {
  return (
    <footer className="overflow-clip bg-ink px-5 pt-6 pb-8 text-paper md:px-10">
      <div className="mx-auto max-w-[90rem]">
        <p
          aria-hidden="true"
          className="widen-in -ml-[0.04em] text-[clamp(3.25rem,12.5vw,13rem)] leading-[0.8] font-black tracking-[-0.03em] whitespace-nowrap text-paper/90"
        >
          {profile.fullName}
        </p>
        <div className="mt-8 flex flex-wrap items-baseline justify-between gap-4 border-t border-paper/20 pt-6 text-sm text-paper/70">
          <p>
            © {copyrightYear} {profile.fullName}
          </p>
          <p className="tabular">
            {ui.now}{" "}
            <LocalClock
              id="footer-clock"
              timeZone={profile.timeZone}
              className="text-paper"
            />
          </p>
          <a
            href="#top"
            className="underline underline-offset-4 hover:text-paper"
          >
            {ui.backToTop}
          </a>
        </div>
      </div>
    </footer>
  );
}
