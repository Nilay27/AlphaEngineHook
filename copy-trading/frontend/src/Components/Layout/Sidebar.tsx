import { useRouter } from "next/router";
import Link from "next/link";
import styled from "styled-components";
import { HamburgerIcon, LogoutIcon } from "../Icons/Icon";
import Image from "next/image";
import { useState, useMemo, useCallback, useEffect } from "react";
import { useAccount } from "wagmi";

const SidebarContainer = styled.div<{ $isCollapsed: boolean }>`
  width: ${(props) => (props.$isCollapsed ? "60px" : "240px")};
  color: ${({ theme }) => theme.colors.sidebarText};
  padding: 12px 5px;
  background-color: ${({ theme }) => theme.colors.sidebarBackground};
  border-radius: 16px;
  margin-right: 10px;
  transition: width 0.3s ease, background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: ${({ theme }) => (theme.mode === 'light' ? '0 8px 24px rgba(15, 23, 42, 0.05)' : '0 8px 24px rgba(0, 0, 0, 0.3)')};
`;

const NavItem = styled.div<{ $active?: boolean; $isCollapsed: boolean }>`
  display: flex;
  padding: ${(props) => (props.$isCollapsed ? "12px 0" : "12px")};
  margin: 8px 0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  gap: 12px;
  background-color: ${(props) =>
    props.$active
      ? props.theme.colors.sidebarActive
      : 'transparent'};
  color: ${(props) =>
    props.$active
      ? props.theme.colors.sidebarActiveText
      : props.theme.colors.sidebarText};
  justify-content: ${(props) => (props.$isCollapsed ? "center" : "flex-start")};
  align-items: center;
  width: 100%;

  &:hover {
    background-color: ${({ theme }) => theme.colors.sidebarHover};
    color: ${({ theme }) => theme.colors.sidebarActiveText};
  }

  &:focus-visible {
    outline: none;
    box-shadow: ${({ theme }) => theme.shadows.focus};
  }
`;

const ImageWrapper = styled.div<{ $isCollapsed: boolean }>`
  min-width: 24px;
  width: ${(props) => (props.$isCollapsed ? "100%" : "24px")};
  display: flex;
  justify-content: center;
  align-items: center;

  img {
    width: 20px;
    height: 20px;
    object-fit: cover;
  }
`;

const NavLink = styled(Link)<{ $active?: boolean; $isCollapsed: boolean }>`
  text-decoration: none;
  color: ${(props) =>
    props.$active
      ? props.theme.colors.sidebarActiveText
      : props.theme.colors.sidebarText};
  font-size: 16px;
  display: ${(props) => (props.$isCollapsed ? "none" : "block")};
  white-space: nowrap;
`;

const HamburgerButton = styled.div<{ $isCollapsed: boolean }>`
  cursor: pointer;
  display: flex;
  justify-content: ${(props) => (props.$isCollapsed ? "center" : "flex-start")};
  align-items: center;
  padding: 8px;
  margin-bottom: 15px;
  transition: all 0.2s ease;
  width: 100%;
  color: ${({ theme }) => theme.colors.sidebarText};

  &:hover {
    background-color: ${({ theme }) => theme.colors.sidebarHover};
    border-radius: 8px;
  }

  svg {
    min-width: 24px;
  }
`;

const NavItemsContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  align-items: center;
`;

const ProfileSection = styled.div<{ $isCollapsed: boolean }>`
  margin-top: auto;
  padding: ${(props) => (props.$isCollapsed ? "12px 0" : "12px")};
  display: flex;
  align-items: center;
  justify-content: ${(props) => (props.$isCollapsed ? "center" : "flex-start")};
  gap: 10px;
  width: 100%;
  border-top: 1px solid ${({ theme }) => theme.colors.subtleBorder};
`;

const CompanyLogo = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  text-transform: uppercase;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.sidebarActiveText};
  background-color: ${({ theme }) => theme.colors.primaryMuted};
  border: 1px solid ${({ theme }) => theme.colors.subtleBorder};
`;

const CompanyName = styled.div<{ $isCollapsed: boolean }>`
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.sidebarText};
  display: ${(props) => (props.$isCollapsed ? "none" : "block")};
`;

