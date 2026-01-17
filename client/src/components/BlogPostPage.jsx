import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import { BLOCKS, MARKS } from "@contentful/rich-text-types";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import { Button } from "./ui/button";

const renderOptions = {
  renderMark: {
    [MARKS.BOLD]: (text) => <span className="font-bold">{text}</span>,
    [MARKS.ITALIC]: (text) => <span className="italic">{text}</span>,
    [MARKS.UNDERLINE]: (text) => <span className="underline">{text}</span>,
    [MARKS.CODE]: (text) => (
      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">
        {text}
      </code>
    ),
  },
  renderNode: {
    [BLOCKS.EMBEDDED_ASSET]: (node) => {
      const fields = node.data?.target?.fields;
      if (!fields?.file?.url) return null;

      const imageUrl = fields.file.url;
      const altText = fields.title || "Blog image";

      return (
        <img
          src={imageUrl}
          alt={altText}
          className="w-full h-auto my-8 rounded-lg border border-border"
        />
      );
    },

    [BLOCKS.HEADING_2]: (node, children) => (
      <h2 className="text-3xl font-bold mt-8 mb-4">{children}</h2>
    ),
    [BLOCKS.HEADING_3]: (node, children) => (
      <h3 className="text-2xl font-bold mt-6 mb-3">{children}</h3>
    ),
    [BLOCKS.PARAGRAPH]: (node, children) => (
      <p className="mb-4 leading-relaxed">{children}</p>
    ),

    [BLOCKS.UL_LIST]: (node, children) => (
      <ul className="list-disc pl-6 mb-6 space-y-1">{children}</ul>
    ),
    [BLOCKS.OL_LIST]: (node, children) => (
      <ol className="list-decimal pl-6 mb-6 space-y-1">{children}</ol>
    ),
    [BLOCKS.LIST_ITEM]: (node, children) => (
      <li className="pl-1">{children}</li>
    ),

    [BLOCKS.QUOTE]: (node, children) => (
      <blockquote className="border-l-4 border-primary pl-4 py-1 my-6 italic text-muted-foreground bg-muted/30 rounded-r-lg">
        {children}
      </blockquote>
    ),

    [BLOCKS.HR]: () => <hr className="my-8 border-border" />,

    [BLOCKS.TABLE]: (node, children) => (
      <div className="overflow-x-auto my-8 rounded-lg border border-border">
        <table className="w-full text-sm text-left">
          <tbody>{children}</tbody>
        </table>
      </div>
    ),
    [BLOCKS.TABLE_ROW]: (node, children) => (
      <tr className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
        {children}
      </tr>
    ),
    [BLOCKS.TABLE_HEADER_CELL]: (node, children) => (
      <th className="px-4 py-3 font-medium bg-muted text-muted-foreground border-r border-border last:border-0">
        {children}
      </th>
    ),
    [BLOCKS.TABLE_CELL]: (node, children) => (
      <td className="px-4 py-3 border-r border-border last:border-0">
        {children}
      </td>
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
      navigate(-1);
    } else {
      navigate("/blog");
    }
  };

  if (loading) return <div>Loading post...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!post) return <div>Post not found.</div>;

  return (
    <article className="max-w-3xl mx-auto py-8 px-4">
      <Button onClick={handleBackToBlog} variant="outline" className="mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Blog
      </Button>
      <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-4">
        {post.title}
      </h1>
      <p className="text-muted-foreground mb-8 text-lg">
        Published on {new Date(post.published_date).toLocaleDateString()}
      </p>
      <div className="prose dark:prose-invert max-w-none">
        {documentToReactComponents(post.content, renderOptions)}
      </div>
    </article>
  );
};

export default BlogPostPage;
