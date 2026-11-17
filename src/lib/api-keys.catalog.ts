/**
 * Public metadata for supported API key integrations.
 * Safe to import from both client and server — contains no secrets.
 */
export type ApiKeyField = {
  id: string;
  label: string;
  placeholder: string;
  type?: "text" | "password" | "url";
};

export type ApiKeyService = {
  id: string;
  label: string;
  description: string;
  docsUrl: string;
  placeholder: string;
  /** Regex the key value must match (server-side validation only). */
  pattern?: RegExp;
  /** If true, the platform shows the onboarding banner until configured. */
  required?: boolean;
  /** Multi-field mode: replaces the single key input with multiple fields stored as JSON. */
  fields?: ApiKeyField[];
};

export const API_KEY_CATALOG: readonly ApiKeyService[] = [
  {
    id: "panda_video",
    label: "Panda Video",
    description: "Hospedagem de vídeos das aulas (player + embed).",
    docsUrl: "https://pandavideo.readme.io/reference/auth",
    placeholder: "panda-...",
    required: true,
  },
  {
    id: "resend",
    label: "Resend",
    description: "Envio de emails transacionais (convites, notificações, recuperação).",
    docsUrl: "https://resend.com/docs/dashboard/api-keys/introduction",
    placeholder: "re_...",
    pattern: /^re_[A-Za-z0-9_-]{8,}$/,
    required: true,
  },
  {
    id: "evolution_api",
    label: "Evolution API (WhatsApp)",
    description: "Envio de notificações WhatsApp para alertas de vencimento de treinamentos NR.",
    docsUrl: "https://doc.evolution-api.com/v2/pt/get-started/introduction",
    placeholder: "",
    fields: [
      { id: "url",      label: "URL Base",          placeholder: "https://evolution.suaempresa.com", type: "url" },
      { id: "instance", label: "Nome da instância",  placeholder: "principal",                        type: "text" },
      { id: "key",      label: "API Key",             placeholder: "sua-api-key",                      type: "password" },
    ],
  },
  {
    id: "openai",
    label: "OpenAI (opcional)",
    description: "Geração de quizzes assistida por IA. Sobrescreve a integração Lovable AI padrão.",
    docsUrl: "https://platform.openai.com/api-keys",
    placeholder: "sk-...",
    pattern: /^sk-[A-Za-z0-9_-]{20,}$/,
  },
] as const;

export const SERVICE_IDS = API_KEY_CATALOG.map((s) => s.id);

export function getService(id: string): ApiKeyService | undefined {
  return API_KEY_CATALOG.find((s) => s.id === id);
}
