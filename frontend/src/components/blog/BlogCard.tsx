import { Link } from "react-router-dom";

import type { BlogPost } from "../../types";

type BlogCardProps = {
  post: BlogPost;
};

function formatPublishedDate(date?: string) {
  if (!date) return "Fresh";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "Fresh";
  return parsed.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function BlogCard({ post }: BlogCardProps) {
  const authorLabel = post.author?.trim() || "MeatDirect Team";
  const publishedLabel = formatPublishedDate(post.published_at);

  return (
    <Link to={`/blog/${post.slug}`} className="group block h-full">
      <article className="relative flex h-full flex-col overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-xl transition duration-200 hover:-translate-y-1 hover:shadow-2xl">
        <div className="relative h-52 w-full overflow-hidden bg-gradient-to-br from-red-950 via-black to-red-900">
          {post.cover_image_url ? (
            <img
              src={post.cover_image_url}
              alt={post.title}
              className="h-full w-full object-cover opacity-90 transition duration-300 group-hover:scale-105 group-hover:opacity-100"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-white/80">
              Butcher Journal
            </div>
          )}
          <div className="absolute left-4 top-4 flex items-center gap-2">
            <span className="rounded-full bg-black/70 px-3 py-1 text-xs font-semibold text-white shadow-lg backdrop-blur">
              {publishedLabel}
            </span>
            <span className="rounded-full border border-red-100 bg-white/90 px-3 py-1 text-xs font-semibold text-red-700 shadow">
              Field notes
            </span>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-3 p-6">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500">
            <span className="font-semibold text-gray-900">{authorLabel}</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-3 py-1 font-semibold text-red-700">
              Read more
            </span>
          </div>
          <h3 className="text-lg font-semibold leading-tight text-black">{post.title}</h3>
          {post.excerpt && <p className="text-sm text-gray-600">{post.excerpt}</p>}
          <div className="mt-auto inline-flex items-center gap-2 text-sm font-semibold text-red-700">
            <span className="inline-flex h-9 items-center justify-center rounded-full bg-black px-3 py-1 text-white shadow-sm">
              Journal
            </span>
            <span>Open story</span>
          </div>
        </div>
      </article>
    </Link>
  );
}

export default BlogCard;
