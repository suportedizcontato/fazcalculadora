import * as z from "zod";
import { normalizeDecimal } from "./rescisao";

// Padrão de campo monetário reutilizável
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

// Padrão de campo inteiro positivo
const campoInteiroPositivo = (label: string, min: number, max: number) =>
  z.coerce
    .number({ invalid_type_error: "Insira um número válido" })
    .int({ message: "Insira um número inteiro" })
    .min(min, `Mínimo ${min}`)
    .max(max, `Máximo ${max}`);

// ─── rescisaoSchema ───────────────────────────────────────────────────────────

export const rescisaoSchema = z.object({
  salario: campoMonetario("Salário"),
  tipoDesligamento: z.enum([
    "sem-justa-causa",
    "pedido-demissao",
    "justa-causa",
    "acordo-mutuo",
  ]),
  anos: campoInteiroPositivo("Anos", 0, 100),
  meses: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? 0 : v),
    z.coerce.number({ invalid_type_error: "Insira um número válido" })
      .int({ message: "Insira um número inteiro" })
      .min(0).max(11, "Máximo 11")
  ),
  diasTrabalhados: campoInteiroPositivo("Dias trabalhados", 1, 31),
  meses13: campoInteiroPositivo("Meses do 13º", 1, 12),
  avisoPrevioCumprido: z.boolean().default(true),
});

export type RescisaoFormInput = z.input<typeof rescisaoSchema>;
export type RescisaoFormData = z.output<typeof rescisaoSchema>;

// ─── feriasSchema ─────────────────────────────────────────────────────────────

export const feriasSchema = z.object({
  salario: campoMonetario("Salário"),
  mesesAquisitivos: campoInteiroPositivo("Meses aquisitivos", 1, 12),
  solicitarAbono: z.boolean().default(false),
});

export type FeriasFormInput = z.input<typeof feriasSchema>;
export type FeriasFormData = z.output<typeof feriasSchema>;

// ─── decimoSchema ─────────────────────────────────────────────────────────────

export const decimoSchema = z.object({
  salario: campoMonetario("Salário"),
  mesesTrabalhados: campoInteiroPositivo("Meses trabalhados", 1, 12),
});

export type DecimoFormInput = z.input<typeof decimoSchema>;
export type DecimoFormData = z.output<typeof decimoSchema>;
