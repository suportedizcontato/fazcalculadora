import * as z from "zod";
import { normalizeDecimal } from "./rescisao";

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

const semanaItemSchema = z.object({
  periodo: z.string().min(1, "Informe o período"),
  horasTrabalhadas: z.coerce
    .number({ invalid_type_error: "Número inválido" })
    .min(0, "Mínimo 0")
    .max(168, "Máximo 168h por semana"),
  horasDevidas: z.coerce
    .number({ invalid_type_error: "Número inválido" })
    .min(0, "Mínimo 0")
    .max(168, "Máximo 168h por semana"),
});

export const bancoDeHorasSchema = z.object({
  salario: campoMonetario("Salário"),
  jornadaDiaria: z.coerce.number().min(1).max(24).default(8),
  diasPorSemana: z.coerce.number().int().min(1).max(7).default(5),
  regime: z.enum(["informal", "formal"]),
  dataInicio: z.string().optional(),
  semanas: z
    .array(semanaItemSchema)
    .min(1, "Adicione ao menos uma semana para calcular o saldo")
    .max(52, "Máximo de 52 semanas"),
});

export type BancoDeHorasFormData = z.output<typeof bancoDeHorasSchema>;
