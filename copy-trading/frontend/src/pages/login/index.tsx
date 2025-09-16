import styled from "styled-components";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { useConnect, useAccount, useDisconnect } from "wagmi";

const Container = styled.div`
  display: flex;
  min-height: 100vh;
  width: 100%;
`;

const LeftSection = styled.div`
  flex: 1;
  background: linear-gradient(135deg, var(--color-primary) 0%, color-mix(in srgb, var(--color-primary) 65%, transparent) 100%);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  position: relative;
`;

const LogoPattern = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-repeat: repeat;
  opacity: 0.1;
`;

const Logo = styled.div`
  position: relative;
  z-index: 1;
  text-align: center;
  color: var(--color-nav-text);
  display: flex;
  flex-direction: column;
  align-items: center;

  h1 {
    font-size: 2.5rem;
    font-weight: bold;
    margin-top: 1rem;
  }
`;

const RightSection = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 2rem;
`;

const Title = styled.h2`
  font-size: 2rem;
  color: var(--color-text);
  margin-bottom: 2rem;
  transition: color 0.2s ease;
`;

const ConnectButton = styled.button`
  background-color: var(--color-primary);
  color: var(--color-nav-text);
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  min-width: 200px;
  justify-content: center;

  &:hover {
    background-color: var(--color-primary-hover);
  }

  &:disabled {
    background-color: var(--color-neutral-surface);
    color: var(--color-text-muted);
    cursor: not-allowed;
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px var(--color-primary-muted);
  }
`;

const StatusMessage = styled.p`
  margin-top: 1rem;
  color: ${(props) => props.color || 'var(--color-text)'};
  font-size: 0.9rem;
`;

const ErrorMessage = styled.div`
  color: var(--color-danger);
  margin-top: 1rem;
  font-size: 0.9rem;
  max-width: 320px;
  text-align: center;
`;

function Login() {
  const router = useRouter();
  const [connectStatus, setConnectStatus] = useState("");
  const [statusColor, setStatusColor] = useState('var(--color-text)');
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Wagmi hooks
  const { connect, connectors, error, isPending } = useConnect();
  const { isConnected, address } = useAccount();
  const { disconnect } = useDisconnect();

  // Watch for wallet connection
  useEffect(() => {
    if (isConnected && address && !isRedirecting) {
      setConnectStatus(
        `Connected: ${address.substring(0, 6)}...${address.substring(
          address.length - 4
        )}`
      );
      setStatusColor('var(--color-success)');
      
      // Redirect to select user type
      setIsRedirecting(true);
      setTimeout(() => {
        router.push("/login/selectUserType");
      }, 1500);
    }
  }, [isConnected, address, router, isRedirecting]);

  const handleConnect = async () => {
    try {
      // Find MetaMask connector
      const metamaskConnector = connectors.find(
        (connector) => connector.id === 'injected' || connector.name === 'MetaMask'
      );
      
      if (metamaskConnector) {
        await connect({ connector: metamaskConnector });
      } else {
        setConnectStatus("MetaMask not found. Please install MetaMask extension.");
        setStatusColor('var(--color-danger)');
      }
    } catch (error) {
      console.error("Connection error:", error);
      setConnectStatus("Failed to connect wallet");
      setStatusColor('var(--color-danger)');
    }
  };

  const handleDisconnect = () => {
    disconnect();
    setConnectStatus("");
    setIsRedirecting(false);
  };

  return (
    <Container>
      <LeftSection>
        <LogoPattern />
        <Logo>
          <div style={{
            width: '120px',
            height: '120px',
            backgroundColor: 'var(--color-primary)',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '48px',
            color: 'white',
            fontWeight: 'bold'
          }}>
            AE
          </div>
          <h1>AlphaEngine</h1>
        </Logo>
      </LeftSection>

      <RightSection>
        <Title>Connect Your Wallet</Title>

        {!isConnected ? (
          <ConnectButton 
            onClick={handleConnect}
            disabled={isPending}
          >
            {isPending
              ? "Connecting..."
              : "Connect MetaMask"}
          </ConnectButton>
        ) : (
          <ConnectButton onClick={handleDisconnect}>
            Disconnect Wallet
          </ConnectButton>
        )}
        
        {connectStatus && (
          <StatusMessage color={statusColor}>{connectStatus}</StatusMessage>
        )}
        
        {isRedirecting && (
          <StatusMessage color='var(--color-success)'>
            Redirecting to select user type...
          </StatusMessage>
        )}
        
        {error && (
          <ErrorMessage>Error: {error.message}</ErrorMessage>
        )}
      </RightSection>
    </Container>
  );
}

export default Login;
