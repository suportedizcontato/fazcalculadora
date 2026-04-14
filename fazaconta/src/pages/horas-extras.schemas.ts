import * as z from "zod";
import { normalizeDecimal } from "./rescisao";

export const SALARIO_MINIMO_2025 = 1518;

// Reutiliza o padrão de campoMonetario do projeto
const campoMonetario = (label: string) =>
  z
    .string()
    .min(1, `${label} é obrigatório`)
    .transform(normalizeDecimal)
    .pipe(
      z.coerce
        .number()
        .refine((v) => isFinite(v), { message: "Insira um número válido" })
        .refine((v) => v > 0, { message: `${label} deve ser maior que zero` })
        .refine((v) => v <= 999999.99, { message: `${label} máximo: R$ 999.999,99` })
    );

export const horasExtrasSchema = z.object({
  salario: campoMonetario("Salário"),
  jornadaDiaria: z.coerce.number().min(1, "Mínimo 1h").max(24, "Máximo 24h").default(8),
  diasSemana: z.coerce.number().int().min(1, "Mínimo 1 dia").max(7, "Máximo 7 dias").default(5),
  horasExtrasUteis: z.coerce
    .number({ invalid_type_error: "Número inválido" })
    .min(0, "Mínimo 0")
    .max(744, "Máximo 744h")
    .default(0),
  horasExtrasFeriado: z.coerce
    .number({ invalid_type_error: "Número inválido" })
    .min(0, "Mínimo 0")
    .max(744, "Máximo 744h")
    .default(0),
  horasNoturnas: z.coerce
    .number({ invalid_type_error: "Número inválido" })
    .min(0, "Mínimo 0")
    .max(744, "Máximo 744h")
    .default(0),
  horasExtrasNoturnas: z.coerce
    .number({ invalid_type_error: "Número inválido" })
    .min(0, "Mínimo 0")
    .max(744, "Máximo 744h")
    .default(0),
  horasExtrasNoturnasFerias: z.coerce
    .number({ invalid_type_error: "Número inválido" })
    .min(0, "Mínimo 0")
    .max(744, "Máximo 744h")
    .default(0),
});

export type HorasExtrasFormData = z.output<typeof horasExtrasSchema>;
