import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

import horizontal from "../../public/brand/logo-olcd-horizontal.png";
import vertical from "../../public/brand/logo-olcd-vertical.png";

type Props = {
  /** "barra" = versión horizontal (header); "bloque" = vertical (footer). */
  variante?: "barra" | "bloque";
};

/** Marca del Observatorio (`public/brand/`), pensada para fondos oscuros. */
export default function Logo({ variante = "barra" }: Props) {
  const t = useTranslations("header");
  const esBloque = variante === "bloque";

  return (
    <Link href="/" className="inline-block shrink-0">
      <Image
        src={esBloque ? vertical : horizontal}
        alt="Observatorio Latinoamericano de Centros de Datos"
        priority={!esBloque}
        className={esBloque ? "h-auto w-[132px]" : "h-[38px] w-auto md:h-[44px]"}
        sizes={esBloque ? "132px" : "200px"}
      />
      <span className="sr-only">{t("irAlInicio")}</span>
    </Link>
  );
}
