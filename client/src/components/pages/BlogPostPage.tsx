import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import { BLOCKS, MARKS } from "@contentful/rich-text-types";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { formatDate } from "../../lib/utils";
import api from "../../services/api";
import LoadingSpinner from "../common/LoadingSpinner";

import type { BlogPost } from "../../services/api";
import type { Options } from "@contentful/rich-text-react-renderer";

interface BlogPostDetail extends BlogPost {
  published_date?: string;
}

const renderOptions: Options = {
  renderMark: {
    [MARKS.BOLD]: (text) => <span className="font-bold">{text}</span>,
    [MARKS.ITALIC]: (text) => <span className="italic">{text}</span>,
    [MARKS.UNDERLINE]: (text) => <span className="underline">{text}</span>,
    [MARKS.CODE]: (text) => (
      <code className="bg-muted rounded px-1.5 py-0.5 font-mono text-sm">
        {text}
      </code>
    ),
  },
  renderNode: {
    [BLOCKS.EMBEDDED_ASSET]: (node) => {
      const fields = (
        node.data?.target as {
          fields?: { file?: { url?: string }; title?: string };
        }
      )?.fields;
      if (!fields?.file?.url) return null;
      return (
        <img
          src={fields.file.url}
          alt={fields.title ?? "Blog image"}
          className="border-border my-8 h-auto w-full rounded-lg border"
        />
      );
    },
    [BLOCKS.HEADING_2]: (_node, children) => (
      <h2 className="mt-8 mb-4 text-3xl font-bold">{children}</h2>
    ),
    [BLOCKS.HEADING_3]: (_node, children) => (
      <h3 className="mt-6 mb-3 text-2xl font-bold">{children}</h3>
    ),
    [BLOCKS.PARAGRAPH]: (_node, children) => (
      <p className="mb-4 leading-relaxed">{children}</p>
    ),
    [BLOCKS.UL_LIST]: (_node, children) => (
      <ul className="mb-6 list-disc space-y-1 pl-6">{children}</ul>
    ),
    [BLOCKS.OL_LIST]: (_node, children) => (
      <ol className="mb-6 list-decimal space-y-1 pl-6">{children}</ol>
    ),
    [BLOCKS.LIST_ITEM]: (_node, children) => (
      <li className="pl-1">{children}</li>
    ),
    [BLOCKS.QUOTE]: (_node, children) => (
      <blockquote className="border-primary bg-muted/30 text-muted-foreground my-6 rounded-r-lg border-l-4 py-1 pl-4 italic">
        {children}
      </blockquote>
    ),
    [BLOCKS.HR]: () => <hr className="border-border my-8" />,
    [BLOCKS.TABLE]: (_node, children) => (
      <div className="border-border my-8 overflow-x-auto rounded-lg border">
        <table className="w-full text-left text-sm">
          <tbody>{children}</tbody>
        </table>
      </div>
    ),
    [BLOCKS.TABLE_ROW]: (_node, children) => (
      <tr className="border-border hover:bg-muted/50 border-b transition-colors last:border-0">
        {children}
      </tr>
    ),
    [BLOCKS.TABLE_HEADER_CELL]: (_node, children) => (
      <th className="border-border bg-muted text-muted-foreground border-r px-4 py-3 font-medium last:border-0">
        {children}
      </th>
    ),
    [BLOCKS.TABLE_CELL]: (_node, children) => (
      <td className="border-border border-r px-4 py-3 last:border-0">
        {children}
      </td>
    ),
  },
};

const BlogPostPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPostDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    const fetchPost = async () => {
      try {
        const data = await api.getBlogPost(slug);
        setPost(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load post");
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
    <article className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-4 text-4xl font-extrabold tracking-tight lg:text-5xl">
        {post.title}
      </h1>
      <div className="text-muted-foreground mb-8 text-lg">
        <p>{formatDate(post.published_date ?? post.publishedAt)}</p>
      </div>
      <div className="prose dark:prose-invert max-w-none">
        {post.content != null &&
          documentToReactComponents(
            post.content as Parameters<typeof documentToReactComponents>[0],
            renderOptions,
          )}
      </div>
    </article>
  );
};

export default BlogPostPage;
