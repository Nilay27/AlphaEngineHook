import { NextRequest } from 'next/server';
import { tradeLifecycleService } from '@/lib/services/trade-lifecycle.service';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const consumerAddress = searchParams.get('address');
  
  if (!consumerAddress) {
    return new Response('Missing address parameter', { status: 400 });
  }
  
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      
      controller.enqueue(encoder.encode(':ping\n\n'));
      
      const sendEvent = (eventType: string, data: any) => {
        const message = `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(encoder.encode(message));
      };
      
      const onTradeCreated = (trade: any) => {
        if (trade.realConsumerAddress === consumerAddress) {
          sendEvent('NEW_TRADE', {
            confirmationId: trade.confirmationId,
            generatorAddress: trade.alphaGeneratorAddress,
            protocolId: trade.protocolId,
            action: trade.action,
            expiryTime: trade.expiryTime,
            status: trade.status,
            metadata: trade.metadata,
            timestamp: new Date().toISOString(),
          });
        }
      };
      
      const onTradeStatusChanged = (trade: any) => {
        if (trade.realConsumerAddress === consumerAddress) {
          sendEvent('STATUS_UPDATE', {
            confirmationId: trade.confirmationId,
            status: trade.status,
            previousStatus: trade.previousStatus,
            txHash: trade.txHash,
            executedAt: trade.executedAt,
            gasUsed: trade.gasUsed,
            timestamp: new Date().toISOString(),
          });
        }
      };
      
      const onExpiryWarning = (trade: any) => {
        if (trade.realConsumerAddress === consumerAddress) {
          sendEvent('EXPIRY_WARNING', {
            confirmationId: trade.confirmationId,
            expiryTime: trade.expiryTime,
            timeRemaining: trade.timeRemaining,
            timestamp: new Date().toISOString(),
          });
        }
      };
      
      const onSubscriptionUpdate = (update: any) => {
        if (update.consumerAddress === consumerAddress || 
            update.encryptedSubscriber === consumerAddress) {
          sendEvent('SUBSCRIPTION_UPDATE', {
            type: update.type,
            generator: update.generator,
            timestamp: update.timestamp,
          });
        }
      };
      
      const onTradeExpired = (trade: any) => {
        if (trade.realConsumerAddress === consumerAddress) {
          sendEvent('TRADE_EXPIRED', {
            confirmationId: trade.confirmationId,
            generatorAddress: trade.alphaGeneratorAddress,
            expiredAt: new Date().toISOString(),
          });
        }
      };
      
      tradeLifecycleService.on('tradeCreated', onTradeCreated);
      tradeLifecycleService.on('tradeStatusChanged', onTradeStatusChanged);
      tradeLifecycleService.on('expiryWarning', onExpiryWarning);
      tradeLifecycleService.on('subscriptionUpdate', onSubscriptionUpdate);
      tradeLifecycleService.on('tradeExpired', onTradeExpired);
      
      const pingInterval = setInterval(() => {
        controller.enqueue(encoder.encode(':ping\n\n'));
      }, 30000);
      
      const cleanup = () => {
        tradeLifecycleService.off('tradeCreated', onTradeCreated);
        tradeLifecycleService.off('tradeStatusChanged', onTradeStatusChanged);
        tradeLifecycleService.off('expiryWarning', onExpiryWarning);
        tradeLifecycleService.off('subscriptionUpdate', onSubscriptionUpdate);
        tradeLifecycleService.off('tradeExpired', onTradeExpired);
        clearInterval(pingInterval);
      };
      
      req.signal.addEventListener('abort', () => {
        cleanup();
        controller.close();
      });
      
      sendEvent('CONNECTED', {
        consumerAddress,
        timestamp: new Date().toISOString(),
        message: 'Successfully connected to trade stream',
      });
    },
  });
  
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}