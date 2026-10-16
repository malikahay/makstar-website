"use client";

import { useT } from "./LocaleProvider";
import { TLink } from "./TransitionProvider";

/** "By pressing the button you agree to the offer and privacy policy" under forms that collect personal data. */
export function Consent({ className = "" }: { className?: string }) {
  const t = useT();
  return (
    <p className={`text-xs leading-relaxed text-mk-black/50 ${className}`}>
      {t.legal.consentPrefix}
      <TLink href="/offer" className="underline hover:text-mk-blue">
        {t.legal.offerLink}
      </TLink>
      {t.legal.and}
      <TLink href="/privacy" className="underline hover:text-mk-blue">
        {t.legal.privacyLink}
      </TLink>
      {t.legal.consentSuffix}
    </p>
  );
}
