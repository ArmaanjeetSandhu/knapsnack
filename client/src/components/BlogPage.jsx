import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { Card, CardDescription, CardHeader, CardTitle } from "./ui/card";

const BlogPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const data = await api.getBlogPosts();
        setPosts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading posts...</p>
      </div>
    );
  if (error) return <div>Error: {error}</div>;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-8 text-center">
        The Knap[Snack] Blog
      </h1>
      <div className="space-y-6">
        {posts.length > 0 ? (
          posts.map((post) => (
            <Link
              to={`/blog/${post.slug}`}
              key={post.id}
              state={{ from: "blog" }}
              className="block hover:no-underline"
            >
              <Card className="hover:border-primary transition-colors overflow-hidden">
                {post.thumbnail && (
                  <div className="w-full h-60 overflow-hidden">
                    <img
                      src={post.thumbnail}
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardHeader className="p-4">
                  <CardTitle className="text-3xl">{post.title}</CardTitle>
                  <CardDescription>
                    {formatDate(post.published_date)}
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
