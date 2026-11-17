/**
 * Server functions for API key management.
 * Thin wrappers only — actual logic lives in `api-keys.server.ts`.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import {
  assertAdmin,
  deleteVaultKey,
  recordValidation,
  upsertVaultKey,
  validateKey,
} from "./api-keys.server";
import { getService, SERVICE_IDS } from "./api-keys.catalog";

const serviceNameSchema = z.enum(SERVICE_IDS as [string, ...string[]]);

const keySchema = z
  .string()
  .trim()
  .min(8, "Chave muito curta")
  .max(500, "Chave muito longa");

export type ApiKeyRegistryEntry = {
  service_name: string;
  label: string | null;
  is_active: boolean;
  last_validated_at: string | null;
  last_validation_status: "valid" | "invalid" | "error" | null;
  updated_at: string;
};

export const listApiKeys = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<ApiKeyRegistryEntry[]> => {
    await assertAdmin(context.userId);
    const { data, error } = await supabaseAdmin
      .from("api_keys_registry")
      .select("service_name,label,is_active,last_validated_at,last_validation_status,updated_at");
    if (error) throw new Error("list failed");
    return (data ?? []) as ApiKeyRegistryEntry[];
  });

export const storeApiKey = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => {
    const parsed = z
      .object({
        service_name: serviceNameSchema,
        key: keySchema,
        label: z.string().trim().max(80).nullish(),
      })
      .parse(input);
    const svc = getService(parsed.service_name);
    if (svc?.pattern && !svc.pattern.test(parsed.key)) {
      throw new Error("Formato de chave inválido para este serviço");
    }
    return parsed;
  })
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    await upsertVaultKey({
      serviceName: data.service_name,
      key: data.key,
      label: data.label ?? null,
      userId: context.userId,
    });
    return { ok: true as const };
  });

export const deleteApiKey = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ service_name: serviceNameSchema }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    await deleteVaultKey(data.service_name);
    return { ok: true as const };
  });

export const validateApiKey = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ service_name: serviceNameSchema }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const result = await validateKey(data.service_name);
    await recordValidation(data.service_name, result.status);
    return result;
  });
