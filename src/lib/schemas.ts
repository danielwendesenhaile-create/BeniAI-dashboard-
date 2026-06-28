import { z } from 'zod';

export const RouterPayloadSchema = z.object({
  id: z.string().min(1).max(128),
  source: z.enum(['gmail', 'whatsapp', 'slack']),
  sender: z.string().min(1).max(300),
  subject: z.string().min(0).max(300),
  body: z.string().min(1).max(4000),
});

export const EmailAgentPayloadSchema = z.object({
  sender: z.string().min(1).max(300),
  subject: z.string().max(300),
  body: z.string().min(1).max(4000),
  category: z.string(),
  urgencyScore: z.number().int().min(1).max(5),
});

export const SchedulerPayloadSchema = z.object({
  sender: z.string().min(1).max(300),
  subject: z.string().max(300),
  body: z.string().min(1).max(4000),
});

export const GuardianPayloadSchema = z.object({
  sender: z.string().min(1).max(300),
  subject: z.string().max(300),
  body: z.string().min(1).max(4000),
  source: z.string(),
});

export const SendGmailSchema = z.object({
  to: z.string().email(),
  subject: z.string().min(1).max(300),
  body: z.string().min(1).max(8000),
  threadId: z.string().optional(),
});

export const SendSlackSchema = z.object({
  channel: z.string().min(1).max(100),
  text: z.string().min(1).max(4000),
  thread_ts: z.string().optional(),
});

export const SendWhatsAppSchema = z.object({
  to: z.string().regex(/^\+?[1-9]\d{6,14}$/, 'Must be a valid phone number'),
  text: z.string().min(1).max(4000),
});
