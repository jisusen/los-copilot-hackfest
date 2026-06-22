import { join } from "path";
import {
  existsSync,
  readFileSync,
  writeFileSync,
  readdirSync,
  unlinkSync,
  mkdirSync,
} from "fs";
import { addAuditLogJuknis } from "../db/dashboardDb";

const ROOT = join(import.meta.dir, "../..");
const SKILLS_DIR = join(ROOT, "skills");

// Ensure skills directory exists
if (!existsSync(SKILLS_DIR)) {
  mkdirSync(SKILLS_DIR, { recursive: true });
}

export type SkillMeta = {
  name: string;
  filename: string;
  description: string;
  version: string;
  author: string;
  trigger: string;
  product: string;
  source: string;
  active: boolean;
  size: number;
  modified: string;
};

export type SkillFile = SkillMeta & {
  content: string;
};

function parseFrontmatter(content: string): {
  meta: Record<string, string>;
  body: string;
} {
  const normalized = content.replace(/\r\n/g, "\n");
  const match = normalized.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { meta: {}, body: content };

  const meta: Record<string, string> = {};
  match[1].split("\n").forEach((line) => {
    const [key, ...valueParts] = line.split(":");
    if (key && valueParts.length) {
      meta[key.trim()] = valueParts.join(":").trim();
    }
  });

  return { meta, body: match[2] };
}

function buildFrontmatter(meta: Record<string, string>): string {
  const lines = Object.entries(meta).map(([k, v]) => `${k}: ${v}`);
  return `---\n${lines.join("\n")}\n---\n`;
}

