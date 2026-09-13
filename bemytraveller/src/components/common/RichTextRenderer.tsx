import React from "react";

interface RichTextRendererProps {
  content?: Record<string, unknown> | null;
  className?: string;
}

export default function RichTextRenderer({
  content,
  className = "",
}: RichTextRendererProps) {
  if (!content || !content.content || !Array.isArray(content.content)) {
    return null;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderNode = (node: any, index: number): React.ReactNode => {
    if (!node) return null;

    if (node.type === "text") {
      let element: React.ReactNode = node.text;

      if (node.marks) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        node.marks.forEach((mark: any) => {
          if (mark.type === "bold") {
            element = <strong key="b" className="font-semibold text-white">{element}</strong>;
          }
          if (mark.type === "italic") {
            element = <em key="i" className="italic">{element}</em>;
          }
          if (mark.type === "strike") {
            element = <s key="s" className="line-through">{element}</s>;
          }
          if (mark.type === "link") {
            element = (
              <a
                key="a"
                href={mark.attrs?.href}
                target={mark.attrs?.target || "_blank"}
                rel="noopener noreferrer"
                className="text-amber-400 underline hover:text-amber-300 transition-colors"
              >
                {element}
              </a>
            );
          }
        });
      }
      return <React.Fragment key={index}>{element}</React.Fragment>;
    }

    const children = node.content
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ? node.content.map((child: any, i: number) => renderNode(child, i))
      : null;

    switch (node.type) {
      case "paragraph":
        return (
          <p key={index} className="mb-4 leading-relaxed text-slate-300">
            {children || <br />}
          </p>
        );
      case "heading": {
        const level = node.attrs?.level || 2;
        if (level === 1) {
          return (
            <h1 key={index} className="text-3xl font-extrabold text-white mb-4 mt-6">
              {children}
            </h1>
          );
        }
        if (level === 2) {
          return (
            <h2 key={index} className="text-2xl font-bold text-white mb-3 mt-5">
              {children}
            </h2>
          );
        }
        if (level === 3) {
          return (
            <h3 key={index} className="text-xl font-semibold text-white mb-2 mt-4">
              {children}
            </h3>
          );
        }
        return (
          <h4 key={index} className="text-lg font-semibold text-white mb-2 mt-3">
            {children}
          </h4>
        );
      }
      case "bulletList":
        return (
          <ul key={index} className="list-disc list-inside space-y-1.5 mb-4 text-slate-300">
            {children}
          </ul>
        );
      case "orderedList":
        return (
          <ol key={index} className="list-decimal list-inside space-y-1.5 mb-4 text-slate-300">
            {children}
          </ol>
        );
      case "listItem":
        return (
          <li key={index} className="text-slate-300">
            {children}
          </li>
        );
      case "blockquote":
        return (
          <blockquote
            key={index}
            className="border-l-4 border-amber-500 pl-4 py-1 italic my-4 text-slate-400 bg-slate-900/40 rounded-r"
          >
            {children}
          </blockquote>
        );
      case "horizontalRule":
        return <hr key={index} className="my-6 border-slate-800" />;
      default:
        return <div key={index}>{children}</div>;
    }
  };

  return (
    <div className={`prose prose-invert max-w-none text-sm ${className}`}>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      {content.content.map((node: any, index: number) => renderNode(node, index))}
    </div>
  );
}
