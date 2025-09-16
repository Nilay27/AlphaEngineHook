import { defineChain } from 'viem'

export const abstractTestnet = defineChain({
  id: 11124,
  name: 'Abstract Testnet',
  network: 'abstract-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['https://api.testnet.abs.xyz'],
      webSocket: ['wss://api.testnet.abs.xyz/ws']
    },
  },
  blockExplorers: {
    default: {
      name: 'AbstractScan',
      url: 'https://sepolia.abscan.org/'
    },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11', // Standard multicall address
      blockCreated: 25770160,
    },
  },
})

export enum ScreenSize {
  LARGE,
  MEDIUM,
  MOBILE,
  TABLET,
  LAPTOP,
  DESKTOP,
}

export enum WalletNames {
  COINBASE = 'Coinbase Wallet',
  METAMASK = 'MetaMask',
  WALLET_CONNECT = 'WalletConnect',
  OKX = 'OkxWallet',
  BITGET = 'Bitget Wallet',
  COIN98 = 'COIN98',
  ONE_KEY = 'One Key',
  OKTO_WALLET = 'Okto Wallet',
  RABBY = 'Rabby',
  INJECTED = 'Injected',
  GATE = 'Gate Wallet',
  BYBIT = 'Bybit Wallet',
  EXODUS = 'Exodus',
  BINANCE = 'Binance Web3 Wallet',
  NIGHTLY = 'Nightly Wallet',
  RAZOR = 'Razor Wallet',
}