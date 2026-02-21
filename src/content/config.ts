import { defineCollection, z } from 'astro:content';

// 部落格文章集合
const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    heroImage: z.string().optional(),
    category: z.enum(["AI", "自動化", "SRE", "N8N", "Mobile App"]),
    tags: z.array(z.string()).default([]),
    seoKeywords: z.array(z.string()).optional(),
    draft: z.boolean().default(false),
    featured: z.boolean().default(false),
    author: z.string().default('您的姓名'),
    readingTime: z.number().optional(),
  }),
});

// 作品集集合
const portfolio = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    heroImage: z.string(),
    gallery: z.array(z.string()).optional(),
    technologies: z.array(z.string()),
    category: z.string(),
    projectUrl: z.string().url().optional(),
    githubUrl: z.string().url().optional(),
    featured: z.boolean().default(false),
    order: z.number().default(0),
    status: z.enum(['completed', 'in-progress', 'planned']).default('completed'),
    startDate: z.coerce.date(),
    endDate: z.coerce.date().optional(),
  }),
});

export const collections = {
  blog,
  portfolio,
}; 
