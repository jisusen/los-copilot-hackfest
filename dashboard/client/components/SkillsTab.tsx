import React, { useEffect, useState, useCallback } from "react";
import { apiFetch } from "../lib/api";
import { useToast } from "./Toast";
import {
  FileText,
  Plus,
  Trash2,
  Save,
  X,
  ChevronDown,
  ChevronRight,
  Clock,
  User,
  Tag,
  AlertCircle,
} from "lucide-react";

type SkillMeta = {
  name: string;
  filename: string;
  description: string;
  version: string;
  author: string;
  trigger: string;
  size: number;
  modified: string;
};

type SkillFile = SkillMeta & {
  content: string;
};

const TRIGGER_OPTIONS = [
  { value: "always", label: "Always Active" },
  { value: "memo", label: "Memo Generation" },
  { value: "crde", label: "CRDE Analysis" },
  { value: "manual", label: "Manual Trigger" },
];

function SkillCard({
  skill,
  isActive,
  onSelect,
  onDelete,
}: {
  skill: SkillMeta;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
}) {
  const triggerLabel =
    TRIGGER_OPTIONS.find((t) => t.value === skill.trigger)?.label ||
    skill.trigger;

  return (
    <div
      onClick={onSelect}
      className={`group border rounded-xl p-3 cursor-pointer transition-all ${
        isActive
          ? "border-amber-400 bg-amber-50 shadow-sm"
          : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
              isActive ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-500"
            }`}
          >
            <FileText className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-slate-900 truncate">
              {skill.name}
            </div>
            <div className="text-[10px] text-slate-400 truncate">
              {skill.filename}
            </div>
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 transition-all"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {skill.description && (
        <div className="mt-2 text-xs text-slate-500 line-clamp-2">
          {skill.description}
        </div>
      )}

      <div className="mt-2 flex items-center gap-2 flex-wrap">
        <span className="inline-flex items-center gap-1 text-[10px] font-mono text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded">
          <Tag className="w-2.5 h-2.5" />
          {triggerLabel}
        </span>
        <span className="inline-flex items-center gap-1 text-[10px] font-mono text-slate-400">
          v{skill.version}
        </span>
        {skill.author && (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono text-slate-400">
            <User className="w-2.5 h-2.5" />
            {skill.author}
          </span>
        )}
      </div>
    </div>
  );
}

