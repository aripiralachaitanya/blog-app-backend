import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../store/authStore";
import {
  pageWrapper,
  section,
  pageTitleClass,
  headingClass,
  subHeadingClass,
  bodyText,
  mutedText,
  articleGrid,
  cardClass,
  articleTitle,
  articleExcerpt,
  articleMeta,
  articleBody,
  timestampClass,
  tagClass,
  ghostBtn,
  primaryBtn,
  secondaryBtn,
  loadingClass,
  errorClass,
  emptyStateClass,
  divider,
} from "../styles/common";

function Articles() {
  const navigate = useNavigate();
  const user = useAuth((state) => state.currentUser);

  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    if (!user) return;

    const getArticles = async () => {
      setLoading(true);

      try {
        const res = await axios.get("http://localhost:4000/user-api/articles", {
          withCredentials: true,
        });

        setArticles(res.data.payload || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load articles");
      } finally {
        setLoading(false);
      }
    };

    getArticles();
  }, [user]);

  const categories = useMemo(() => {
    const uniqueCategories = [
      ...new Set(articles.map((article) => article.category)),
    ];
    return ["All", ...uniqueCategories];
  }, [articles]);

  const filteredArticles = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return articles.filter((article) => {
      const matchesCategory =
        activeCategory === "All" || article.category === activeCategory;
      const matchesSearch =
        normalizedSearch.length === 0 ||
        [article.title, article.category, article.content]
          .join(" ")
          .toLowerCase()
          .includes(normalizedSearch);

      return matchesCategory && matchesSearch;
    });
  }, [articles, activeCategory, searchTerm]);

  const featuredArticle = filteredArticles[0] || articles[0] || null;
  const remainingArticles = featuredArticle
    ? filteredArticles.filter((article) => article._id !== featuredArticle._id)
    : filteredArticles;

  const openArticle = (article) => {
    navigate(`/article/${article._id}`, { state: article });
  };

  const formatDate = (value) => {
    return new Date(value).toLocaleDateString("en-IN", {
      timeZone: "Asia/Kolkata",
      dateStyle: "medium",
    });
  };

  if (!user) {
    return (
      <div className={pageWrapper}>
        <div className={`${section} text-center py-20`}>
          <p className={tagClass}>Discovery</p>
          <h1 className={`${pageTitleClass} mt-3`}>Read the latest articles</h1>
          <p className={`${bodyText} mt-4 max-w-2xl mx-auto`}>
            Sign in to browse the latest active articles, open full posts, and
            join the discussion.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={pageWrapper}>
      <section className={section}>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className={tagClass}>Articles</p>
            <h1 className={`${pageTitleClass} mt-3`}>
              Discover active stories
            </h1>
            <p className={`${bodyText} mt-4`}>
              Browse the latest active articles, filter by topic, and jump into
              the full story with one click.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 min-w-60">
            <div className="bg-[#f5f5f7] rounded-2xl p-4">
              <p className={mutedText}>Visible</p>
              <p className="text-2xl font-semibold text-[#1d1d1f] mt-1">
                {articles.length}
              </p>
            </div>
            <div className="bg-[#f5f5f7] rounded-2xl p-4">
              <p className={mutedText}>Topics</p>
              <p className="text-2xl font-semibold text-[#1d1d1f] mt-1">
                {Math.max(categories.length - 1, 0)}
              </p>
            </div>
            <div className="bg-[#f5f5f7] rounded-2xl p-4">
              <p className={mutedText}>Shown</p>
              <p className="text-2xl font-semibold text-[#1d1d1f] mt-1">
                {filteredArticles.length}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className={section}>
        <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
          <label className="block">
            <span className={mutedText}>Search</span>
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search articles, categories, or content"
              className="mt-2 w-full bg-[#f5f5f7] border border-[#e8e8ed] rounded-2xl px-4 py-3 text-sm text-[#1d1d1f] placeholder:text-[#a1a1a6] focus:outline-none focus:border-[#0066cc]"
            />
          </label>

          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={
                  category === activeCategory
                    ? primaryBtn
                    : secondaryBtn + " text-xs"
                }
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {loading && <p className={loadingClass}>Loading articles...</p>}
      {error && <p className={errorClass}>{error}</p>}

      {!loading && !error && featuredArticle && (
        <section className={section}>
          <div className="bg-[#f5f5f7] rounded-4xl p-8 lg:p-10 border border-[#e8e8ed]">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-3xl">
                <p className={tagClass}>Featured</p>
                <h2 className={`${headingClass} mt-2`}>
                  {featuredArticle.title}
                </h2>
                <div className="flex flex-wrap items-center gap-3 mt-4 text-sm text-[#6e6e73]">
                  <span>{featuredArticle.category}</span>
                  <span>•</span>
                  <span>{formatDate(featuredArticle.createdAt)}</span>
                </div>
                <p className={`${articleBody} mt-5 max-w-2xl`}>
                  {featuredArticle.content}
                </p>
              </div>

              <button
                type="button"
                onClick={() => openArticle(featuredArticle)}
                className={ghostBtn}
              >
                Read full article →
              </button>
            </div>
          </div>
        </section>
      )}

      <div className={divider} />

      <section className={section}>
        {remainingArticles.length === 0 && !loading ? (
          <div className={emptyStateClass}>
            No articles match your current filters.
          </div>
        ) : (
          <div className={articleGrid}>
            {remainingArticles.map((article) => (
              <article
                key={article._id}
                className={`${cardClass} min-h-65 justify-between`}
              >
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className={tagClass}>{article.category}</span>
                    <span className={timestampClass}>
                      {formatDate(article.createdAt)}
                    </span>
                  </div>

                  <h3 className={articleTitle}>{article.title}</h3>
                  <p className={articleExcerpt}>{article.content}</p>
                </div>

                <div className="pt-5 flex items-center justify-between gap-4">
                  <p className={articleMeta}>Active article</p>
                  <button
                    type="button"
                    onClick={() => openArticle(article)}
                    className={ghostBtn}
                  >
                    Open
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Articles;
