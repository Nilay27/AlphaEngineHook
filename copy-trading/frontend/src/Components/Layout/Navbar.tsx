import styled from "styled-components";
import { useRouter } from "next/router";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const NavbarContainer = styled.div`
  height: 64px;
  width: 100%;
  padding: 10px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 100;
  background-color: ${({ theme }) => theme.colors.navBackground};
  color: ${({ theme }) => theme.colors.navText};
  transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease;
  border-bottom: 1px solid ${({ theme }) => theme.colors.subtleBorder};
`;

const Logo = styled.div`
  font-size: 24px;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.navText};
  cursor: pointer;
`;

const UserSection = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const UserAvatar = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  background-color: ${({ theme }) => theme.colors.primaryMuted};
  color: ${({ theme }) => theme.colors.navText};
  border: 1px solid ${({ theme }) => theme.colors.subtleBorder};
`;

const LoginButton = styled.button`
  background-color: ${({ theme }) => theme.colors.navText};
  color: ${({ theme }) => theme.colors.navBackground};
  border: 1px solid ${({ theme }) => theme.colors.navText};
  border-radius: 4px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background-color 0.2s ease, transform 0.2s ease, color 0.2s ease;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryMuted};
    color: ${({ theme }) => theme.colors.navText};
    transform: translateY(-1px);
  }

  &:focus-visible {
    outline: none;
    box-shadow: ${({ theme }) => theme.shadows.focus};
  }
`;

const WalletIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ThemeToggle = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid ${({ theme }) => theme.colors.subtleBorder};
  background: transparent;
  color: ${({ theme }) => theme.colors.navText};
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease, transform 0.2s ease;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryMuted};
    transform: translateY(-1px);
  }

  &:focus-visible {
    outline: none;
    box-shadow: ${({ theme }) => theme.shadows.focus};
  }
`;

const Navbar = () => {
  const router = useRouter();
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const isLoggedIn = true; // You can replace this with actual auth state

  useEffect(() => setMounted(true), []);

  const handleLogoClick = () => {
    router.push("/");
  };

  const handleLoginClick = () => {
    router.push("/auth/login");
  };

  const handleToggleTheme = () => {
    const nextTheme = resolvedTheme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
  };

  return (
    <NavbarContainer>
      <Logo onClick={handleLogoClick}>Alpha Engine</Logo>
      <UserSection>
        {mounted && (
          <ThemeToggle
            onClick={handleToggleTheme}
            aria-label={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} theme`}>
            {resolvedTheme === 'dark' ? (
              <svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.5'>
                <path d='M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z' />
              </svg>
            ) : (
              <svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.5'>
                <circle cx='12' cy='12' r='4' />
                <path d='M12 4V2' />
                <path d='M12 22v-2' />
                <path d='m17 7 1.5-1.5' />
                <path d='m5.5 18.5 1.5-1.5' />
                <path d='M4 12H2' />
                <path d='M22 12h-2' />
                <path d='m7 7-1.5-1.5' />
                <path d='m18.5 18.5-1.5-1.5' />
              </svg>
            )}
          </ThemeToggle>
        )}
        {isLoggedIn ? (
          <UserAvatar>
            {router.pathname.startsWith("/company") || router.pathname.startsWith("/alpha-generator") ? "AG" : "AC"}
          </UserAvatar>
        ) : (
          <LoginButton onClick={handleLoginClick}>
            <WalletIcon>
              <svg
                width='18'
                height='18'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'>
                <path d='M20 6H4C2.89543 6 2 6.89543 2 8V16C2 17.1046 2.89543 18 4 18H20C21.1046 18 22 17.1046 22 16V8C22 6.89543 21.1046 6 20 6Z' />
                <path d='M14 14C15.1046 14 16 13.1046 16 12C16 10.8954 15.1046 10 14 10C12.8954 10 12 10.8954 12 12C12 13.1046 12.8954 14 14 14Z' />
              </svg>
            </WalletIcon>
            Log In / Sign Up
          </LoginButton>
        )}
      </UserSection>
    </NavbarContainer>
  );
};

export default Navbar;
