import type { BlogPost } from "../types";
import api from "./client";

export async function getLatestBlogPosts(limit = 3, signal?: AbortSignal): Promise<BlogPost[]> {
  const response = await api.get<BlogPost[]>("/blog/posts/", {
    params: { limit },
    signal,
  });
  return response.data;
}
