import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import { BLOCKS, MARKS } from "@contentful/rich-text-types";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { formatDate } from "../lib/utils";
import api from "../services/api";
import LoadingSpinner from "./LoadingSpinner";

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

    [BLOCKS.HEADING_2]: (_node, children) => (
      <h2 className="text-3xl font-bold mt-8 mb-4">{children}</h2>
    ),
    [BLOCKS.HEADING_3]: (_node, children) => (
      <h3 className="text-2xl font-bold mt-6 mb-3">{children}</h3>
    ),
    [BLOCKS.PARAGRAPH]: (_node, children) => (
      <p className="mb-4 leading-relaxed">{children}</p>
    ),

    [BLOCKS.UL_LIST]: (_node, children) => (
      <ul className="list-disc pl-6 mb-6 space-y-1">{children}</ul>
    ),
    [BLOCKS.OL_LIST]: (_node, children) => (
      <ol className="list-decimal pl-6 mb-6 space-y-1">{children}</ol>
    ),
    [BLOCKS.LIST_ITEM]: (_node, children) => (
      <li className="pl-1">{children}</li>
    ),

    [BLOCKS.QUOTE]: (_node, children) => (
      <blockquote className="border-l-4 border-primary pl-4 py-1 my-6 italic text-muted-foreground bg-muted/30 rounded-r-lg">
        {children}
      </blockquote>
    ),

    [BLOCKS.HR]: () => <hr className="my-8 border-border" />,

    [BLOCKS.TABLE]: (_node, children) => (
      <div className="overflow-x-auto my-8 rounded-lg border border-border">
        <table className="w-full text-sm text-left">
          <tbody>{children}</tbody>
        </table>
      </div>
    ),
    [BLOCKS.TABLE_ROW]: (_node, children) => (
      <tr className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
        {children}
      </tr>
    ),
    [BLOCKS.TABLE_HEADER_CELL]: (_node, children) => (
      <th className="px-4 py-3 font-medium bg-muted text-muted-foreground border-r border-border last:border-0">
        {children}
      </th>
    ),
    [BLOCKS.TABLE_CELL]: (_node, children) => (
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

  if (loading) return <LoadingSpinner message="Loading post..." />;
  if (error) return <div>Error: {error}</div>;
  if (!post) return <div>Post not found.</div>;

  return (
    <article className="max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-4">
        {post.title}
      </h1>
      <div className="text-muted-foreground mb-8 text-lg">
        <p>{formatDate(post.published_date)}</p>
      </div>
      <div className="prose dark:prose-invert max-w-none">
        {documentToReactComponents(post.content, renderOptions)}
      </div>
    </article>
  );
};

export default BlogPostPage;
