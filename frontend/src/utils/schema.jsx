import { z } from "zod";

// Definicion del esquema de formulario

const getPasswordRequirementsError = (password) => {
    const missingRequirements = []

    if (password.length < 8) missingRequirements.push(" 8 caracteres")
    if (!/[a-z]/.test(password)) missingRequirements.push("una letra minúscula")
    if (!/[A-Z]/.test(password)) missingRequirements.push("una letra mayúscula")
    if (!/[0-9]/.test(password)) missingRequirements.push("un número")
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) missingRequirements.push("al menos un carácter especial")

    if (missingRequirements.length === 0) return null

    return `La contrasenia debe contener al menos: ${missingRequirements.join(", ")}.`
}

export const registerSchema = z.object({
    username: z.string().min(3, { error: "El nombre debe tener al menos 3 caracteres" }),
    email: z.email({ error: "Introduce un email valido" }).min(1, { error: "Este campo es obligatorio" }),
    password: z.string().superRefine((password, context) => {
        const passwordError = getPasswordRequirementsError(password)
        if (passwordError) {
            context.addIssue({
                code: z.ZodIssueCode.custom,
                message: passwordError,
            })
        }
    }),
    confirmPassword: z.string().min(8, "se requieren minimo 8 caracteres"),
}).refine((data) => data.password === data.confirmPassword, {
    error: "Las contrasenias no coinciden",
    path: ["confirmPassword"]
})

export const loginSchema = z.object({
    username: z.string().min(3, { error: "El nombre debe tener al menos 3 caracteres" }),
    password: z.string().superRefine((password, context) => {
        const passwordError = getPasswordRequirementsError(password)
        if (passwordError) {
            context.addIssue({
                code: z.ZodIssueCode.custom,
                message: passwordError,
            })
        }
    }),
})

export const TaskSchema = z.object({
    title: z.string().min(1, { error: "Este campo es obligatorio" }),
    description: z.string()
})