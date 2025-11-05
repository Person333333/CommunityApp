import z from "zod";

export const ResourceSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string(),
  category: z.string(),
  tags: z.string().nullable(),
  address: z.string().nullable(),
  city: z.string().nullable(),
  state: z.string().nullable(),
  zip: z.string().nullable(),
  phone: z.string().nullable(),
  email: z.string().nullable(),
  website: z.string().nullable(),
  hours: z.string().nullable(),
  audience: z.string().nullable(),
  services: z.string().nullable(),
  image_url: z.string().nullable(),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  is_featured: z.number().transform(val => val === 1),
  is_approved: z.number().transform(val => val === 1),
  created_at: z.string(),
  updated_at: z.string(),
});

export type ResourceType = z.infer<typeof ResourceSchema>;

export const ResourceSubmissionSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  category: z.string().min(1, "Please select a category"),
  contact_name: z.string().min(2, "Contact name is required"),
  contact_email: z.string().email("Valid email is required"),
  phone: z.string().optional(),
  website: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
});

export type ResourceSubmissionType = z.infer<typeof ResourceSubmissionSchema>;

export const categories = [
  "Food Assistance",
  "Healthcare",
  "Housing",
  "Employment",
  "Education",
  "Senior Services",
  "Mental Health",
  "Legal Aid",
  "Transportation",
  "Child Care",
  "Veterans Services",
  "Financial Assistance",
] as const;
