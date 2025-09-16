import styled from "styled-components";
import { useRouter } from "next/router";
import { useState } from "react";
import { useAccount } from "wagmi";

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4rem 2rem;
  justify-content: center;
  width: 100%;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  color: var(--color-text);
  margin-bottom: 4rem;
  text-align: center;
  transition: color 0.2s ease;
`;

const OptionsContainer = styled.div`
  display: flex;
  gap: 40px;
  justify-content: center;
  flex-wrap: wrap;
  max-width: 1200px;
  width: 100%;
  padding: 0 20px;
`;

const Option = styled.div<{ $isSelected?: boolean }>`
  padding: 2rem;
  border-radius: 16px;
  cursor: pointer;
  text-align: center;
  transition: all 0.3s ease;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const IconContainer = styled.div<{ $isSelected?: boolean }>`
  width: 180px;
  height: 180px;
  margin: 0 auto 1.5rem;
  background: var(--color-surface-elevated);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: ${(props) =>
    props.$isSelected ? "4px solid var(--color-primary)" : "4px solid var(--color-border)"};
  box-shadow: ${(props) =>
    props.$isSelected
      ? "0 0 0 8px var(--color-primary-muted), 0px 12px 30px rgba(15, 23, 42, 0.12)"
      : "0 12px 30px rgba(15, 23, 42, 0.08)"};
  transition: all 0.3s ease;
`;

const OptionTitle = styled.h3<{ $isSelected?: boolean }>`
  font-size: 24px;
  font-weight: 600;
  color: ${(props) => (props.$isSelected ? 'var(--color-primary)' : 'var(--color-text)')};
  margin-bottom: 8px;
  transition: color 0.3s ease;
`;

const OptionDescription = styled.p<{ $isSelected?: boolean }>`
  color: ${(props) => (props.$isSelected ? 'var(--color-primary)' : 'var(--color-text-muted)')};
  font-size: 16px;
  font-weight: 400;
  transition: color 0.3s ease;
`;

const CheckIcon = styled.div<{ $isVisible: boolean }>`
  position: absolute;
  top: 48px;
  right: 45px;
  width: 24px;
  height: 24px;
  background: var(--color-primary);
  border-radius: 50%;
  display: ${(props) => (props.$isVisible ? "flex" : "none")};
  align-items: center;
  justify-content: center;
  color: var(--color-nav-text);
  font-size: 14px;
`;

const ContinueButton = styled.button`
  background-color: var(--color-primary);
  color: var(--color-nav-text);
  padding: 10px 30px;
  border-radius: 4px;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 3rem;
  transition: background-color 0.2s;

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

const _StatusMessage = styled.div`
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  text-align: center;
  background-color: var(--color-info-surface);
  color: var(--color-info);
`;


export default function SelectUserType() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<
    "alpha-generator" | "alpha-consumer" | null
  >(null);
  const [isLoading, _setIsLoading] = useState(false);

  // Get wallet address from wagmi
  const { address: walletAddress } = useAccount();


  const handleContinue = async () => {
    if (!selectedType || !walletAddress) return;

    // Map user types to AlphaEngine paths
    const userTypeMapping: { [key: string]: string } = {
      'alpha-generator': 'alpha-generator',
      'alpha-consumer': 'alpha-consumer'
    };

    const alphaPath = userTypeMapping[selectedType];

    // Skip profile check for now since backend needs DATABASE_URL
    // Direct redirect to AlphaEngine dashboards
    if (alphaPath === 'alpha-generator') {
      router.push('/alpha-generator/dashboard');
    } else {
      router.push('/alpha-consumer/dashboard');
    }
  };

  return (
    <Container>
      <Title>Choose Your Role</Title>
      <OptionsContainer>
        <Option
          $isSelected={selectedType === "alpha-generator"}
          onClick={() => setSelectedType("alpha-generator")}>
          <IconContainer $isSelected={selectedType === "alpha-generator"}>
            <div style={{
              fontSize: '60px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '90px',
              height: '90px'
            }}>
              📊
            </div>
          </IconContainer>
          <OptionTitle $isSelected={selectedType === "alpha-generator"}>
            Create Strategies
          </OptionTitle>
          <OptionDescription $isSelected={selectedType === "alpha-generator"}>
            Share your winning trades
          </OptionDescription>
          <CheckIcon $isVisible={selectedType === "alpha-generator"}>✓</CheckIcon>
        </Option>

        <Option
          $isSelected={selectedType === "alpha-consumer"}
          onClick={() => setSelectedType("alpha-consumer")}>
          <IconContainer $isSelected={selectedType === "alpha-consumer"}>
            <div style={{
              fontSize: '60px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '90px',
              height: '90px'
            }}>
              📋
            </div>
          </IconContainer>
          <OptionTitle $isSelected={selectedType === "alpha-consumer"}>
            Copy Strategies
          </OptionTitle>
          <OptionDescription $isSelected={selectedType === "alpha-consumer"}>
            Follow proven traders
          </OptionDescription>
          <CheckIcon $isVisible={selectedType === "alpha-consumer"}>✓</CheckIcon>
        </Option>
      </OptionsContainer>


      <ContinueButton
        onClick={handleContinue}
        disabled={!selectedType || isLoading || !walletAddress}>
        {isLoading ? "Checking..." : "Continue"}
        {!isLoading && <span>→</span>}
      </ContinueButton>
    </Container>
  );
}
