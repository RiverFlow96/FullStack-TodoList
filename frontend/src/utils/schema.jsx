import { z } from "zod";

// Definicion del esquema de formulario

export const registerSchema = z.object({
    username: z.string().min(3, { error: "El nombre debe tener al menos 3 caracteres" }),
    email: z.email({ error: "Introduce un email valido" }),
    password: z.string()
        .min(8, { error: "La contrasenia debe tener al menos 8 caracteres" }),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    error: "Las contrasenias no coinciden",
    path: ["confirmPassword"]
})