import { legalDoc, type LegalDoc } from "@/i18n/legal";
import { getDict, getLang } from "@/i18n/server";
import { PageHero } from "./PageHero";

/** Server-rendered public offer / privacy policy in the visitor's language. */
export async function LegalPage({ doc }: { doc: LegalDoc }) {
  const [t, d] = [await getDict(), legalDoc(await getLang(), doc)];
  return (
    <>
      <PageHero eyebrow={t.legal.eyebrow} title={d.title} lead={d.updated} pastas={["nest", "penne", "farfalle"]} />
      <article className="mx-auto max-w-3xl px-4 py-20 md:px-8 md:py-28">
        <p className="text-lg leading-relaxed text-mk-black/80">{d.intro}</p>
        {d.sections.map((s) => (
          <section key={s.h} className="mt-12">
            <h2 className="font-display text-2xl font-black md:text-3xl">{s.h}</h2>
            {s.p.map((p, i) => (
              <p key={i} className="mt-4 leading-relaxed text-mk-black/80">
                {p}
              </p>
            ))}
          </section>
        ))}
      </article>
    </>
  );
}
