"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";

interface MarkdownPreviewProps {
  content: string;
}

export function MarkdownPreview({ content }: MarkdownPreviewProps) {
  return (
    <div className="prose prose-invert prose-p:leading-relaxed prose-pre:p-0 max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || "");
            return !inline && match ? (
              <SyntaxHighlighter
                {...props}
                style={atomDark}
                language={match[1]}
                PreTag="div"
                className="rounded-lg !my-4 !bg-[#121216] border border-white/10"
                customStyle={{ padding: "1.25rem", margin: 0, background: "transparent" }}
              >
                {String(children).replace(/\n$/, "")}
              </SyntaxHighlighter>
            ) : (
              <code {...props} className="bg-white/10 text-primary px-1.5 py-0.5 rounded-md text-sm font-mono">
                {children}
              </code>
            );
          },
          table({ children, ...props }) {
            return (
              <div className="overflow-x-auto my-6 rounded-lg border border-white/10">
                <table className="w-full text-left border-collapse" {...props}>
                  {children}
                </table>
              </div>
            );
          },
          th({ children, ...props }) {
            return <th className="bg-white/5 px-4 py-3 border-b border-white/10 text-white/90 font-semibold" {...props}>{children}</th>;
          },
          td({ children, ...props }) {
            return <td className="px-4 py-3 border-b border-white/5 text-white/70" {...props}>{children}</td>;
          },
          a({ children, ...props }) {
            return <a className="text-primary hover:text-primary/80 transition-colors underline underline-offset-4" {...props}>{children}</a>;
          },
          blockquote({ children, ...props }) {
            return <blockquote className="border-l-4 border-primary/50 bg-primary/5 px-4 py-2 text-white/70 rounded-r-lg my-4" {...props}>{children}</blockquote>;
          }
        }}
      >
        {content || "*No content provided...*"}
      </ReactMarkdown>
    </div>
  );
}
