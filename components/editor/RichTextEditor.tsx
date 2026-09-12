"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Placeholder } from "@tiptap/extensions";
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Undo,
  Redo,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect } from "react";

function ToolbarButton({
  onClick,
  active,
  disabled,
  label,
  icon: Icon,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  label: string;
  icon: React.ElementType;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-pressed={active}
      title={label}
      className={cn(
        "focus-ring flex h-7 w-7 items-center justify-center rounded-md text-muted hover:bg-neutral-soft hover:text-foreground disabled:opacity-40",
        active && "bg-brand-soft text-brand"
      )}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-border px-2 py-1.5" role="toolbar" aria-label="Formatting">
      <ToolbarButton label="Bold" icon={Bold} active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()} />
      <ToolbarButton label="Italic" icon={Italic} active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()} />
      <span className="mx-1 h-4 w-px bg-border" />
      <ToolbarButton label="Heading 1" icon={Heading1} active={editor.isActive("heading", { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} />
      <ToolbarButton label="Heading 2" icon={Heading2} active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} />
      <span className="mx-1 h-4 w-px bg-border" />
      <ToolbarButton label="Bullet list" icon={List} active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()} />
      <ToolbarButton label="Numbered list" icon={ListOrdered} active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()} />
      <ToolbarButton label="Quote" icon={Quote} active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()} />
      <ToolbarButton
        label="Link"
        icon={LinkIcon}
        active={editor.isActive("link")}
        onClick={() => {
          const url = window.prompt("Link URL");
          if (url) editor.chain().focus().setLink({ href: url }).run();
          else editor.chain().focus().unsetLink().run();
        }}
      />
      <span className="mx-1 h-4 w-px bg-border" />
      <ToolbarButton label="Undo" icon={Undo} onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} />
      <ToolbarButton label="Redo" icon={Redo} onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} />
    </div>
  );
}

export function RichTextEditor({
  content,
  onChange,
  placeholder = "Start writing…",
  editable = true,
}: {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  editable?: boolean;
}) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ link: { openOnClick: false } }),
      Placeholder.configure({ placeholder }),
    ],
    content,
    editable,
    immediatelyRender: false,
    editorProps: {
      attributes: { class: "prose-editor", "aria-label": "Content body" },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  useEffect(() => {
    editor?.setEditable(editable);
  }, [editor, editable]);

  // Keep editor content in sync when switching between content records
  // (e.g. navigating from one draft to another without unmounting).
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content, { emitUpdate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor]);

  if (!editor) {
    return <div className="h-64 animate-pulse rounded-lg bg-neutral-soft" />;
  }

  return (
    <div className="rounded-lg border border-border bg-surface">
      {editable && <Toolbar editor={editor} />}
      <div className="px-4 py-3">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
