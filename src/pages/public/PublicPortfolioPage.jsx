import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { publicAPI } from "../../api/api";
import { profileAPI } from "../users/editorAPI";
import PublicPortfolioRenderer from "./PublicPortfolioRenderer";

export default function PublicPortfolioPage() {
  const { slug } = useParams();
  const [portfolio, setPortfolio] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let active = true;

    publicAPI
      .getPortfolio(slug)
      .then((res) => {
        if (!active) return;
        const data = res.data;
        setPortfolio(data);
        setProfile(data?.profile || null);
        if (data?.resumeId) {
          profileAPI
            .getPublic(data.resumeId)
            .then((nextProfile) => {
              if (active) setProfile(nextProfile);
            })
            .catch(() => {});
        }
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

  return <PublicPortfolioRenderer portfolio={portfolio} profile={profile} />;
}
