import z from "zod";

export const ResourceSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string(),
  category: z.string(),
  category_raw: z.string().optional(),
  tags: z.string().nullable(),
  address: z.string().nullable(),
  city: z.string().nullable(),
  state: z.string().nullable(),
  zip: z.string().nullable(),
  phone: z.string().nullable(),
  email: z.string().nullable(),
  website: z.string().nullable(),
  hours: z.string().nullable(),
  schedule: z.string().nullable().optional(),
  action_urls: z.array(z.object({
    label: z.enum(["Register", "Learn More", "Visit Website", "Donate", "Volunteer"]),
    url: z.string().url()
  })).max(2).optional().nullable(),
  audience: z.string().nullable(),
  services: z.string().nullable(),
  image_url: z.string().nullable(),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  is_featured: z.union([z.boolean(), z.number().transform(val => val === 1)]),
  is_approved: z.union([z.boolean(), z.number().transform(val => val === 1)]),
  user_id: z.string().nullable().optional(),
  contact_email: z.string().nullable().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  click_count: z.number().optional().nullable(),
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
  schedule: z.string().optional(),
  action_urls: z.array(z.object({
    label: z.enum(["Register", "Learn More", "Visit Website", "Donate", "Volunteer"]),
    url: z.string().url()
  })).max(2).optional(),
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
