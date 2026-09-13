"use client";

import React, { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";

interface RichTextEditorProps {
  value?: Record<string, unknown> | null;
  onChange: (json: Record<string, unknown>) => void;
  placeholder?: string;
  minHeight?: string;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Write comprehensive, rich destination content...",
  minHeight = "240px",
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4] },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-amber-400 underline hover:text-amber-300",
        },
      }),
    ],
    content: value || { type: "doc", content: [] },
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON() as Record<string, unknown>);
    },
    editorProps: {
      attributes: {
        class: `prose prose-invert max-w-none p-4 focus:outline-none text-slate-200 text-sm leading-relaxed min-h-[${minHeight}]`,
      },
    },
  });

  useEffect(() => {
    if (editor && value && !editor.isFocused) {
      const current = editor.getJSON();
      if (JSON.stringify(current) !== JSON.stringify(value)) {
        editor.commands.setContent(value as any);
      }
    }
  }, [value, editor]);

  if (!editor) {
    return (
      <div className="h-40 rounded-xl bg-slate-950/60 border border-slate-800 animate-pulse flex items-center justify-center text-xs text-slate-500">
        Loading editor...
      </div>
    );
  }

  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("Enter URL:", previousUrl);

    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  return (
    <div className="rounded-2xl border border-slate-700/80 bg-slate-950/60 overflow-hidden focus-within:border-amber-500/80 transition-colors shadow-inner">
      {/* ── Toolbar ── */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-slate-800 bg-slate-900/80 text-xs text-slate-300">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`px-2.5 py-1 rounded font-bold transition-colors ${
            editor.isActive("bold")
              ? "bg-amber-500 text-slate-950"
              : "hover:bg-slate-800 text-slate-300"
          }`}
          title="Bold (Ctrl+B)"
        >
          B
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`px-2.5 py-1 rounded italic font-serif transition-colors ${
            editor.isActive("italic")
              ? "bg-amber-500 text-slate-950"
              : "hover:bg-slate-800 text-slate-300"
          }`}
          title="Italic (Ctrl+I)"
        >
          I
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`px-2 py-1 rounded line-through transition-colors ${
            editor.isActive("strike")
              ? "bg-amber-500 text-slate-950"
              : "hover:bg-slate-800 text-slate-300"
          }`}
          title="Strikethrough"
        >
          S
        </button>

        <div className="w-px h-4 bg-slate-700 mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`px-2 py-1 rounded font-semibold text-xs transition-colors ${
            editor.isActive("heading", { level: 2 })
              ? "bg-amber-500 text-slate-950"
              : "hover:bg-slate-800 text-slate-300"
          }`}
          title="Heading 2"
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`px-2 py-1 rounded font-semibold text-xs transition-colors ${
            editor.isActive("heading", { level: 3 })
              ? "bg-amber-500 text-slate-950"
              : "hover:bg-slate-800 text-slate-300"
          }`}
          title="Heading 3"
        >
          H3
        </button>

        <div className="w-px h-4 bg-slate-700 mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`px-2 py-1 rounded transition-colors ${
            editor.isActive("bulletList")
              ? "bg-amber-500 text-slate-950"
              : "hover:bg-slate-800 text-slate-300"
          }`}
          title="Bullet List"
        >
          • List
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`px-2 py-1 rounded transition-colors ${
            editor.isActive("orderedList")
              ? "bg-amber-500 text-slate-950"
              : "hover:bg-slate-800 text-slate-300"
          }`}
          title="Numbered List"
        >
          1. List
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`px-2 py-1 rounded transition-colors ${
            editor.isActive("blockquote")
              ? "bg-amber-500 text-slate-950"
              : "hover:bg-slate-800 text-slate-300"
          }`}
          title="Blockquote"
        >
          “ Quote
        </button>

        <div className="w-px h-4 bg-slate-700 mx-1" />

        <button
          type="button"
          onClick={setLink}
          className={`px-2 py-1 rounded transition-colors ${
            editor.isActive("link")
              ? "bg-amber-500 text-slate-950"
              : "hover:bg-slate-800 text-slate-300"
          }`}
          title="Add / Edit Link"
        >
          🔗 Link
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className="px-2 py-1 rounded hover:bg-slate-800 text-slate-300 transition-colors"
          title="Horizontal Divider"
        >
          ― Divider
        </button>
      </div>

      {/* ── Editor Canvas ── */}
      <div style={{ minHeight }}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
