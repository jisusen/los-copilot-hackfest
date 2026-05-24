import { join } from 'path';
import { existsSync, readFileSync, writeFileSync } from 'fs';

const ROOT = join(import.meta.dir, '../..');
const SETTINGS_FILE = join(ROOT, '.settings.json');

export type AppSettings = {
  llmProvider: string;
  anthropicApiKey: string;
  anthropicModel: string;
  geminiApiKey: string;
  geminiModel: string;
  customEndpoint: string;
  customModel: string;
  customApiKey: string;
  browseProvider: string;
  browseModel: string;
  browseEndpoint: string;
  browseApiKey: string;
  losUrl: string;
  losUsername: string;
  losPassword: string;
  losLoginPath: string;
  extractionMode: string;
  mockAgent: boolean;
  memoSkill: string;
};

type NestedSettings = {
  llm: {
    analysis: {
      provider: string;
      anthropicApiKey: string; anthropicModel: string;
      geminiApiKey: string; geminiModel: string;
      customEndpoint: string; customModel: string; customApiKey: string;
    };
    browsing: { provider: string; model: string; endpoint: string; apiKey: string };
  };
  los: { url: string; username: string; password: string; loginPath: string };
  agent: { extractionMode: string; mockAgent: boolean };
  skills: { memo: string };
};

function flatDefaults(): AppSettings {
  return {
    llmProvider: process.env.LLM_PROVIDER ?? 'anthropic',
    anthropicApiKey: process.env.ANTHROPIC_API_KEY ?? '',
    anthropicModel: process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-4-6',
    geminiApiKey: process.env.GEMINI_API_KEY ?? '',
    geminiModel: process.env.GEMINI_MODEL ?? 'gemini-2.0-flash',
    customEndpoint: process.env.CUSTOM_LLM_ENDPOINT ?? '',
    customModel: process.env.CUSTOM_LLM_MODEL ?? '',
    customApiKey: process.env.CUSTOM_LLM_API_KEY ?? '',
    browseProvider: process.env.BROWSE_PROVIDER ?? '',
    browseModel: process.env.BROWSE_MODEL ?? '',
    browseEndpoint: process.env.BROWSE_ENDPOINT ?? '',
    browseApiKey: process.env.BROWSE_API_KEY ?? '',
    losUrl: process.env.LOS_URL ?? 'http://localhost:3333',
    losUsername: process.env.LOS_USERNAME ?? 'analyst01',
    losPassword: process.env.LOS_PASSWORD ?? 'bms2025',
    losLoginPath: process.env.LOS_LOGIN_PATH ?? '/login',
    extractionMode: process.env.EXTRACTION_MODE ?? 'browser',
    mockAgent: process.env.MOCK_AGENT === 'true',
    memoSkill: '',
  };
}

function nest(flat: AppSettings): NestedSettings {
  return {
    llm: {
      analysis: { provider: flat.llmProvider, anthropicApiKey: flat.anthropicApiKey, anthropicModel: flat.anthropicModel, geminiApiKey: flat.geminiApiKey, geminiModel: flat.geminiModel, customEndpoint: flat.customEndpoint, customModel: flat.customModel, customApiKey: flat.customApiKey },
      browsing: { provider: flat.browseProvider, model: flat.browseModel, endpoint: flat.browseEndpoint, apiKey: flat.browseApiKey },
    },
    los: { url: flat.losUrl, username: flat.losUsername, password: flat.losPassword, loginPath: flat.losLoginPath },
    agent: { extractionMode: flat.extractionMode, mockAgent: flat.mockAgent },
    skills: { memo: flat.memoSkill },
  };
}

function flatten(n: Partial<NestedSettings>, defaults: AppSettings): AppSettings {
  const llm = n.llm ?? {} as NestedSettings['llm'];
  const an = llm.analysis ?? {} as NestedSettings['llm']['analysis'];
  const br = llm.browsing ?? {} as NestedSettings['llm']['browsing'];
  const los = n.los ?? {} as NestedSettings['los'];
  const agent = n.agent ?? {} as NestedSettings['agent'];
  const skills = n.skills ?? {} as NestedSettings['skills'];
  return {
    llmProvider: an.provider || defaults.llmProvider,
    anthropicApiKey: an.anthropicApiKey || defaults.anthropicApiKey,
    anthropicModel: an.anthropicModel || defaults.anthropicModel,
    geminiApiKey: an.geminiApiKey || defaults.geminiApiKey,
    geminiModel: an.geminiModel || defaults.geminiModel,
    customEndpoint: an.customEndpoint || defaults.customEndpoint,
    customModel: an.customModel || defaults.customModel,
    customApiKey: an.customApiKey || defaults.customApiKey,
    browseProvider: br.provider || defaults.browseProvider,
    browseModel: br.model || defaults.browseModel,
    browseEndpoint: br.endpoint || defaults.browseEndpoint,
    browseApiKey: br.apiKey || defaults.browseApiKey,
    losUrl: los.url || defaults.losUrl,
    losUsername: los.username || defaults.losUsername,
    losPassword: los.password || defaults.losPassword,
    losLoginPath: los.loginPath || defaults.losLoginPath,
    extractionMode: agent.extractionMode || defaults.extractionMode,
    mockAgent: agent.mockAgent ?? defaults.mockAgent,
    memoSkill: skills.memo ?? '',
  };
}

