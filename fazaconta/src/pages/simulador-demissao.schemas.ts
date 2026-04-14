import * as z from "zod";
import { normalizeDecimal } from "./rescisao";

// Reutiliza padrões de campo do projeto
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

const campoInteiroPositivo = (label: string, min: number, max: number) =>
  z.coerce
    .number({ invalid_type_error: "Insira um número válido" })
    .int({ message: "Insira um número inteiro" })
    .min(min, `Mínimo ${min}`)
    .max(max, `Máximo ${max}`);

export const simuladorSchema = z
  .object({
    salario: campoMonetario("Salário"),
    dataAdmissao: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida (use AAAA-MM-DD)"),
    dataDemissao: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida (use AAAA-MM-DD)"),
    diasTrabalhados: campoInteiroPositivo("Dias trabalhados", 1, 31),
    feriasVencidas: z.coerce.number().int().min(0).max(30).default(0),
    feriasProporcionaisMeses: z.coerce.number().int().min(0).max(11).default(0),
    meses13: campoInteiroPositivo("Meses do 13º", 1, 12),
    saldoFgts: z
      .string()
      .default("0")
      .transform(normalizeDecimal)
      .pipe(z.coerce.number().min(0).max(9999999.99)),
    cumpriuAvisoPrevio: z.boolean().default(true),
  })
  .refine(
    (data) => new Date(data.dataDemissao) >= new Date(data.dataAdmissao),
    { message: "Data de demissão deve ser posterior à admissão", path: ["dataDemissao"] }
  );

export type SimuladorFormData = z.output<typeof simuladorSchema>;
