import { join } from "path";
import { existsSync, readFileSync, writeFileSync } from "fs";

const ROOT = join(import.meta.dir, "../..");
const SETTINGS_FILE = join(ROOT, ".settings.json");

export type AppSettings = {
  llmProvider: string;
  apiKey: string;
  anthropicModel: string;
  geminiModel: string;
  customEndpoint: string;
  customModel: string;
  browseProvider: string;
  browseModel: string;
  browseEndpoint: string;
  browseApiKey: string;
  browseVertexProject: string;
  browseVertexLocation: string;
  browseVertexCredentials: string;
  losUrl: string;
  losUsername: string;
  losPassword: string;
  losLoginPath: string;
  extractionMode: string;
  mockAgent: boolean;
};

type NestedSettings = {
  llm: {
    provider: string;
    apiKey: string;
    anthropicModel: string;
    geminiModel: string;
    customEndpoint: string;
    customModel: string;
    browsing: {
      provider: string;
      model: string;
      endpoint: string;
      apiKey: string;
      vertex?: {
        project: string;
        location: string;
        credentials: string;
      };
    };
  };
  los: { url: string; username: string; password: string; loginPath: string };
  agent: { extractionMode: string; mockAgent: boolean };
};

function flatDefaults(): AppSettings {
  return {
    llmProvider: process.env.LLM_PROVIDER ?? "anthropic",
    apiKey: process.env.ANTHROPIC_API_KEY ?? process.env.GEMINI_API_KEY ?? "",
    anthropicModel: process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-6",
    geminiModel: process.env.GEMINI_MODEL ?? "gemini-2.0-flash",
    customEndpoint: process.env.CUSTOM_LLM_ENDPOINT ?? "",
    customModel: process.env.CUSTOM_LLM_MODEL ?? "",
    browseProvider: process.env.BROWSE_PROVIDER ?? "gemini",
    browseModel: process.env.BROWSE_MODEL ?? "gemini-2.5-flash-lite",
    browseEndpoint: process.env.BROWSE_ENDPOINT ?? "",
    browseApiKey: process.env.BROWSE_API_KEY ?? "",
    browseVertexProject: process.env.BROWSE_VERTEX_PROJECT ?? "",
    browseVertexLocation:
      process.env.BROWSE_VERTEX_LOCATION ?? "asia-southeast1",
    browseVertexCredentials: process.env.GOOGLE_APPLICATION_CREDENTIALS ?? "",
    losUrl: process.env.LOS_URL ?? "http://localhost:3333",
    losUsername: process.env.LOS_USERNAME ?? "analyst01",
    losPassword: process.env.LOS_PASSWORD ?? "bms2025",
    losLoginPath: process.env.LOS_LOGIN_PATH ?? "/login",
    extractionMode: process.env.EXTRACTION_MODE ?? "browser",
    mockAgent: process.env.MOCK_AGENT === "true",
  };
}

function nest(flat: AppSettings): NestedSettings {
  return {
    llm: {
      provider: flat.llmProvider,
      apiKey: flat.apiKey,
      anthropicModel: flat.anthropicModel,
      geminiModel: flat.geminiModel,
      customEndpoint: flat.customEndpoint,
      customModel: flat.customModel,
      browsing: {
        provider: flat.browseProvider,
        model: flat.browseModel,
        endpoint: flat.browseEndpoint,
        apiKey: flat.browseApiKey,
        vertex: {
          project: flat.browseVertexProject,
          location: flat.browseVertexLocation,
          credentials: flat.browseVertexCredentials,
        },
      },
    },
    los: {
      url: flat.losUrl,
      username: flat.losUsername,
      password: flat.losPassword,
      loginPath: flat.losLoginPath,
    },
    agent: { extractionMode: flat.extractionMode, mockAgent: flat.mockAgent },
  };
}

