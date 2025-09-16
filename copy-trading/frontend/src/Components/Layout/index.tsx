import styled from "styled-components";
import { useRouter } from "next/router";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
  justify-content: flex-start;
  align-items: center;
  width: 100%;
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  transition: background 0.2s ease, color 0.2s ease;
`;

const MainContent = styled.div`
  min-height: 94vh;
  display: flex;
  width: 100%;
  flex: 1;
  padding: 10px;
  transition: margin-left 0.3s ease, background-color 0.2s ease;
  background-color: ${({ theme }) => theme.colors.surface};
`;

const ContentWrapper = styled.div`
  flex: 1;
  margin-left: 10px;
  background: transparent;
  color: inherit;
  transition: color 0.2s ease;
`;

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const router = useRouter();
  const pathname = router.asPath;

  // Show navbar but no sidebar for any profile pages
  if (pathname.startsWith("/profile") || pathname.includes("/profile") || pathname.endsWith("/profile")) {
    return (
      <Container>
        <Navbar />
        <MainContent>
          <ContentWrapper>{children}</ContentWrapper>
        </MainContent>
      </Container>
    );
  }

  // Show sidebar and navbar for AlphaEngine routes
  const isDashboardRoute =
    pathname.startsWith("/alpha-generator/") ||
    pathname.startsWith("/alpha-consumer/");

  if (!isDashboardRoute) {
    return <>{children}</>;
  }

  return (
    <Container>
      <Navbar />
      <MainContent>
        <Sidebar />
        <ContentWrapper>{children}</ContentWrapper>
      </MainContent>
    </Container>
  );
};

export default Layout;