const ExternalLinkIcon = styled.div<{ $isCollapsed: boolean }>`
  margin-left: ${(props) => (props.$isCollapsed ? "0" : "auto")};
  display: ${(props) => (props.$isCollapsed ? "none" : "block")};
  cursor: pointer;
  color: ${({ theme }) => theme.colors.sidebarText};

  &:hover {
    opacity: 0.85;
  }
`;

const Sidebar = () => {
  const router = useRouter();
  const currentPath = router.pathname;
  const [isCollapsed, setIsCollapsed] = useState(false);
  const isAlphaGeneratorRoute = currentPath.startsWith("/alpha-generator");

  // State for user information
  const [userInitial, setUserInitial] = useState<string>("");
  const [userName, setUserName] = useState<string>("");

  // Get wallet connection
  const { address, isConnected } = useAccount();
  
  // Extract user information from wallet
  useEffect(() => {
    if (isConnected && address) {
      // Use first characters of the wallet address for name
      const shortAddress = address.substring(2, 6);
      setUserName(shortAddress);
      
      // Set initial based on route type
      setUserInitial(isAlphaGeneratorRoute ? "AG" : "AC");
    } else {
      // No wallet connected, use default initials
      setUserInitial(isAlphaGeneratorRoute ? "AG" : "AC");
      setUserName("");
    }
  }, [isConnected, address, isAlphaGeneratorRoute]);

  // Define navigation items based on whether it's alpha generator or consumer
  const navItems = useMemo(() => {
    if (isAlphaGeneratorRoute) {
      return [
        {
          label: "Dashboard",
          path: "/alpha-generator/dashboard",
          asset: "/asset/Sidebar/dashboard.svg",
        },
        {
          label: "My Strategies",
          path: "/alpha-generator/strategies",
          asset: "/asset/Sidebar/projects.svg",
        },
        {
          label: "Performance",
          path: "/alpha-generator/performance",
          asset: "/asset/Sidebar/submissions.svg",
        },
        {
          label: "Subscribers",
          path: "/alpha-generator/subscribers",
          asset: "/asset/Sidebar/user.svg",
        },
      ];
    } else {
      return [
        {
          label: "Dashboard",
          path: "/alpha-consumer/dashboard",
          asset: "/asset/Sidebar/dashboard.svg",
        },
        {
          label: "Browse Strategies",
          path: "/alpha-consumer/strategies",
          asset: "/asset/Sidebar/projects.svg",
        },
        {
          label: "My Subscriptions",
          path: "/alpha-consumer/subscriptions",
          asset: "/asset/Sidebar/submissions.svg",
        },
        {
          label: "Trade Confirmations",
          path: "/alpha-consumer/confirmations",
          asset: "/asset/Sidebar/user.svg",
        },
      ];
    }
  }, [isAlphaGeneratorRoute]);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  const handleLogout = useCallback(() => {
    // Navigate to login page for logout
    router.push('/login');
  }, [router]);

  return (
    <SidebarContainer $isCollapsed={isCollapsed}>
      <HamburgerButton onClick={toggleSidebar} $isCollapsed={isCollapsed}>
        <HamburgerIcon />
      </HamburgerButton>
      <NavItemsContainer>
        {navItems.map((item) => (
          <NavItem
            key={item.path}
            $active={currentPath.includes(item.path)}
            $isCollapsed={isCollapsed}
            onClick={() => handleNavigation(item.path)}>
            <ImageWrapper $isCollapsed={isCollapsed}>
              <Image src={item.asset} alt={item.label} width={20} height={20} />
            </ImageWrapper>
            <NavLink
              $active={currentPath.includes(item.path)}
              href={item.path}
              $isCollapsed={isCollapsed}>
              {item.label}
            </NavLink>
          </NavItem>
        ))}
      </NavItemsContainer>

      <ProfileSection $isCollapsed={isCollapsed}>
        <CompanyLogo>{userInitial}</CompanyLogo>
        <CompanyName $isCollapsed={isCollapsed}>
          {userName || (isAlphaGeneratorRoute ? "Alpha Generator" : "Alpha Consumer")}
        </CompanyName>
        <ExternalLinkIcon $isCollapsed={isCollapsed} onClick={handleLogout}>
          <LogoutIcon />
        </ExternalLinkIcon>
      </ProfileSection>
    </SidebarContainer>
  );
};

export default Sidebar;
