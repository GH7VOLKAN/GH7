"use client";

import ReactMarkdown from "react-markdown";

type Props = {
  text: string;
};

export function MarkdownView({ text }: Props) {
  // Citation notasyonunu ([1], [2]) gizle — okumayı bozuyor
  const cleaned = text.replace(/\[\d+\]/g, "");
  return (
    <div className="ai-answer-md">
      <ReactMarkdown>{cleaned}</ReactMarkdown>
    </div>
  );
}
