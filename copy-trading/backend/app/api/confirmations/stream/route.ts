import { NextRequest } from 'next/server'
import { subscribe } from './bus'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  // During build time, return immediately to avoid timeout
  if (process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE === 'phase-production-build') {
    return new Response('Build time - stream not available', { status: 503 })
  }
  let cleanupFn: (() => void) | null = null
  
  const stream = new ReadableStream({
    start(controller) {
      const enc = new TextEncoder()
      const send = (data: any) => controller.enqueue(enc.encode(`data: ${JSON.stringify(data)}\n\n`))
      const unsub = subscribe(send)
      const heart = setInterval(() => controller.enqueue(enc.encode(`: ping\n\n`)), 15000)
      
      cleanupFn = () => { 
        clearInterval(heart)
        unsub() 
      }
    },
    cancel() {
      if (cleanupFn) cleanupFn()
    }
  })
  
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    }
  })
}