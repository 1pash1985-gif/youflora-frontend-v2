// src/app/api/v1/moderations/[id]/approve/route.ts
import { approveModeration } from '@/server/moderationHandlers'
export const PATCH = approveModeration
export const POST = approveModeration
