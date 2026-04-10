"use client";

import { useState } from "react";
import Link from "next/link";
import { PageBottomCTA } from "@/components/panel/page-bottom-cta";
import type { BlogPostData } from "@/lib/dal/blog";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  published: { label: "Yayında", color: "text-green-700", bg: "bg-green-50" },
  draft: { label: "Taslak", color: "text-amber-700", bg: "bg-amber-50" },
  queued: { label: "Kuyrukta", color: "text-blue-700", bg: "bg-blue-50" },
  generating: { label: "Üretiliyor", color: "text-purple-700", bg: "bg-purple-50" },
};

const ANALYSIS_TYPE_LABELS: Record<string, string> = {
  firma: "Firma",
  kisi: "Kişi",
  eticaret: "E-Ticaret",
  export: "Export",
};

interface Props {
  blogPosts: BlogPostData[];
}

export default function IcerikContent({ blogPosts }: Props) {
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filters = [
    { id: "all", label: "Tümü", count: blogPosts.length },
    { id: "draft", label: "Taslak", count: blogPosts.filter((p) => p.status === "draft").length },
    { id: "published", label: "Yayında", count: blogPosts.filter((p) => p.status === "published").length },
    { id: "queued", label: "Kuyrukta", count: blogPosts.filter((p) => p.status === "queued" || p.status === "generating").length },
  ];

  const filteredPosts =
    activeFilter === "all"
      ? blogPosts
      : activeFilter === "queued"
        ? blogPosts.filter((p) => p.status === "queued" || p.status === "generating")
        : blogPosts.filter((p) => p.status === activeFilter);

  const formatDate = (date: Date | null) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getWordCount = (content: string) => {
    return content.split(/\s+/).filter(Boolean).length;
  };

  const getPreview = (content: string) => {
    // Strip markdown headers and formatting
    const cleaned = content
      .replace(/#{1,6}\s+/g, "")
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .replace(/\*([^*]+)\*/g, "$1")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .trim();
    return cleaned.length > 250 ? cleaned.slice(0, 250) + "…" : cleaned;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Filters */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 mb-6">
        {filters.map((filter) => (
          <button
            key={filter.id}
            onClick={() => setActiveFilter(filter.id)}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeFilter === filter.id
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {filter.label}
            <span className="ml-1.5 text-xs text-gray-400">({filter.count})</span>
          </button>
        ))}
      </div>

      {/* Posts */}
      {filteredPosts.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-lg font-semibold">Bu kategoride içerik yok</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredPosts.map((post) => {
            const isExpanded = expandedId === post.id;
            const statusConfig = STATUS_CONFIG[post.status] ?? STATUS_CONFIG.draft;
            const wordCount = getWordCount(post.content);

            return (
              <div key={post.id} className="border border-gray-200 rounded-xl bg-white overflow-hidden">
                <button
                  onClick={() => setExpandedId(isExpanded ? null : post.id)}
                  className="w-full p-5 text-left"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="text-sm font-semibold text-gray-900 truncate">
                          {post.title}
                        </h3>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusConfig.color} ${statusConfig.bg}`}>
                          {statusConfig.label}
                        </span>
                        {post.sectorTag && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                            {post.sectorTag}
                          </span>
                        )}
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                          {ANALYSIS_TYPE_LABELS[post.analysisType] ?? post.analysisType}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-400">
                        <span>{wordCount.toLocaleString("tr-TR")} kelime</span>
                        <span>
                          {post.status === "published"
                            ? `Yayın: ${formatDate(post.publishedAt)}`
                            : `Oluşturulma: ${formatDate(post.createdAt)}`}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>

                {/* Expanded content preview */}
                {isExpanded && (
                  <div className="border-t border-gray-100 px-5 py-4 bg-gray-50/50">
                    <p className="text-sm text-gray-600 leading-relaxed mb-4">
                      {getPreview(post.content)}
                    </p>
                    <div className="flex items-center gap-2">
                      {post.status === "published" && (
                        <Link
                          href={`/blog/${post.slug}`}
                          className="px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition-colors"
                        >
                          Yazıyı Görüntüle
                        </Link>
                      )}
                      {post.status === "draft" && (
                        <button className="px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition-colors">
                          Taslağı İncele
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-12">
        <PageBottomCTA />
      </div>
    </div>
  );
}
