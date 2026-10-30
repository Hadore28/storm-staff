// What a staff extension is written against. Extensions run on the storm site and
// reach it only through `ctx`: they're told what happens, answer their outside
// service, and ask storm to run commands.

export const SDK_VERSION = 1;

export type Text = string | { en: string; ar?: string };

export type Setting =
  | { id: string; type: "text"; label: Text; default: string; description?: Text }
  | { id: string; type: "toggle"; label: Text; default: boolean; description?: Text }
  | { id: string; type: "select"; label: Text; options: { value: string; label: Text }[]; default: string; description?: Text }
  /** a value the admin types once; it's stored encrypted and never shown again */
  | { id: string; type: "secret"; label: Text; description?: Text };

/** public: the community. staff: the team. security: sign-ins and anything suspicious. */
export type Audience = "public" | "staff" | "security";

export interface StormEvent {
  type: string;
  audience: Audience;
  title: string;
  text?: string;
  url?: string;
  at: string;
}

export interface CommandOption {
  name: string;
  description: string;
  kind: "text" | "number";
  required?: boolean;
}

export interface StormCommand {
  name: string;
  description: string;
  options: CommandOption[];
  /** the answer has private details, so it must not appear in a shared chat */
  private?: boolean;
}

export interface CommandCaller {
  platform: string;
  id: string;
}

export interface AddonContext {
  settings: Record<string, string | boolean>;
  siteUrl: string;
  /** where this extension's outside service sends things */
  hookUrl: string;
  /** a value only storm and this extension's service know */
  hookSecret: string;
  commands: StormCommand[];
  /** Runs a command as the caller; staff checks and the audit log happen on storm's side. */
  run(name: string, args: Record<string, string>, caller: CommandCaller): Promise<string>;
  fetch(url: string, init?: RequestInit): Promise<Response>;
  log(message: string): void;
}

export interface HookRequest {
  /** names in lower case */
  headers: Record<string, string>;
  body: string;
}

export interface HookResponse {
  status: number;
  json?: unknown;
}

export interface Addon {
  /** reverse-domain package name, e.g. "storm.addons.discord" */
  pkg: string;
  name: string;
  version: string;
  sdk: number;
  description: string;
  settings: Setting[];
  /** Something happened on storm. */
  onEvent?(event: StormEvent, ctx: AddonContext): Promise<void>;
  /** A request arrived from the outside service. */
  hook?(request: HookRequest, ctx: AddonContext): Promise<HookResponse>;
  /** Settings changed: tell the outside service what it needs to know. */
  sync?(ctx: AddonContext): Promise<void>;
}

export function defineAddon(addon: Omit<Addon, "sdk">): Addon {
  return { ...addon, sdk: SDK_VERSION };
}

/** The plain words of an event, for services without rich messages. */
export const eventText = (e: StormEvent) => [e.title, e.text, e.url].filter(Boolean).join("\n\n");
