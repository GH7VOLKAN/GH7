"use client";

import { useState, useMemo, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Search,
  Plus,
  Compass,
  Pencil,
  Trash2,
  Loader2,
  Check,
  X,
} from "lucide-react";
import { EmptyState } from "@/components/panel/empty-state";
import type { PromptItemData } from "@/lib/dal/prompts";
import type { PlatformKey } from "@/lib/types";
import { useRouter } from "next/navigation";
import { AIPlatformIcon } from "@/components/ui/ai-platform-badge";
import type { AIPlatform } from "@/components/ui/ai-platform-badge";

// ---------------------------------------------------------------------------
// Provider config
// ---------------------------------------------------------------------------

const PROVIDERS: {
  key: PlatformKey;
  label: string;
  color: string;
}[] = [
  { key: "chatgpt", label: "ChatGPT", color: "#10A37F" },
  { key: "gemini", label: "Gemini", color: "#8B5CF6" },
  { key: "perplexity", label: "Perplexity", color: "#22D3EE" },
  { key: "google_aio", label: "AI Overview", color: "#4285F4" },
  { key: "claude", label: "Claude", color: "#D97706" },
];

function ProviderDot({ color }: { color: string }) {
  return (
    <span
      className="inline-block size-2.5 rounded-full"
      style={{ backgroundColor: color }}
    />
  );
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AramalarContentProps {
  promptItems: PromptItemData[];
  activeCount: number;
  brandId: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AramalarContent({
  promptItems,
  activeCount,
  brandId,
}: AramalarContentProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Add prompt
  const [addOpen, setAddOpen] = useState(false);
  const [addText, setAddText] = useState("");
  const [adding, setAdding] = useState(false);

  // Edit prompt
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [saving, setSaving] = useState(false);

  // Discover
  const [discoveryOpen, setDiscoveryOpen] = useState(false);
  const [discovering, setDiscovering] = useState(false);

  // Delete
  const [deleting, setDeleting] = useState<string | null>(null);

  // Bulk delete
  const [bulkDeleting, setBulkDeleting] = useState(false);

  // Categories from actual data
  const categories = useMemo(() => {
    const cats = new Set<string>();
    for (const item of promptItems) {
      if (item.category) cats.add(item.category);
    }
    return [
      { value: "all", label: "Tümü" },
      ...Array.from(cats).map((c) => ({
        value: c,
        label: c.charAt(0).toUpperCase() + c.slice(1),
      })),
    ];
  }, [promptItems]);

  // Filtered prompts
  const filteredPrompts = useMemo(() => {
    return promptItems.filter((item) => {
      if (
        searchQuery &&
        !item.text.toLowerCase().includes(searchQuery.toLowerCase())
      )
        return false;
      if (categoryFilter !== "all" && item.category !== categoryFilter)
        return false;
      return true;
    });
  }, [promptItems, searchQuery, categoryFilter]);

  // Handlers
  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (selectedIds.size === filteredPrompts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredPrompts.map((p) => p.id)));
    }
  }

  async function handleAddPrompt() {
    if (!addText.trim()) return;
    setAdding(true);
    try {
      const res = await fetch("/api/panel/prompts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: addText.trim() }),
      });
      if (res.ok) {
        setAddText("");
        setAddOpen(false);
        startTransition(() => router.refresh());
      }
    } catch {
      // handle silently
    } finally {
      setAdding(false);
    }
  }

  async function handleEditPrompt(id: string) {
    if (!editText.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/panel/prompts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: editText.trim() }),
      });
      if (res.ok) {
        setEditingId(null);
        setEditText("");
        startTransition(() => router.refresh());
      }
    } catch {
      // handle silently
    } finally {
      setSaving(false);
    }
  }

  async function handleDeletePrompt(id: string) {
    setDeleting(id);
    try {
      const res = await fetch(`/api/panel/prompts/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setSelectedIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
        startTransition(() => router.refresh());
      }
    } catch {
      // handle silently
    } finally {
      setDeleting(null);
    }
  }

  async function handleBulkDelete() {
    setBulkDeleting(true);
    try {
      const ids = Array.from(selectedIds);
      await Promise.all(
        ids.map((id) =>
          fetch(`/api/panel/prompts/${id}`, { method: "DELETE" }),
        ),
      );
      setSelectedIds(new Set());
      startTransition(() => router.refresh());
    } catch {
      // handle silently
    } finally {
      setBulkDeleting(false);
    }
  }

  async function handleDiscover() {
    setDiscovering(true);
    try {
      const res = await fetch("/api/panel/prompts/discover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (res.ok) {
        setDiscoveryOpen(false);
        startTransition(() => router.refresh());
      }
    } catch {
      // handle silently
    } finally {
      setDiscovering(false);
    }
  }

  // Format date relative
  function formatDate(iso: string): string {
    const date = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return "Az önce";
    if (diffHours < 24) return `${diffHours} saat önce`;
    if (diffDays < 7) return `${diffDays} gün önce`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} hafta önce`;
    return date.toLocaleDateString("tr-TR");
  }

  if (promptItems.length === 0) {
    return (
      <div className="space-y-6">
        <EmptyState
          icon={Search}
          title="Henüz arama eklemediniz"
          description="Takip etmek istediğiniz aramaları ekleyerek başlayın."
          action={
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setAddOpen(true)}
                className="flex items-center gap-1.5 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
              >
                <Plus className="size-4" />
                Arama Ekle
              </button>
              <button
                type="button"
                onClick={() => setDiscoveryOpen(true)}
                className="flex items-center gap-1.5 rounded-lg border border-black bg-white px-4 py-2 text-sm font-medium text-black hover:bg-gray-50"
              >
                <Compass className="size-4" />
                Keşfet
              </button>
            </div>
          }
        />

        {/* Add prompt dialog */}
        <AddPromptDialog
          open={addOpen}
          onOpenChange={setAddOpen}
          text={addText}
          setText={setAddText}
          adding={adding}
          onAdd={handleAddPrompt}
        />

        {/* Discover dialog */}
        <DiscoverDialog
          open={discoveryOpen}
          onOpenChange={setDiscoveryOpen}
          discovering={discovering}
          onDiscover={handleDiscover}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top bar */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 transition-shadow hover:shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative min-w-[220px] flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Arama ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-4 text-sm outline-none focus:border-gray-400"
            />
          </div>

          {/* Category chips */}
          <div className="flex items-center gap-1">
            {categories.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => setCategoryFilter(cat.value)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  categoryFilter === cat.value
                    ? "bg-black text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Buttons */}
          <button
            type="button"
            onClick={() => setAddOpen(true)}
            className="flex items-center gap-1.5 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            <Plus className="size-4" />
            Arama Ekle
          </button>

          <button
            type="button"
            onClick={() => setDiscoveryOpen(true)}
            className="flex items-center gap-1.5 rounded-lg border border-black bg-white px-4 py-2 text-sm font-medium text-black hover:bg-gray-50"
          >
            <Compass className="size-4" />
            Keşfet
          </button>
        </div>
      </div>

      {/* Prompt list table */}
      <div className="rounded-xl border border-gray-200 bg-white transition-shadow hover:shadow-sm">
        {/* Table header */}
        <div className="grid grid-cols-[40px_1fr_120px_120px_80px] items-center gap-2 border-b border-gray-100 px-4 py-3 text-xs font-medium text-gray-500">
          <div className="flex items-center justify-center">
            <Checkbox
              checked={
                filteredPrompts.length > 0 &&
                selectedIds.size === filteredPrompts.length
              }
              onCheckedChange={toggleSelectAll}
            />
          </div>
          <div>Arama</div>
          <div>Platformlar</div>
          <div>Eklendi</div>
          <div className="text-right">İşlemler</div>
        </div>

        {/* Rows */}
        {filteredPrompts.map((item) => (
          <div
            key={item.id}
            className="grid grid-cols-[40px_1fr_120px_120px_80px] items-center gap-2 border-b border-gray-50 px-4 py-3 text-sm transition-colors hover:bg-gray-50"
          >
            <div className="flex items-center justify-center">
              <Checkbox
                checked={selectedIds.has(item.id)}
                onCheckedChange={() => toggleSelect(item.id)}
              />
            </div>
            <div className="min-w-0">
              {editingId === item.id ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="flex-1 rounded border border-gray-300 px-2 py-1 text-sm outline-none focus:border-gray-500"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleEditPrompt(item.id);
                      if (e.key === "Escape") {
                        setEditingId(null);
                        setEditText("");
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => handleEditPrompt(item.id)}
                    disabled={saving}
                    className="rounded p-1 text-green-600 hover:bg-green-50"
                  >
                    {saving ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <Check className="size-3.5" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(null);
                      setEditText("");
                    }}
                    className="rounded p-1 text-gray-400 hover:bg-gray-100"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              ) : (
                <div>
                  <p className="truncate font-medium text-gray-900">
                    {item.text}
                  </p>
                  {item.tags.length > 0 && (
                    <div className="mt-0.5 flex gap-1">
                      {item.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-500"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Provider icons showing which platforms mentioned brand */}
            <div className="flex items-center gap-1">
              {PROVIDERS.map((provider) => {
                const mentioned = item.modelResults[provider.key];
                return (
                  <span
                    key={provider.key}
                    className={`inline-flex ${!mentioned ? "opacity-20" : ""}`}
                    title={provider.label}
                  >
                    <AIPlatformIcon platform={provider.key as AIPlatform} size={16} colored />
                  </span>
                );
              })}
            </div>

            {/* Created date */}
            <div className="text-xs text-gray-500">
              {formatDate(item.createdAt)}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-1">
              <button
                type="button"
                onClick={() => {
                  setEditingId(item.id);
                  setEditText(item.text);
                }}
                className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <Pencil className="size-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleDeletePrompt(item.id)}
                disabled={deleting === item.id}
                className="rounded-md p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
              >
                {deleting === item.id ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Trash2 className="size-3.5" />
                )}
              </button>
            </div>
          </div>
        ))}

        {filteredPrompts.length === 0 && (
          <div className="px-4 py-12 text-center text-sm text-gray-400">
            Aramanızla eşleşen sonuç bulunamadı.
          </div>
        )}

        {/* Bulk action bar */}
        {selectedIds.size > 0 && (
          <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
            <span className="text-sm text-gray-600">
              {selectedIds.size} seçili
            </span>
            <button
              type="button"
              onClick={handleBulkDelete}
              disabled={bulkDeleting}
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100"
            >
              {bulkDeleting ? "Siliniyor..." : "Toplu Sil"}
            </button>
          </div>
        )}
      </div>

      {/* Add prompt dialog */}
      <AddPromptDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        text={addText}
        setText={setAddText}
        adding={adding}
        onAdd={handleAddPrompt}
      />

      {/* Discover dialog */}
      <DiscoverDialog
        open={discoveryOpen}
        onOpenChange={setDiscoveryOpen}
        discovering={discovering}
        onDiscover={handleDiscover}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Add Prompt Dialog
// ---------------------------------------------------------------------------

function AddPromptDialog({
  open,
  onOpenChange,
  text,
  setText,
  adding,
  onAdd,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  text: string;
  setText: (v: string) => void;
  adding: boolean;
  onAdd: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Arama Ekle</DialogTitle>
          <DialogDescription>
            Takip etmek istediginiz aramayi girin.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Arama Metni *
            </label>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Ornek: En iyi yerden isitma sistemi hangisi?"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400"
              onKeyDown={(e) => {
                if (e.key === "Enter") onAdd();
              }}
            />
          </div>
          <button
            type="button"
            onClick={onAdd}
            disabled={adding || !text.trim()}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {adding ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Plus className="size-4" />
            )}
            {adding ? "Ekleniyor..." : "Arama Ekle"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Discover Dialog
// ---------------------------------------------------------------------------

function DiscoverDialog({
  open,
  onOpenChange,
  discovering,
  onDiscover,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  discovering: boolean;
  onDiscover: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Markanız İçin Arama Keşfet</DialogTitle>
          <DialogDescription>
            AI sektörünüze uygun aramalar oluşturur ve takip listenize ekler.
          </DialogDescription>
        </DialogHeader>
        <div className="rounded-lg border border-gray-100 bg-gray-50 p-4 text-sm text-gray-600">
          Bu işlem mevcut aramalarınızı yenileriyle değiştirecektir. AI,
          markanıza özel aramalar üretecektir.
        </div>
        <DialogFooter>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Vazgec
          </button>
          <button
            type="button"
            onClick={onDiscover}
            disabled={discovering}
            className="flex items-center gap-1.5 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {discovering ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Compass className="size-4" />
            )}
            {discovering ? "Keşfediliyor..." : "Aramaları Keşfet"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
