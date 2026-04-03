import { z } from "zod";

// Definicion del esquema de formulario

export const registerSchema = z.object({
    username: z.string().min(3, { error: "El nombre debe tener al menos 3 caracteres" }),
    email: z.email({ error: "Introduce un email valido" }).min(1, { error: "Este campo es obligatorio" }),
    password: z.string()
        .min(8, { error: "La contrasenia debe tener al menos 8 caracteres" })
        .regex(/^(?=.*[a-z])(?=.*[A-Z])/, "debe contener minimo una minusca y mayuscula")
        .regex(/(?=.*[0-9])/, 'debe contener al meno un numero')
        .regex(/(?=.*[!@#$%^&*(),.?":{}|<>])/, 'debe contener caracteres especiales'),
    confirmPassword: z.string().min(8, "se requieren minimo 8 caracteres"),
}).refine((data) => data.password === data.confirmPassword, {
    error: "Las contrasenias no coinciden",
    path: ["confirmPassword"]
})

export const loginSchema = z.object({
    username: z.string().min(3, { error: "El nombre debe tener al menos 3 caracteres" }),
    password: z.string()
        .min(8, { error: "La contrasenia debe tener al menos 8 caracteres" })
        .regex(/^(?=.*[a-z])(?=.*[A-Z])/, "debe contener minimo una minusca y mayuscula")
        .regex(/(?=.*[0-9])/, 'debe contener al meno un numero')
        .regex(/(?=.*[!@#$%^&*(),.?":{}|<>])/, 'debe contener caracteres especiales'),
})

export const TaskSchema = z.object({
    title: z.string().min(1, { error: "Este campo es obligatorio" }),
    description: z.string()
})