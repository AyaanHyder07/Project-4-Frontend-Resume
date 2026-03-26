import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { publicAPI } from "../../api/api";
import TemplateRenderer from "../../templates/TemplateRenderer";

export default function PublicPortfolioPage() {
  const { slug } = useParams();
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let active = true;
    publicAPI
      .getPortfolio(slug)
      .then((res) => {
        if (active) setPortfolio(res.data);
      })
      .catch(() => {
        if (active) setNotFound(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [slug]);

  if (loading) return <div style={{ padding: "2rem" }}>Loading portfolio...</div>;
  if (notFound) return <div style={{ padding: "2rem" }}>Portfolio not found.</div>;
  if (!portfolio) return null;

  return <TemplateRenderer portfolio={portfolio} />;
}
