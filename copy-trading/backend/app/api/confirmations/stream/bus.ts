import { EventEmitter } from 'node:events'

const bus = new EventEmitter()

export const emitConfirmationEvent = (payload: any) => bus.emit('confirmation', payload)

export const subscribe = (fn: (p: any) => void) => { 
  bus.on('confirmation', fn)
  return () => bus.off('confirmation', fn) 
}