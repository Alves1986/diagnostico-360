import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { adminProcedure, publicProcedure, router } from "./_core/trpc";
import { getAppSettings, insertLead, listLeads, saveAppSettings } from "./db";
import { systemRouter } from "./_core/systemRouter";

const answersSchema = z.object({
  name: z.string().min(1),
  company: z.string().min(1),
  segment: z.string().optional(),
  role: z.string().optional(),
  whatsapp: z.string().min(1),
  email: z.string().optional(),
  objective: z.array(z.string()).default([]),
  objectiveDetails: z.string().optional(),
  challenge: z.array(z.string()).default([]),
  challengeCause: z.string().optional(),
  impact: z.array(z.string()).default([]),
  consequence: z.string().optional(),
  bottleneck: z.array(z.string()).default([]),
  bottleneckDetails: z.string().optional(),
  clientImprovement: z.array(z.string()).default([]),
  clientComplaint: z.string().optional(),
  futureVision: z.string().optional(),
  futureObstacle: z.string().optional(),
  vulnerability: z.array(z.string()).default([]),
  experiment: z.string().optional(),
  experimentBarrier: z.string().optional(),
  support: z.array(z.string()).default([]),
  urgency: z.string().optional(),
  decisionMakers: z.string().optional(),
  previousAttempts: z.string().optional(),
}).passthrough();

const diagnosisSchema = z.object({
  maturity: z.number().int().min(0).max(100),
  level: z.string(),
  temperature: z.string(),
  priority: z.string(),
  segment: z.string(),
  secondarySegment: z.string(),
  solution: z.string(),
  summary: z.string(),
  consequence: z.string(),
  direction: z.string(),
  approach: z.string(),
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  settings: router({
    get: publicProcedure.query(() => getAppSettings()),
    updateWhatsapp: adminProcedure
      .input(z.object({ whatsappNumber: z.string().max(32) }))
      .mutation(({ input }) => saveAppSettings(input.whatsappNumber.trim())),
  }),

  leads: router({
    create: publicProcedure
      .input(z.object({ answers: answersSchema, diagnosis: diagnosisSchema }))
      .mutation(async ({ input }) => {
        const { answers, diagnosis } = input;
        const created = await insertLead({
          name: answers.name,
          company: answers.company,
          segment: answers.segment || null,
          role: answers.role || null,
          whatsapp: answers.whatsapp,
          email: answers.email || null,
          objective: answers.objective.join(", ") || null,
          challenge: answers.challenge.join(", ") || null,
          maturity: diagnosis.maturity,
          level: diagnosis.level,
          temperature: diagnosis.temperature,
          priority: diagnosis.priority,
          recommendation: diagnosis.segment,
          answersJson: JSON.stringify(answers),
          diagnosisJson: JSON.stringify(diagnosis),
        });
        return { ...created, saved: true };
      }),
    list: adminProcedure.query(() => listLeads()),
  }),
});

export type AppRouter = typeof appRouter;
