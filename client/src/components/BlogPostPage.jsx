import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import { BLOCKS } from "@contentful/rich-text-types";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import { Button } from "./ui/button";

const renderOptions = {
  renderNode: {
    [BLOCKS.HEADING_2]: (node, children) => (
      <h2 className="text-2xl font-bold mt-6 mb-2">{children}</h2>
    ),
    [BLOCKS.HEADING_3]: (node, children) => (
      <h3 className="text-xl font-bold mt-4 mb-2">{children}</h3>
    ),
    [BLOCKS.PARAGRAPH]: (node, children) => <p className="mb-4">{children}</p>,
    [BLOCKS.UL_LIST]: (node, children) => (
      <ul className="list-disc list-inside mb-4">{children}</ul>
    ),
    [BLOCKS.OL_LIST]: (node, children) => (
      <ol className="list-decimal list-inside mb-4">{children}</ol>
    ),
    [BLOCKS.LIST_ITEM]: (node, children) => (
      <li className="ml-4 mb-2">{children}</li>
    ),
  },
};

const BlogPostPage = () => {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const data = await api.getBlogPost(slug);
        setPost(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [slug]);

  const handleBackToBlog = () => {
    if (location.state?.from === "blog") {
      navigate(-1); // Go back in history if we came from the blog list
    } else {
      navigate("/blog"); // Otherwise push /blog (e.g., direct link access)
    }
  };

  if (loading) return <div>Loading post...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!post) return <div>Post not found.</div>;

  return (
    <article className="max-w-3xl mx-auto">
      <Button onClick={handleBackToBlog} variant="outline" className="mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Blog
      </Button>
      <h1 className="text-4xl font-bold mb-2">{post.title}</h1>
      <p className="text-muted-foreground mb-8">
        Published on {new Date(post.published_date).toLocaleDateString()}
      </p>
      <div className="prose dark:prose-invert max-w-none">
        {documentToReactComponents(post.content, renderOptions)}
      </div>
    </article>
  );
};

export default BlogPostPage;
