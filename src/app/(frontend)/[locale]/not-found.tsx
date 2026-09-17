import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function NoEncontrado() {
  const t = useTranslations("noEncontrado");
  return (
    <div className="bg-cream py-32 text-center">
      <div className="shell">
        <p className="display text-6xl">404</p>
        <h1 className="mt-4 text-2xl font-bold">{t("titulo")}</h1>
        <p className="mt-4 text-[15px] text-ink/75">{t("texto")}</p>
        <Link href="/" className="pill pill-dark mt-8">
          {t("volver")}
        </Link>
      </div>
    </div>
  );
}
