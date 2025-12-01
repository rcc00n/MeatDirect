import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Link, useParams } from "react-router-dom";

import { getBlogPost, getLatestBlogPosts } from "../api/blog";
import BlogCard from "../components/blog/BlogCard";
import type { BlogPost, BlogPostDetail } from "../types";

function formatPublishedDate(date?: string) {
  if (!date) return "Fresh";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "Fresh";
  return parsed.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" });
}

function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPostDetail | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    setPost(null);

    getBlogPost(slug, controller.signal)
      .then((result) => setPost(result))
      .catch((fetchError) => {
        if (controller.signal.aborted) return;
        console.error("Failed to fetch blog post", fetchError);
        setError("We could not find that post. Try another story from the blog.");
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [slug]);

  useEffect(() => {
    const controller = new AbortController();

    getLatestBlogPosts(3, controller.signal)
      .then((posts) => {
        if (slug) {
          setRelatedPosts(posts.filter((item) => item.slug !== slug).slice(0, 3));
        } else {
          setRelatedPosts(posts.slice(0, 3));
        }
      })
      .catch((fetchError) => {
        if (controller.signal.aborted) return;
        console.error("Failed to load related posts", fetchError);
      });

    return () => controller.abort();
  }, [slug]);

  const authorLabel = post?.author?.trim() || "MeatDirect Team";

  const renderContent = () => {
    if (!post?.content) return null;
    const hasHtml = /<\/?[a-z][\s\S]*>/i.test(post.content);

    if (hasHtml) {
      return <div className="blog-post__content" dangerouslySetInnerHTML={{ __html: post.content }} />;
    }

    return (
      <div className="blog-post__content">
        {post.content
          .split(/\n{2,}/)
          .filter(Boolean)
          .map((block, index) => (
            <p key={index}>{block.trim()}</p>
          ))}
      </div>
    );
  };

  return (
    <div className="landing-page bg-black text-white">
      <section className="landing-section bg-gradient-to-br from-black via-red-950 to-black border-b-2 border-red-600 py-12 md:py-16">
        <div className="w-full max-w-[1100px] mx-auto px-4 md:px-8 lg:px-14 space-y-6">
          <div className="flex items-center justify-between gap-3">
            <Link to="/blog" className="inline-flex items-center gap-2 text-sm text-gray-200 hover:text-white">
              <ArrowLeft size={16} />
              Back to blog
            </Link>
            <span className="rounded-full border border-red-900 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]">
              Butcher journal
            </span>
          </div>

          <div className="space-y-4">
            <p className="text-red-400 uppercase tracking-[0.2em] text-xs">Story • Sourcing & cooking</p>
            <h1 className="text-4xl md:text-5xl font-semibold leading-tight">{post?.title || "Loading story..."}</h1>
            <div className="flex flex-wrap gap-2 text-sm text-gray-300">
              <span className="rounded-full border border-red-900/70 bg-white/10 px-3 py-1">
                {formatPublishedDate(post?.published_at)}
              </span>
              <span className="rounded-full border border-red-900/70 bg-white/10 px-3 py-1">By {authorLabel}</span>
              <span className="rounded-full border border-red-900/70 bg-white/10 px-3 py-1">Hormone-free sourcing</span>
            </div>
            {post?.excerpt && <p className="text-gray-300 max-w-3xl">{post.excerpt}</p>}
            {!post && loading && <p className="text-gray-400">Our team is prepping this story...</p>}
          </div>
        </div>
      </section>

      <section className="landing-section bg-white text-black pb-16 -mt-8">
        <div className="w-full max-w-[1100px] mx-auto px-4 md:px-8 lg:px-14 space-y-10">
          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
              {error}{" "}
              <Link to="/blog" className="font-semibold text-red-700 underline">
                Browse all posts
              </Link>
            </div>
          )}

          {loading && (
            <div className="space-y-4 rounded-3xl border border-gray-200 bg-gray-50 p-6 shadow-inner animate-pulse">
              <div className="h-10 w-2/3 rounded bg-gray-200" />
              <div className="h-4 w-1/2 rounded bg-gray-200" />
              <div className="h-64 rounded-2xl bg-gray-200" />
              <div className="h-4 w-full rounded bg-gray-200" />
              <div className="h-4 w-3/4 rounded bg-gray-200" />
              <div className="h-4 w-2/3 rounded bg-gray-200" />
            </div>
          )}

          {post && (
            <article className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-2xl">
              {post.cover_image_url && (
                <div className="relative h-[360px] w-full overflow-hidden">
                  <img src={post.cover_image_url} alt={post.title} className="h-full w-full object-cover" />
                  <span className="absolute left-4 top-4 rounded-full bg-black/70 px-3 py-1 text-xs font-semibold text-white shadow-lg backdrop-blur">
                    Feature story
                  </span>
                </div>
              )}

              <div className="space-y-6 p-6 md:p-10">
                <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                  <span className="rounded-full bg-gray-100 px-3 py-1 font-semibold text-gray-700">
                    Published {formatPublishedDate(post.published_at)}
                  </span>
                  <span className="rounded-full bg-gray-100 px-3 py-1 font-semibold text-gray-700">By {authorLabel}</span>
                  <span className="rounded-full bg-red-50 px-3 py-1 font-semibold text-red-700">Farm-direct</span>
                </div>

                <h1 className="text-3xl md:text-4xl font-semibold leading-tight text-black">{post.title}</h1>
                {post.excerpt && <p className="text-lg text-gray-700">{post.excerpt}</p>}

                {renderContent()}

                <div className="grid gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 md:grid-cols-[1fr_auto] md:items-center">
                  <div>
                    <div className="text-red-700 font-semibold">Ready to put this story to work?</div>
                    <p className="text-sm text-gray-800 mt-1">
                      Add the cuts you just read about, or explore similar products in the shop and Good to Know
                      library.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Link
                      to="/menu"
                      className="rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition-colors"
                    >
                      Shop the menu
                    </Link>
                    <Link
                      to="/good-to-know"
                      className="rounded-lg border border-black px-4 py-2 text-sm font-semibold text-black hover:border-red-200 hover:text-red-700 transition-colors"
                    >
                      Cooking temps
                    </Link>
                  </div>
                </div>
              </div>
            </article>
          )}

          {relatedPosts.length > 0 && (
            <section className="space-y-4">
              <div className="flex flex-col md:flex-row items-start justify-between gap-3">
                <div>
                  <p className="text-red-600 uppercase tracking-wider text-sm">Related posts</p>
                  <h3 className="text-2xl font-semibold">Keep reading from the butcher block</h3>
                </div>
                <Link to="/blog" className="inline-flex items-center gap-2 text-red-700 font-semibold">
                  All posts
                  <ArrowRight size={16} />
                </Link>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                {relatedPosts.map((related) => (
                  <BlogCard key={related.id} post={related} />
                ))}
              </div>
            </section>
          )}
        </div>
      </section>

      <section className="landing-section bg-black text-white py-12 border-t-2 border-red-600">
        <div className="w-full max-w-[1100px] mx-auto px-4 md:px-8 lg:px-14 flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="space-y-2">
            <p className="text-red-400 uppercase tracking-[0.2em] text-xs">One crew, two wins</p>
            <h3 className="text-3xl font-semibold">Order meat from the team who wrote this guide.</h3>
            <p className="text-gray-300">
              No agencies, no filler—just the butchers, packers, and delivery crew sharing what they cook at home.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/menu"
              className="rounded-lg bg-white px-6 py-3 text-sm font-semibold text-black hover:bg-red-50 transition-colors"
            >
              Shop the lineup
            </Link>
            <Link
              to="/contact"
              className="rounded-lg border-2 border-white px-6 py-3 text-sm font-semibold text-white hover:bg-white hover:text-black transition-colors"
            >
              Talk to us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default BlogPostPage;
