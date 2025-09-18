import '../styles/globals.css';
import type { AppProps } from 'next/app';
import React, { useEffect, useMemo, useState } from 'react';
import { ThemeProvider as NextThemeProvider, useTheme } from 'next-themes';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Layout from '../Components/Layout';
import { WagmiProvider } from 'wagmi';
import { config } from '../libs/wagmi-config';
import { AppTheme, darkTheme, lightTheme } from '../styles/theme';

const queryClient = new QueryClient();

const CSS_VARIABLE_PREFIX = '--color-';

const ThemeBridge: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { resolvedTheme } = useTheme();

  const theme = useMemo<AppTheme>(() => {
    return resolvedTheme === 'dark' ? darkTheme : lightTheme;
  }, [resolvedTheme]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const root = document.documentElement;
    root.style.colorScheme = theme.mode;

    Object.entries(theme.colors).forEach(([key, value]) => {
      const property = `${CSS_VARIABLE_PREFIX}${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
      root.style.setProperty(property, value);
    });
  }, [theme]);

  return <StyledThemeProvider theme={theme}>{children}</StyledThemeProvider>;
};

const ThemedToastContainer: React.FC = () => {
  const { resolvedTheme } = useTheme();

  return (
    <ToastContainer
      position='top-right'
      autoClose={5000}
      hideProgressBar={false}
      newestOnTop={true}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      style={{ zIndex: 9999 }}
      theme={resolvedTheme === 'dark' ? 'dark' : 'light'}
    />
  );
};

export default function App({ Component, pageProps }: AppProps) {
  return (
    <NextThemeProvider
      attribute='class'
      defaultTheme='system'
      enableSystem
      themes={['light', 'dark']}
      value={{ light: 'light', dark: 'dark' }}>
      <ThemeBridge>
        <Web3Wrapper>
          <Layout>
            <Component {...pageProps} />
          </Layout>
          <ThemedToastContainer />
      </Web3Wrapper>
      </ThemeBridge>
    </NextThemeProvider>
  );
}

export function Web3Wrapper({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
