import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";

const BlogPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

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

  if (loading) return <div>Loading posts...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <Button onClick={() => navigate(-1)} variant="outline" className="mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back
      </Button>
      <h1 className="text-4xl font-bold mb-8 text-center">Knap[Snack] Blog</h1>
      <div className="space-y-6">
        {posts.length > 0 ? (
          posts.map((post) => (
            <Link
              to={`/blog/${post.slug}`}
              key={post.id}
              state={{ from: "blog" }}
              className="block hover:no-underline"
            >
              <Card className="hover:border-primary transition-colors">
                <CardHeader>
                  <CardTitle>{post.title}</CardTitle>
                  <CardDescription>
                    Published on{" "}
                    {new Date(post.published_date).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p>{post.summary}</p>
                </CardContent>
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