function SkillEditor({
  skill,
  onSave,
  onCancel,
}: {
  skill: SkillFile | null;
  onSave: (filename: string, content: string) => Promise<void>;
  onCancel: () => void;
}) {
  const [content, setContent] = useState(skill?.content || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Parse frontmatter
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  const frontmatter = match?.[1] || "";
  const body = match?.[2] || content;

  // Extract metadata from frontmatter
  const meta: Record<string, string> = {};
  frontmatter.split("\n").forEach((line) => {
    const [key, ...valueParts] = line.split(":");
    if (key && valueParts.length) {
      meta[key.trim()] = valueParts.join(":").trim();
    }
  });

  function updateMeta(key: string, value: string) {
    meta[key] = value;
    const newFrontmatter = Object.entries(meta)
      .map(([k, v]) => `${k}: ${v}`)
      .join("\n");
    setContent(`---\n${newFrontmatter}\n---\n${body}`);
  }

  async function handleSave() {
    if (!meta.name?.trim()) {
      setError("Skill name is required");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const filename = skill?.filename || `${meta.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.md`;
      await onSave(filename, content);
    } catch (err: any) {
      setError(err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200 bg-slate-50">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-slate-500" />
          <span className="text-sm font-semibold text-slate-700">
            {skill ? `Editing: ${skill.filename}` : "New Skill"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {error && (
            <span className="text-xs text-red-500 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {error}
            </span>
          )}
          <button
            onClick={onCancel}
            className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-3 py-1.5 text-xs font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1.5"
          >
            {saving ? (
              <>
                <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-3 h-3" />
                Save
              </>
            )}
          </button>
        </div>
      </div>

      {/* Metadata Fields */}
      <div className="px-4 py-3 border-b border-slate-200 bg-white">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-mono text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-1">
              Skill Name
            </label>
            <input
              value={meta.name || ""}
              onChange={(e) => updateMeta("name", e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm text-slate-900 bg-white outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
              placeholder="Credit Memo SOP"
            />
          </div>
          <div>
            <label className="block font-mono text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-1">
              Trigger
            </label>
            <select
              value={meta.trigger || "always"}
              onChange={(e) => updateMeta("trigger", e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm text-slate-900 bg-white outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
            >
              {TRIGGER_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-mono text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-1">
              Description
            </label>
            <input
              value={meta.description || ""}
              onChange={(e) => updateMeta("description", e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm text-slate-900 bg-white outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
              placeholder="What this skill does"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-mono text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-1">
                Version
              </label>
              <input
                value={meta.version || ""}
                onChange={(e) => updateMeta("version", e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm text-slate-900 bg-white outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                placeholder="1.0.0"
              />
            </div>
            <div>
              <label className="block font-mono text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-1">
                Author
              </label>
              <input
                value={meta.author || ""}
                onChange={(e) => updateMeta("author", e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm text-slate-900 bg-white outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                placeholder="Bank Maju Bersama"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content Editor */}
      <div className="flex-1 overflow-hidden">
        <textarea
          value={body}
          onChange={(e) => {
            const newContent = `---\n${frontmatter}\n---\n${e.target.value}`;
            setContent(newContent);
          }}
          className="w-full h-full px-4 py-3 text-sm font-mono text-slate-900 bg-white outline-none resize-none leading-relaxed"
          placeholder="Write your SOP/Juknis content here using Markdown..."
          spellCheck={false}
        />
      </div>
    </div>
  );
}

export function SkillsTab() {
  const [skills, setSkills] = useState<SkillMeta[]>([]);
  const [selectedSkill, setSelectedSkill] = useState<SkillFile | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const toast = useToast();

  const fetchSkills = useCallback(async () => {
    try {
      const data = await apiFetch<{ skills: SkillMeta[] }>("/api/skills");
      setSkills(data.skills);
    } catch {
      toast("Failed to load skills", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSkills();
  }, [fetchSkills]);

  async function handleSelect(filename: string) {
    try {
      const data = await apiFetch<{ skill: SkillFile }>(`/api/skills/${filename}`);
      setSelectedSkill(data.skill);
      setCreating(false);
    } catch {
      toast("Failed to load skill", "error");
    }
  }

  async function handleSave(filename: string, content: string) {
    await apiFetch("/api/skills", {
      method: "POST",
      body: JSON.stringify({ filename, content }),
    });
    toast("Skill saved");
    setSelectedSkill(null);
    setCreating(false);
    fetchSkills();
  }

  async function handleDelete(filename: string) {
    if (!confirm(`Delete ${filename}?`)) return;
    try {
      await apiFetch(`/api/skills/${filename}`, { method: "DELETE" });
      toast("Skill deleted");
      if (selectedSkill?.filename === filename) setSelectedSkill(null);
      fetchSkills();
    } catch {
      toast("Failed to delete skill", "error");
    }
  }

  function handleCreateNew() {
    setSelectedSkill(null);
    setCreating(true);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400">
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
          Loading skills...
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-200px)]">
      {/* Skills List */}
      <div
        className={`flex flex-col  ${
          selectedSkill || creating ? "w-72" : "flex-1"
        } transition-all`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
          <div>
            <div className="text-sm font-bold text-slate-900">Skills</div>
            <div className="text-[10px] text-slate-400">
              {skills.length} skill{skills.length !== 1 ? "s" : ""} configured
            </div>
          </div>
          <button
            onClick={handleCreateNew}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors"
          >
            <Plus className="w-3 h-3" />
            New
          </button>
        </div>

        {/* Skills Grid */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {skills.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <div className="text-sm">No skills yet</div>
              <div className="text-xs mt-1">Create your first SOP skill</div>
            </div>
          ) : (
            skills.map((skill) => (
              <SkillCard
                key={skill.filename}
                skill={skill}
                isActive={selectedSkill?.filename === skill.filename}
                onSelect={() => handleSelect(skill.filename)}
                onDelete={() => handleDelete(skill.filename)}
              />
            ))
          )}
        </div>
      </div>

      {/* Editor Panel */}
      {(selectedSkill || creating) && (
        <div className="flex-1 flex flex-col min-w-0">
          {creating ? (
            <SkillEditor
              skill={null}
              onSave={handleSave}
              onCancel={() => setCreating(false)}
            />
          ) : selectedSkill ? (
            <SkillEditor
              skill={selectedSkill}
              onSave={handleSave}
              onCancel={() => setSelectedSkill(null)}
            />
          ) : null}
        </div>
      )}
    </div>
  );
}
