// src/app/api/v1/moderations/[id]/reject/route.ts
import { rejectModeration } from '@/server/moderationHandlers'
export const PATCH = rejectModeration
export const POST = rejectModeration
