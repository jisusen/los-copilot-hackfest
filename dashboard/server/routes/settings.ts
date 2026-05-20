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
  losUrl: string;
  losUsername: string;
  losPassword: string;
  losLoginPath: string;
  extractionMode: string;
  mockAgent: boolean;
};

function loadSettings(): AppSettings {
  if (existsSync(SETTINGS_FILE)) {
    try {
      return JSON.parse(readFileSync(SETTINGS_FILE, 'utf-8'));
    } catch { /* fallthrough */ }
  }
  // Fallback to env defaults
  return {
    llmProvider: process.env.LLM_PROVIDER ?? 'anthropic',
    anthropicApiKey: process.env.ANTHROPIC_API_KEY ?? '',
    anthropicModel: process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-4-6',
    geminiApiKey: process.env.GEMINI_API_KEY ?? '',
    geminiModel: process.env.GEMINI_MODEL ?? 'gemini-2.0-flash',
    customEndpoint: process.env.CUSTOM_LLM_ENDPOINT ?? '',
    customModel: process.env.CUSTOM_LLM_MODEL ?? '',
    customApiKey: process.env.CUSTOM_LLM_API_KEY ?? '',
    losUrl: process.env.LOS_URL ?? 'http://localhost:3333',
    losUsername: process.env.LOS_USERNAME ?? 'analyst01',
    losPassword: process.env.LOS_PASSWORD ?? 'bms2025',
    losLoginPath: process.env.LOS_LOGIN_PATH ?? '/login',
    extractionMode: process.env.EXTRACTION_MODE ?? 'browser',
    mockAgent: process.env.MOCK_AGENT === 'true',
  };
}

function saveSettings(settings: AppSettings) {
  writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2));
}

// In-memory cache so other modules can read settings without hitting disk
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
  // Also update process.env so existing code picks it up immediately
  process.env.LLM_PROVIDER = settings.llmProvider;
  process.env.ANTHROPIC_API_KEY = settings.anthropicApiKey;
  process.env.ANTHROPIC_MODEL = settings.anthropicModel;
  process.env.GEMINI_API_KEY = settings.geminiApiKey;
  process.env.GEMINI_MODEL = settings.geminiModel;
  process.env.CUSTOM_LLM_ENDPOINT = settings.customEndpoint;
  process.env.CUSTOM_LLM_MODEL = settings.customModel;
  process.env.CUSTOM_LLM_API_KEY = settings.customApiKey;
  process.env.LOS_URL = settings.losUrl;
  process.env.LOS_USERNAME = settings.losUsername;
  process.env.LOS_PASSWORD = settings.losPassword;
  process.env.LOS_LOGIN_PATH = settings.losLoginPath;
  process.env.EXTRACTION_MODE = settings.extractionMode;
  process.env.MOCK_AGENT = settings.mockAgent ? 'true' : 'false';
}

export async function handleSettings(req: Request): Promise<Response | null> {
  if (req.method === 'GET') {
    const s = getSettings();
    // Return everything except passwords/keys for security
    return Response.json({
      settings: {
        llmProvider: s.llmProvider,
        anthropicModel: s.anthropicModel,
        geminiModel: s.geminiModel,
        customEndpoint: s.customEndpoint,
        customModel: s.customModel,
        losUrl: s.losUrl,
        losUsername: s.losUsername,
        losLoginPath: s.losLoginPath,
        extractionMode: s.extractionMode,
        mockAgent: s.mockAgent,
        // Mask sensitive values
        anthropicApiKey: maskKey(s.anthropicApiKey),
        geminiApiKey: maskKey(s.geminiApiKey),
        customApiKey: maskKey(s.customApiKey),
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
      losUrl: body.losUrl ?? current.losUrl,
      losUsername: body.losUsername ?? current.losUsername,
      losPassword: body.losPassword === maskKey(current.losPassword) ? current.losPassword : (body.losPassword ?? current.losPassword),
      losLoginPath: body.losLoginPath ?? current.losLoginPath,
      extractionMode: body.extractionMode ?? current.extractionMode,
      mockAgent: body.mockAgent ?? current.mockAgent,
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