function flatten(
  n: Partial<NestedSettings & { skills?: { memo?: string } }>,
  defaults: AppSettings,
): AppSettings {
  const llm = n.llm ?? ({} as NestedSettings["llm"]);
  const br = llm.browsing ?? ({} as NestedSettings["llm"]["browsing"]);
  const los = n.los ?? ({} as NestedSettings["los"]);
  const agent = n.agent ?? ({} as NestedSettings["agent"]);

  // Migrate old separate keys → single apiKey
  let apiKey = llm.apiKey || defaults.apiKey;
  if (!apiKey) {
    const oldAn = (n.llm as any)?.analysis;
    if (oldAn?.anthropicApiKey) apiKey = oldAn.anthropicApiKey;
    else if (oldAn?.geminiApiKey) apiKey = oldAn.geminiApiKey;
    else if (oldAn?.customApiKey) apiKey = oldAn.customApiKey;
  }

  return {
    llmProvider: llm.provider || defaults.llmProvider,
    apiKey,
    anthropicModel: llm.anthropicModel || defaults.anthropicModel,
    geminiModel: llm.geminiModel || defaults.geminiModel,
    customEndpoint: llm.customEndpoint || defaults.customEndpoint,
    customModel: llm.customModel || defaults.customModel,
    browseProvider:
      br.provider ||
      ((llm.provider || defaults.llmProvider) === "custom"
        ? "gemini"
        : defaults.browseProvider),
    browseModel:
      br.model ||
      ((llm.provider || defaults.llmProvider) === "custom"
        ? "gemini-2.5-flash-lite"
        : defaults.browseModel),
    browseEndpoint: br.endpoint || defaults.browseEndpoint,
    browseApiKey: br.apiKey || defaults.browseApiKey,
    browseVertexProject: br.vertex?.project || defaults.browseVertexProject,
    browseVertexLocation: br.vertex?.location || defaults.browseVertexLocation,
    browseVertexCredentials:
      br.vertex?.credentials || defaults.browseVertexCredentials,
    losUrl: los.url || defaults.losUrl,
    losUsername: los.username || defaults.losUsername,
    losPassword: los.password || defaults.losPassword,
    losLoginPath: los.loginPath || defaults.losLoginPath,
    extractionMode: agent.extractionMode || defaults.extractionMode,
    mockAgent: agent.mockAgent ?? defaults.mockAgent,
  };
}

function loadSettings(): AppSettings {
  if (existsSync(SETTINGS_FILE)) {
    try {
      const raw = JSON.parse(readFileSync(SETTINGS_FILE, "utf-8"));
      // Migrate old flat format
      if (raw.llmProvider !== undefined) {
        const { memoSkill: _memo, skills: _skills, ...rest } = raw;
        const flat: AppSettings = { ...flatDefaults(), ...rest };
        saveSettings(flat);
        return flat;
      }
      // Migrate old nested format with separate keys
      const an = raw.llm?.analysis;
      if (an) {
        if (!raw.llm.apiKey) {
          raw.llm.apiKey =
            an.anthropicApiKey ?? an.geminiApiKey ?? an.customApiKey ?? "";
        }
        if (!raw.llm.anthropicModel)
          raw.llm.anthropicModel = an.anthropicModel ?? an.model ?? "";
        delete raw.llm.analysis;
      }
      // Drop legacy inline SOP — skills now live in dashboard/skills/
      if (raw.skills) {
        delete raw.skills;
        writeFileSync(SETTINGS_FILE, JSON.stringify(raw, null, 2));
      }
      const flat = flatten(raw, flatDefaults());
      saveSettings(flat);
      return flat;
    } catch {
      /* fallthrough */
    }
  }
  return flatDefaults();
}

function saveSettings(settings: AppSettings) {
  writeFileSync(SETTINGS_FILE, JSON.stringify(nest(settings), null, 2));
}

let cachedSettings: AppSettings | null = null;

export function getSettings(): AppSettings {
  if (!cachedSettings) {
    cachedSettings = loadSettings();
  }
  return cachedSettings;
}

