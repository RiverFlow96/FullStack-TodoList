import { describe, it, expect } from 'vitest'
import { registerSchema, loginSchema, TaskSchema } from '../../utils/schema'

describe('Validation Schemas', () => {
  describe('registerSchema', () => {
    it('validates correct registration data', () => {
      const validData = {
        username: 'johndoe',
        email: 'john@example.com',
        password: 'SecurePass123!',
        confirmPassword: 'SecurePass123!',
      }

      const result = registerSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('rejects username less than 3 characters', () => {
      const invalidData = {
        username: 'ab',
        email: 'john@example.com',
        password: 'SecurePass123!',
        confirmPassword: 'SecurePass123!',
      }

      const result = registerSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('rejects invalid email', () => {
      const invalidData = {
        username: 'johndoe',
        email: 'invalid-email',
        password: 'SecurePass123!',
        confirmPassword: 'SecurePass123!',
      }

      const result = registerSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('rejects password without lowercase letter', () => {
      const invalidData = {
        username: 'johndoe',
        email: 'john@example.com',
        password: 'SECUREPASS123!',
        confirmPassword: 'SECUREPASS123!',
      }

      const result = registerSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('rejects password without uppercase letter', () => {
      const invalidData = {
        username: 'johndoe',
        email: 'john@example.com',
        password: 'securepass123!',
        confirmPassword: 'securepass123!',
      }

      const result = registerSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('rejects password without number', () => {
      const invalidData = {
        username: 'johndoe',
        email: 'john@example.com',
        password: 'SecurePass!',
        confirmPassword: 'SecurePass!',
      }

      const result = registerSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('rejects password without special character', () => {
      const invalidData = {
        username: 'johndoe',
        email: 'john@example.com',
        password: 'SecurePass123',
        confirmPassword: 'SecurePass123',
      }

      const result = registerSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('rejects mismatched passwords', () => {
      const invalidData = {
        username: 'johndoe',
        email: 'john@example.com',
        password: 'SecurePass123!',
        confirmPassword: 'DifferentPass123!',
      }

      const result = registerSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  describe('loginSchema', () => {
    it('validates correct login data', () => {
      const validData = {
        username: 'johndoe',
        password: 'SecurePass123!',
      }

      const result = loginSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('rejects username less than 3 characters', () => {
      const invalidData = {
        username: 'ab',
        password: 'SecurePass123!',
      }

      const result = loginSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('rejects invalid password', () => {
      const invalidData = {
        username: 'johndoe',
        password: 'weak',
      }

      const result = loginSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  describe('TaskSchema', () => {
    it('validates task with title and description', () => {
      const validData = {
        title: 'My Task',
        description: 'Task description',
      }

      const result = TaskSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('validates task with title and empty description', () => {
      const validData = {
        title: 'My Task',
        description: '',
      }

      const result = TaskSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('rejects task without title', () => {
      const invalidData = {
        title: '',
        description: 'Description without title',
      }

      const result = TaskSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })
})
