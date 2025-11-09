// src/app/api/v1/support/stream/route.ts
import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const ticketId = searchParams.get('ticketId') || ''
  if (!ticketId) {
    return new Response('ticketId required', { status: 400 })
  }

  let lastTs = Date.now()

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder()

      const send = (type: string, payload: any) => {
        controller.enqueue(encoder.encode(`event: ${type}\n`))
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`))
      }

      const iv = setInterval(async () => {
        try {
          const since = new Date(lastTs)
          const items = await prisma.supportMessage.findMany({
            where: { ticketId, createdAt: { gt: since } },
            orderBy: { createdAt: 'asc' },
          })
        if (items.length) {
            lastTs = Date.now()
            send('message', items)
          } else {
            // heartbeat
            send('ping', { t: Date.now() })
          }
        } catch (e: any) {
          send('error', { error: e?.message || 'poll failed' })
        }
      }, 2000)

      const heart = setInterval(() => {
        controller.enqueue(encoder.encode(`: keepalive ${Date.now()}\n\n`))
      }, 15000)

      // immediate hello
      send('hello', { ok: true })

      // close logic
      const close = () => {
        clearInterval(iv)
        clearInterval(heart)
        controller.close()
      }
      // @ts-ignore
      req.signal?.addEventListener?.('abort', close)
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  })
}
