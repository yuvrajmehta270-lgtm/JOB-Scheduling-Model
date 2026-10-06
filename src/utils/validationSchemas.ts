import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const jobSchema = z
  .object({
    title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title cannot exceed 100 characters'),
    description: z.string().min(5, 'Description must be at least 5 characters'),
    assignedTo: z.string().nullable(),
    priority: z.enum(['low', 'medium', 'high', 'critical']),
    status: z.enum(['pending', 'scheduled', 'in_progress', 'completed', 'cancelled', 'overdue']),
    startTime: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid start time'),
    endTime: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid end time'),
    location: z.string().optional(),
    notes: z.string().optional(),
  })
  .refine(
    (data) => {
      const start = new Date(data.startTime).getTime();
      const end = new Date(data.endTime).getTime();
      return end > start;
    },
    {
      message: 'End time must be after start time',
      path: ['endTime'],
    }
  );

export type JobFormData = z.infer<typeof jobSchema>;

export const userSchema = z.object({
  displayName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  role: z.enum(['admin', 'manager', 'employee']),
  department: z.string().min(2, 'Department is required'),
  status: z.enum(['active', 'inactive']),
});

export type UserFormData = z.infer<typeof userSchema>;