export function listSkills(): SkillMeta[] {
  if (!existsSync(SKILLS_DIR)) return [];

  return readdirSync(SKILLS_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((filename) => {
      const filepath = join(SKILLS_DIR, filename);
      const content = readFileSync(filepath, "utf-8");
      const { meta } = parseFrontmatter(content);
      const stat = { size: 0, modified: "" };
      try {
        const s = require("fs").statSync(filepath);
        stat.size = s.size;
        stat.modified = s.mtime.toISOString();
      } catch {}

      return {
        name: meta.name || filename.replace(".md", ""),
        filename,
        description: meta.description || "",
        version: meta.version || "1.0.0",
        author: meta.author || "",
        trigger: meta.trigger || "always",
        product: meta.product || "",
        source: meta.source || "",
        active: meta.active !== "false",
        size: stat.size,
        modified: stat.modified,
      };
    });
}

export function getSkill(filename: string): SkillFile | null {
  const filepath = join(SKILLS_DIR, filename);
  if (!existsSync(filepath)) return null;

  const content = readFileSync(filepath, "utf-8");
  const { meta, body } = parseFrontmatter(content);
  const stat = { size: 0, modified: "" };
  try {
    const s = require("fs").statSync(filepath);
    stat.size = s.size;
    stat.modified = s.mtime.toISOString();
  } catch {}

  return {
    name: meta.name || filename.replace(".md", ""),
    filename,
    description: meta.description || "",
    version: meta.version || "1.0.0",
    author: meta.author || "",
    trigger: meta.trigger || "always",
    product: meta.product || "",
    source: meta.source || "",
    active: meta.active !== "false",
    size: stat.size,
    modified: stat.modified,
    content,
  };
}

export function saveSkill(filename: string, content: string): boolean {
  try {
    const filepath = join(SKILLS_DIR, filename);
    writeFileSync(filepath, content, "utf-8");
    return true;
  } catch {
    return false;
  }
}

export function deleteSkill(filename: string): boolean {
  try {
    const filepath = join(SKILLS_DIR, filename);
    if (existsSync(filepath)) {
      unlinkSync(filepath);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export type MemoLocale = "en" | "id";

const ID_MEMO_SKILL = "memo-bahasa-indonesia.md";

/** Demo stand-in for user-uploaded PDF juknis per product. Prod: same content, extracted from PDF. */
const PRODUCT_JUKINS: Record<string, string> = {
  KTA: "kta-juknis.md",
};

/** Additional credit policy rules per product. */
const PRODUCT_POLICIES: Record<string, string> = {
  KTA: "kta-credit-policy.md",
};

function appendSkillBody(
  parts: string[],
  filename: string,
  heading: string,
): void {
  const file = getSkill(filename);
  if (!file) return;
  // Skip inactive skills
  if (!file.active) return;
  const { body } = parseFrontmatter(file.content);
  parts.push(
    `--- ${heading}: ${file.name} (v${file.version}) ---\n${body.trim()}`,
  );
}

/** User-facing juknis for memo generation — not system SOP / CRDE reference. */
export function getActiveSkillContent(
  locale: MemoLocale = "en",
  productType = "KTA",
): string {
  const product = productType.trim().toUpperCase() || "KTA";
  const parts: string[] = [];

  // Load credit policy rules first (comprehensive business rules)
  const policyFile = PRODUCT_POLICIES[product];
  if (policyFile) {
    appendSkillBody(parts, policyFile, "Credit Policy Rules");
  }

  // Load juknis (prompt template)
  const juknisFile = PRODUCT_JUKINS[product];
  if (juknisFile) {
    appendSkillBody(parts, juknisFile, "Juknis");
  } else {
    const fallback = listSkills().find(
      (s) =>
        s.trigger === "memo" &&
        s.filename !== ID_MEMO_SKILL &&
        s.product.toUpperCase() === product,
    );
    if (fallback) appendSkillBody(parts, fallback.filename, "Juknis");
  }

  // Load CRDE rules reference
  appendSkillBody(parts, "crde-rules.md", "CRDE Rules");

  if (locale === "id") {
    appendSkillBody(parts, ID_MEMO_SKILL, "Bahasa");
  }

  return parts.join("\n\n").trim();
}

export async function handleSkills(req: Request): Promise<Response | null> {
  const url = new URL(req.url);

  // GET /api/skills — list all skills
  if (req.method === "GET" && url.pathname === "/api/skills") {
    return Response.json({ skills: listSkills() });
  }

  // GET /api/skills/:filename — get skill content
  if (req.method === "GET" && url.pathname.startsWith("/api/skills/")) {
    const filename = url.pathname.split("/api/skills/")[1];
    const skill = getSkill(filename);
    if (!skill) {
      return Response.json({ error: "Skill not found" }, { status: 404 });
    }
    return Response.json({ skill });
  }

  // POST /api/skills — create or update skill
  if (req.method === "POST" && url.pathname === "/api/skills") {
    const body = (await req.json()) as { filename: string; content: string };
    if (!body.filename || !body.content) {
      return Response.json(
        { error: "filename and content required" },
        { status: 400 },
      );
    }
    // Sanitize filename
    const safeName = body.filename.replace(/[^a-z0-9-_.]/gi, "-").toLowerCase();
    const filename = safeName.endsWith(".md") ? safeName : `${safeName}.md`;
    const ok = saveSkill(filename, body.content);
    return Response.json({ ok, filename });
  }

  // DELETE /api/skills/:filename — delete skill
  if (req.method === "DELETE" && url.pathname.startsWith("/api/skills/")) {
    const filename = url.pathname.split("/api/skills/")[1];
    const ok = deleteSkill(filename);
    return Response.json({ ok });
  }

  // PATCH /api/skills/:filename/toggle-active — toggle active status
  if (req.method === "PATCH" && url.pathname.endsWith("/toggle-active")) {
    const filename = url.pathname.split("/api/skills/")[1].replace("/toggle-active", "");
    const skill = getSkill(filename);
    if (!skill) {
      return Response.json({ error: "Skill not found" }, { status: 404 });
    }
    // Toggle active status in frontmatter
    const content = skill.content;
    const newActive = !skill.active;
    const newContent = content.replace(
      /^active:\s*(true|false)$/m,
      `active: ${newActive}`
    );
    // If no active field exists, add it after the first line of frontmatter
    if (!content.match(/^active:\s*(true|false)$/m)) {
      const updated = content.replace(
        /^(---\n[^-]+)$/,
        `$1\nactive: ${newActive}`
      );
      saveSkill(filename, updated);
    } else {
      saveSkill(filename, newContent);
    }
    // Log the toggle action
    addAuditLogJuknis(
      `Juknis: ${filename}`,
      `active: ${skill.active}`,
      `active: ${newActive}`,
      "system",
      "TOGGLE_ACTIVE"
    );
    return Response.json({ ok: true, active: newActive });
  }

  return null;
}
