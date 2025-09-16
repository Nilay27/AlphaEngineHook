import './globals.css'
import React from 'react'
import type { Metadata } from 'next'

import { NavBar } from '@/components/utilities/nav-bar'
import { WalletProvider } from '@/components/utilities/wallet-provider'
import { WebSocketLogger } from '@/components/utilities/web-socket-logger'

export const metadata: Metadata = {
  title: 'AlphaEngine',
  description: 'Copy Trading Platform',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <WalletProvider>
          <NavBar />
          <main>{children}</main>
          {process.env.NODE_ENV !== 'production' && <WebSocketLogger />}
        </WalletProvider>
      </body>
    </html>
  )
}