function loadSettings(): AppSettings {
  if (existsSync(SETTINGS_FILE)) {
    try {
      const raw = JSON.parse(readFileSync(SETTINGS_FILE, 'utf-8'));
      // Migrate old flat format → nested
      if (raw.llmProvider !== undefined) {
        const flat: AppSettings = { ...flatDefaults(), ...raw };
        saveSettings(flat);
        return flat;
      }
      // Migrate old nested format (analysis.apiKey/model) → new (analysis.anthropic*)
      const an = raw.llm?.analysis;
      if (an && an.apiKey !== undefined) {
        an.anthropicApiKey = an.anthropicApiKey ?? an.apiKey;
        an.anthropicModel = an.anthropicModel ?? an.model ?? '';
        delete an.apiKey;
        delete an.model;
        const def = flatDefaults();
        an.customEndpoint = an.customEndpoint ?? def.customEndpoint;
        an.customModel = an.customModel ?? def.customModel;
        an.customApiKey = an.customApiKey ?? def.customApiKey;
        an.geminiApiKey = an.geminiApiKey ?? def.geminiApiKey;
        an.geminiModel = an.geminiModel ?? def.geminiModel;
        writeFileSync(SETTINGS_FILE, JSON.stringify(raw, null, 2));
      }
      return flatten(raw, flatDefaults());
    } catch { /* fallthrough */ }
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
  process.env.ANTHROPIC_API_KEY = settings.anthropicApiKey;
  process.env.ANTHROPIC_MODEL = settings.anthropicModel;
  process.env.GEMINI_API_KEY = settings.geminiApiKey;
  process.env.GEMINI_MODEL = settings.geminiModel;
  process.env.CUSTOM_LLM_ENDPOINT = settings.customEndpoint;
  process.env.CUSTOM_LLM_MODEL = settings.customModel;
  process.env.CUSTOM_LLM_API_KEY = settings.customApiKey;
  process.env.BROWSE_PROVIDER = settings.browseProvider;
  process.env.BROWSE_MODEL = settings.browseModel;
  process.env.BROWSE_ENDPOINT = settings.browseEndpoint;
  process.env.BROWSE_API_KEY = settings.browseApiKey;
  process.env.LOS_URL = settings.losUrl;
  process.env.LOS_USERNAME = settings.losUsername;
  process.env.LOS_PASSWORD = settings.losPassword;
  process.env.LOS_LOGIN_PATH = settings.losLoginPath;
  process.env.EXTRACTION_MODE = settings.extractionMode;
  process.env.MOCK_AGENT = settings.mockAgent ? 'true' : 'false';
  process.env.MEMO_SKILL = settings.memoSkill;
}

export async function handleSettings(req: Request): Promise<Response | null> {
  if (req.method === 'GET') {
    const s = getSettings();
    return Response.json({
      settings: {
        llmProvider: s.llmProvider,
        anthropicModel: s.anthropicModel,
        geminiModel: s.geminiModel,
        customEndpoint: s.customEndpoint,
        customModel: s.customModel,
        browseProvider: s.browseProvider,
        browseModel: s.browseModel,
        browseEndpoint: s.browseEndpoint,
        losUrl: s.losUrl,
        losUsername: s.losUsername,
        losLoginPath: s.losLoginPath,
        extractionMode: s.extractionMode,
        mockAgent: s.mockAgent,
        memoSkill: s.memoSkill,
        anthropicApiKey: maskKey(s.anthropicApiKey),
        geminiApiKey: maskKey(s.geminiApiKey),
        customApiKey: maskKey(s.customApiKey),
        browseApiKey: maskKey(s.browseApiKey),
        losPassword: maskKey(s.losPassword),
      },
    });
  }

  if (req.method === 'POST') {
    const body = await req.json() as Partial<AppSettings>;
    const current = getSettings();

    const merged: AppSettings = {
      llmProvider: body.llmProvider ?? current.llmProvider,
      anthropicApiKey: body.anthropicApiKey === maskKey(current.anthropicApiKey) ? current.anthropicApiKey : (body.anthropicApiKey ?? current.anthropicApiKey),
      anthropicModel: body.anthropicModel ?? current.anthropicModel,
      geminiApiKey: body.geminiApiKey === maskKey(current.geminiApiKey) ? current.geminiApiKey : (body.geminiApiKey ?? current.geminiApiKey),
      geminiModel: body.geminiModel ?? current.geminiModel,
      customEndpoint: body.customEndpoint ?? current.customEndpoint,
      customModel: body.customModel ?? current.customModel,
      customApiKey: body.customApiKey === maskKey(current.customApiKey) ? current.customApiKey : (body.customApiKey ?? current.customApiKey),
      browseProvider: body.browseProvider ?? current.browseProvider,
      browseModel: body.browseModel ?? current.browseModel,
      browseEndpoint: body.browseEndpoint ?? current.browseEndpoint,
      browseApiKey: body.browseApiKey === maskKey(current.browseApiKey) ? current.browseApiKey : (body.browseApiKey ?? current.browseApiKey),
      losUrl: body.losUrl ?? current.losUrl,
      losUsername: body.losUsername ?? current.losUsername,
      losPassword: body.losPassword === maskKey(current.losPassword) ? current.losPassword : (body.losPassword ?? current.losPassword),
      losLoginPath: body.losLoginPath ?? current.losLoginPath,
      extractionMode: body.extractionMode ?? current.extractionMode,
      mockAgent: body.mockAgent ?? current.mockAgent,
      memoSkill: body.memoSkill ?? current.memoSkill,
    };

    setSettings(merged);
    return Response.json({ ok: true });
  }

  return null;
}

function maskKey(key: string): string {
  if (!key || key.length < 8) return '';
  return key.slice(0, 4) + '••••' + key.slice(-4);
}
