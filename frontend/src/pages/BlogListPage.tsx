import { useEffect, useState } from "react";
import { BookOpen, ArrowRight } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";

import { getBlogPosts } from "../api/blog";
import BlogCard from "../components/blog/BlogCard";
import type { BlogPost } from "../types";

const PAGE_SIZE = 6;

function BlogListPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();

  const pageParam = Number(searchParams.get("page") || 1);
  const page = Number.isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    getBlogPosts({ page, page_size: PAGE_SIZE }, controller.signal)
      .then((response) => {
        setPosts(response.results);
        setTotalCount(response.count);
      })
      .catch((fetchError) => {
        if (controller.signal.aborted) return;
        console.error("Failed to fetch blog posts", fetchError);
        setError("We could not load the blog right now. Please try again.");
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [page]);

  const handlePageChange = (nextPage: number) => {
    if (nextPage < 1 || nextPage > totalPages) return;
    const params = new URLSearchParams();
    if (nextPage > 1) {
      params.set("page", String(nextPage));
    }
    setSearchParams(params);
  };

  const featuredPost = posts[0];
  const heroTopics = ["Grass-fed guides", "Smoking basics", "Weeknight dinners", "Knife work"];

  return (
    <div className="landing-page bg-black text-white">
      <section className="landing-section bg-gradient-to-br from-black via-red-950 to-black border-b-2 border-red-600 py-16">
        <div className="w-full max-w-[1400px] mx-auto px-4 md:px-8 lg:px-14 grid lg:grid-cols-[1.05fr_0.95fr] gap-10 items-center">
          <div className="space-y-4">
            <p className="text-red-400 uppercase tracking-[0.2em] text-xs">Journal • MeatDirect</p>
            <h1 className="text-4xl md:text-5xl font-semibold leading-tight">
              From ranch to kitchen: cook with confidence.
            </h1>
            <p className="text-gray-300 max-w-2xl">
              Sourcing notes, grill guides, and step-by-step cooking walkthroughs written by the same crew that trims
              your orders. Everything stays practical, short, and focused on real-world kitchen wins.
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <Link
                to="/menu"
                className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
              >
                Shop the cuts
              </Link>
              <Link
                to="/good-to-know"
                className="border-2 border-white text-white px-6 py-3 rounded-lg hover:bg-white hover:text-black transition-colors"
              >
                Good to know
              </Link>
            </div>
            <div className="flex flex-wrap gap-2">
              {heroTopics.map((topic) => (
                <span key={topic} className="border border-red-900 bg-white/5 px-4 py-2 rounded-full text-sm">
                  {topic}
                </span>
              ))}
              <span className="bg-red-600 px-4 py-2 rounded-full text-sm">Editorial team</span>
            </div>
            <div className="grid sm:grid-cols-3 gap-3 pt-2">
              {[
                { label: "Published articles", value: loading ? "Loading..." : `${totalCount || posts.length}+` },
                { label: "Reading time", value: "Snackable 3-5 min" },
                { label: "Fresh drops", value: "Updated weekly" },
              ].map((stat) => (
                <div key={stat.label} className="border border-red-900 bg-white/5 rounded-2xl p-3">
                  <div className="text-sm text-gray-300">{stat.label}</div>
                  <div className="text-xl font-semibold text-white">{stat.value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative overflow-hidden rounded-3xl bg-white text-black p-8 border border-red-100 shadow-2xl space-y-5">
            <div className="absolute inset-0 bg-gradient-to-br from-red-50 via-white to-red-100 opacity-70" />
            <div className="relative space-y-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-red-600 uppercase tracking-[0.2em] text-xs">Featured story</p>
                  <h3 className="text-2xl font-semibold leading-tight">
                    {featuredPost ? featuredPost.title : "New stories are loading"}
                  </h3>
                </div>
                <span className="rounded-full bg-black px-3 py-1 text-xs font-semibold text-white">
                  {Math.min(page, totalPages)} / {totalPages}
                </span>
              </div>

              {featuredPost ? (
                <Link to={`/blog/${featuredPost.slug}`} className="grid gap-3 group">
                  <div className="relative h-52 w-full overflow-hidden rounded-2xl border border-gray-200">
                    {featuredPost.cover_image_url ? (
                      <img
                        src={featuredPost.cover_image_url}
                        alt={featuredPost.title}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-red-950 via-black to-red-900 text-white flex items-center justify-center font-semibold">
                        MeatDirect Journal
                      </div>
                    )}
                    <div className="absolute left-3 top-3 rounded-full bg-black/70 px-3 py-1 text-xs font-semibold text-white shadow-lg backdrop-blur">
                      Latest post
                    </div>
                  </div>
                  <p className="text-gray-700">
                    {featuredPost.excerpt || "Field notes from our butcher block and delivery crew."}
                  </p>
                  <div className="inline-flex items-center gap-2 text-red-700 font-semibold">
                    Read the story
                    <ArrowRight size={16} />
                  </div>
                </Link>
              ) : (
                <div className="space-y-3 animate-pulse">
                  <div className="h-10 w-3/4 rounded-xl bg-gray-200" />
                  <div className="h-52 rounded-2xl bg-gray-200" />
                  <div className="h-4 w-full rounded bg-gray-200" />
                  <div className="h-4 w-2/3 rounded bg-gray-200" />
                </div>
              )}

              <div className="rounded-2xl border border-red-200 bg-black text-white p-5 space-y-3">
                <div className="flex items-center gap-3">
                  <BookOpen className="text-red-300" size={18} />
                  <div className="font-semibold">Prefer quick answers?</div>
                </div>
                <p className="text-sm text-white/80">
                  Jump into Good to Know for sourcing standards, cooking temps, and FAQs that turn orders into easy wins.
                </p>
                <Link
                  to="/good-to-know"
                  className="inline-flex w-fit items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-red-50 transition-colors"
                >
                  Open knowledge base
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-section bg-white text-black py-16">
        <div className="w-full max-w-[1400px] mx-auto px-4 md:px-8 lg:px-14 space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-start gap-4">
            <div>
              <p className="text-red-600 uppercase tracking-wider text-sm">Latest posts</p>
              <h2 className="text-4xl font-semibold">Browse every story</h2>
              <p className="text-gray-600 mt-2">Sourcing explainers, grill basics, and weeknight inspiration.</p>
            </div>
            <div className="flex flex-wrap gap-2 text-sm">
              <span className="px-3 py-1 rounded-full bg-black text-white">
                {totalCount || posts.length} articles
              </span>
              <span className="px-3 py-1 rounded-full bg-red-50 text-red-700 border border-red-100">
                Page {Math.min(page, totalPages)} of {totalPages}
              </span>
              {loading && (
                <span className="px-3 py-1 rounded-full bg-gray-100 border border-gray-200 text-gray-600">
                  Loading...
                </span>
              )}
            </div>
          </div>

          {error && <div className="rounded-2xl border border-red-200 bg-red-50 text-red-700 px-4 py-3">{error}</div>}

          <div className="grid md:grid-cols-3 gap-6">
            {loading &&
              Array.from({ length: Math.min(PAGE_SIZE, 6) }).map((_, index) => (
                <div
                  key={index}
                  className="h-full rounded-3xl border border-gray-200 bg-gray-50 p-4 shadow-inner animate-pulse space-y-4"
                >
                  <div className="h-40 rounded-2xl bg-gray-200" />
                  <div className="h-4 w-3/4 rounded bg-gray-200" />
                  <div className="h-4 w-1/2 rounded bg-gray-200" />
                  <div className="h-4 w-full rounded bg-gray-200" />
                </div>
              ))}

            {!loading && posts.length === 0 && (
              <div className="md:col-span-3 rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-6 text-gray-700">
                No posts yet—our team is writing the first story now.
              </div>
            )}

            {!loading && posts.map((post) => <BlogCard key={post.id} post={post} />)}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={() => handlePageChange(page - 1)}
              disabled={page <= 1}
              className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-800 shadow-sm transition-colors disabled:cursor-not-allowed disabled:opacity-60 hover:border-red-200 hover:text-red-700"
            >
              Newer posts
            </button>
            <div className="text-sm font-semibold text-gray-600">
              Page {Math.min(page, totalPages)} of {totalPages}
            </div>
            <button
              type="button"
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= totalPages}
              className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-800 shadow-sm transition-colors disabled:cursor-not-allowed disabled:opacity-60 hover:border-red-200 hover:text-red-700"
            >
              Older posts
            </button>
          </div>
        </div>
      </section>

      <section className="landing-section bg-black text-white py-14 border-t-2 border-red-600">
        <div className="w-full max-w-[1400px] mx-auto px-4 md:px-8 lg:px-14 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <p className="text-red-400 uppercase tracking-[0.2em] text-xs">Ready to cook?</p>
            <h3 className="text-3xl font-semibold">Take the tips to the shop.</h3>
            <p className="text-gray-300 max-w-2xl">
              Build a cart from the same crew that writes these guides—local meat, smoked staples, and seafood ready to
              ship.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/menu"
              className="bg-white text-black px-6 py-3 rounded-lg hover:bg-red-50 transition-colors font-semibold"
            >
              Shop the menu
            </Link>
            <Link
              to="/large-cuts"
              className="border-2 border-white text-white px-6 py-3 rounded-lg hover:bg-white hover:text-black transition-colors font-semibold"
            >
              Large cuts
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default BlogListPage;
