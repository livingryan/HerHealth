import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function NotFound() {
  const { t } = useTranslation();
  return (
    <div className="page-container py-24 text-center">
      <p className="text-6xl font-serif text-border mb-6">404</p>
      <h1 className="text-display-md font-serif text-ink mb-3">{t("common.not_found")}</h1>
      <p className="text-ink/60 mb-8">{t("common.not_found_desc")}</p>
      <Link
        to="/"
        className="inline-block px-6 py-2.5 bg-deep text-white text-sm font-medium rounded-lg hover:bg-pink transition-colors"
      >
        {t("common.go_home")}
      </Link>
    </div>
  );
}