export function setSettings(settings: AppSettings) {
  cachedSettings = settings;
  saveSettings(settings);
  process.env.LLM_PROVIDER = settings.llmProvider;
  process.env.ANTHROPIC_API_KEY = settings.apiKey;
  process.env.GEMINI_API_KEY = settings.apiKey;
  process.env.ANTHROPIC_MODEL = settings.anthropicModel;
  process.env.GEMINI_MODEL = settings.geminiModel;
  process.env.CUSTOM_LLM_ENDPOINT = settings.customEndpoint;
  process.env.CUSTOM_LLM_MODEL = settings.customModel;
  process.env.BROWSE_PROVIDER = settings.browseProvider;
  process.env.BROWSE_MODEL = settings.browseModel;
  process.env.BROWSE_ENDPOINT = settings.browseEndpoint;
  process.env.BROWSE_API_KEY = settings.browseApiKey;
  process.env.BROWSE_VERTEX_PROJECT = settings.browseVertexProject;
  process.env.BROWSE_VERTEX_LOCATION = settings.browseVertexLocation;
  if (settings.browseVertexCredentials) {
    process.env.GOOGLE_APPLICATION_CREDENTIALS =
      settings.browseVertexCredentials;
  }
  process.env.LOS_URL = settings.losUrl;
  process.env.LOS_USERNAME = settings.losUsername;
  process.env.LOS_PASSWORD = settings.losPassword;
  process.env.LOS_LOGIN_PATH = settings.losLoginPath;
  process.env.EXTRACTION_MODE = settings.extractionMode;
  process.env.MOCK_AGENT = settings.mockAgent ? "true" : "false";
}

export async function handleSettings(req: Request): Promise<Response | null> {
  if (req.method === "GET") {
    const s = getSettings();
    return Response.json({
      settings: {
        llmProvider: s.llmProvider,
        apiKey: s.apiKey,
        anthropicModel: s.anthropicModel,
        geminiModel: s.geminiModel,
        customEndpoint: s.customEndpoint,
        customModel: s.customModel,
        browseProvider: s.browseProvider,
        browseModel: s.browseModel,
        browseEndpoint: s.browseEndpoint,
        browseApiKey: s.browseApiKey,
        browseVertexProject: s.browseVertexProject,
        browseVertexLocation: s.browseVertexLocation,
        browseVertexCredentials: s.browseVertexCredentials,
        losUrl: s.losUrl,
        losUsername: s.losUsername,
        losPassword: s.losPassword,
        losLoginPath: s.losLoginPath,
        extractionMode: s.extractionMode,
        mockAgent: s.mockAgent,
      },
    });
  }

  if (req.method === "POST") {
    const body = (await req.json()) as Partial<AppSettings>;
    const current = getSettings();

    const merged: AppSettings = {
      llmProvider: body.llmProvider ?? current.llmProvider,
      apiKey: body.apiKey ?? current.apiKey,
      anthropicModel: body.anthropicModel ?? current.anthropicModel,
      geminiModel: body.geminiModel ?? current.geminiModel,
      customEndpoint: body.customEndpoint ?? current.customEndpoint,
      customModel: body.customModel ?? current.customModel,
      browseProvider: body.browseProvider ?? current.browseProvider,
      browseModel: body.browseModel ?? current.browseModel,
      browseEndpoint: body.browseEndpoint ?? current.browseEndpoint,
      browseApiKey: body.browseApiKey ?? current.browseApiKey,
      browseVertexProject:
        body.browseVertexProject ?? current.browseVertexProject,
      browseVertexLocation:
        body.browseVertexLocation ?? current.browseVertexLocation,
      browseVertexCredentials:
        body.browseVertexCredentials ?? current.browseVertexCredentials,
      losUrl: body.losUrl ?? current.losUrl,
      losUsername: body.losUsername ?? current.losUsername,
      losPassword: body.losPassword ?? current.losPassword,
      losLoginPath: body.losLoginPath ?? current.losLoginPath,
      extractionMode: body.extractionMode ?? current.extractionMode,
      mockAgent: body.mockAgent ?? current.mockAgent,
    };

    setSettings(merged);
    return Response.json({ ok: true });
  }

  return null;
}
