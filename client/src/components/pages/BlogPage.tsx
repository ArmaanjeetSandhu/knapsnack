import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { formatDate } from "../../lib/utils";
import api from "../../services/api";
import type { BlogPost } from "../../services/api";
import LoadingSpinner from "../common/LoadingSpinner";
import { Card, CardDescription, CardHeader, CardTitle } from "../ui/card";

interface BlogPostListItem extends BlogPost {
  id?: string;
  thumbnail?: string;
  published_date?: string;
}

const BlogPage = () => {
  const [posts, setPosts] = useState<BlogPostListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const data = await api.getBlogPosts();
        setPosts(data as BlogPostListItem[]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load posts");
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  if (loading) return <LoadingSpinner message="Loading posts..." />;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="mb-8 text-center text-4xl font-bold">
        The Knap[Snack] Blog
      </h1>
      <div className="space-y-6">
        {posts.length > 0 ? (
          posts.map((post) => (
            <Link
              to={`/blog/${post.slug}`}
              key={post.id ?? post.slug}
              state={{ from: "blog" }}
              className="block hover:no-underline"
            >
              <Card className="overflow-hidden transition-colors hover:border-primary">
                {post.thumbnail && (
                  <div className="h-60 w-full overflow-hidden">
                    <img
                      src={post.thumbnail}
                      alt={post.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                <CardHeader className="p-4">
                  <CardTitle className="text-3xl">{post.title}</CardTitle>
                  <CardDescription>
                    {formatDate(post.published_date ?? post.publishedAt)}
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))
        ) : (
          <p>No blog posts found.</p>
        )}
      </div>
    </div>
  );
};

export default BlogPage;
