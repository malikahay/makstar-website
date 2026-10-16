import { Button } from "@/components/Button";
import { Pasta } from "@/components/Pasta";
import { getDict } from "@/i18n/server";

export default async function NotFound() {
  const t = await getDict();
  return (
    <section className="grain relative flex min-h-screen flex-col items-center justify-center bg-mk-blue px-4 text-center text-white">
      <div className="flex items-center font-display text-[30vw] font-black leading-none text-mk-yellow md:text-[18rem]">
        4<Pasta kind="nest" className="animate-spin-slow h-[24vw] w-[24vw] md:h-60 md:w-60" />4
      </div>
      <h1 className="font-display text-3xl font-black uppercase md:text-5xl">{t.notFound.title}</h1>
      <p className="mt-4 text-white/70">{t.notFound.lead}</p>
      <div className="mt-8">
        <Button href="/catalog" big>
          {t.common.toCatalog}
        </Button>
      </div>
    </section>
  );
}
