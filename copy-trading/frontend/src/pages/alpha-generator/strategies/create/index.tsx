import React, { useState } from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/router';
import { useAccount } from 'wagmi';
import axios from 'axios';
import { CreateStrategyInput } from '@/types/alphaengine';

const PageContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 24px;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  color: var(--color-text-muted);
  font-size: 14px;
  cursor: pointer;
  padding: 0;
  margin-bottom: 24px;
  transition: color 0.2s;
  
  &:hover {
    color: var(--color-primary);
  }
`;

const PageHeader = styled.div`
  margin-bottom: 32px;
`;

const PageTitle = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: var(--color-text);
  margin: 0 0 8px 0;
`;

const PageDescription = styled.p`
  font-size: 16px;
  color: var(--color-text-muted);
  margin: 0;
`;

const FormCard = styled.div`
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 32px;
`;

const FormSection = styled.div`
  margin-bottom: 24px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text);
  margin: 0 0 16px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--color-border);
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const Label = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text);
  margin-bottom: 6px;
`;

const RequiredIndicator = styled.span`
  color: var(--color-danger);
  margin-left: 4px;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  font-size: 14px;
  background: var(--color-background);
  color: var(--color-text);
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px var(--color-primary-muted);
  }

  &::placeholder {
    color: var(--color-text-subtle);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  background: var(--color-background);
  color: var(--color-text);
  resize: vertical;
  min-height: 100px;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px var(--color-primary-muted);
  }

  &::placeholder {
    color: var(--color-text-subtle);
  }
`;

const CodeTextArea = styled(TextArea)`
  font-family: 'Monaco', 'Consolas', monospace;
  font-size: 13px;
  min-height: 200px;
  background: var(--color-surface);
`;

const HelpText = styled.p`
  font-size: 12px;
  color: var(--color-text-muted);
  margin-top: 6px;
  margin-bottom: 0;
`;

const ProtocolsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
`;

const ProtocolCheckbox = styled.label`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    border-color: var(--color-primary);
    background: var(--color-primary-muted);
  }
  
  input:checked + span {
    color: var(--color-primary);
    font-weight: 500;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid var(--color-border);
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  flex: 1;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  ${props => props.variant === 'secondary' ? `
    background: var(--color-surface);
    color: var(--color-text-muted);
    border: 1px solid var(--color-border);

    &:hover {
      background: var(--color-background);
      border-color: var(--color-text-subtle);
    }
  ` : `
    background: var(--color-primary);
    color: var(--color-nav-text);
    border: none;
    
    &:hover {
      background: var(--color-primary-hover);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px color-mix(in srgb, var(--color-primary) 25%, transparent);
    }
    
    &:active {
      transform: translateY(0);
    }
    
    &:disabled {
      background: var(--color-neutral-surface);
      color: var(--color-text-muted);
      cursor: not-allowed;
      transform: none;
    }
  `}
`;

const ErrorMessage = styled.div`
  background: var(--color-danger-surface);
  border: 1px solid var(--color-danger-surface);
  border-radius: 6px;
  padding: 12px;
  color: var(--color-danger);
  font-size: 14px;
  margin-bottom: 20px;
`;

const SuccessMessage = styled.div`
  background: var(--color-success-surface);
  border: 1px solid var(--color-success-surface);
  border-radius: 6px;
  padding: 12px;
  color: var(--color-success);
  font-size: 14px;
  margin-bottom: 20px;
`;

const availableProtocols = [
  'Uniswap',
  'Aave',
  'Compound',
  'SushiSwap',
  'Curve',
  'Balancer',
  'MakerDAO',
  'Yearn',
  '1inch',
  'GMX'
];

const CreateStrategyPage: React.FC = () => {
  const router = useRouter();
  const { address } = useAccount();
  
  const [formData, setFormData] = useState({
    strategyName: '',
    strategyDescription: '',
    subscriptionFee: '0',
    supportedProtocols: [] as string[],
    strategyJSON: `{
  "version": "1.0",
  "steps": [],
  "conditions": {},
  "parameters": {}
}`
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [jsonError, setJsonError] = useState<string | null>(null);

  const handleInputChange = (field: keyof typeof formData, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (field === 'strategyJSON' && typeof value === 'string') {
      validateJSON(value);
    }
  };

  const validateJSON = (jsonString: string) => {
    try {
      if (jsonString.trim()) {
        JSON.parse(jsonString);
        setJsonError(null);
      }
    } catch {
      setJsonError('Invalid JSON format');
    }
  };

  const handleProtocolToggle = (protocol: string) => {
    setFormData(prev => ({
      ...prev,
      supportedProtocols: prev.supportedProtocols.includes(protocol)
        ? prev.supportedProtocols.filter(p => p !== protocol)
        : [...prev.supportedProtocols, protocol]
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.strategyName.trim()) {
      setError('Strategy name is required');
      return false;
    }
    
    if (!formData.subscriptionFee || isNaN(Number(formData.subscriptionFee))) {
      setError('Valid subscription fee is required');
      return false;
    }
    
    if (formData.supportedProtocols.length === 0) {
      setError('At least one protocol must be selected');
      return false;
    }
    
    if (jsonError) {
      setError('Please fix JSON errors before submitting');
      return false;
    }
    
    if (!address) {
      setError('Please connect your wallet');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      const API_URL = process.env.NEXT_PUBLIC_ALPHAENGINE_API_URL || '';
      
      const payload: CreateStrategyInput = {
        strategyName: formData.strategyName.trim(),
        strategyDescription: formData.strategyDescription.trim() || undefined,
        subscriptionFee: formData.subscriptionFee,
        supportedProtocols: formData.supportedProtocols,
        strategyJSON: JSON.parse(formData.strategyJSON),
        alphaGeneratorAddress: address!
      };
      
      const response = await axios.post(`${API_URL}/api/v1/strategies`, payload);
      
      if (response.data?.isSuccess) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/alpha-generator/strategies');
        }, 1500);
      } else {
        throw new Error(response.data?.message || 'Failed to create strategy');
      }
    } catch (err: unknown) {
      console.error('Error creating strategy:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create strategy';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/alpha-generator/strategies');
  };

  const formatFeeInEth = (weiString: string): string => {
    try {
      const wei = BigInt(weiString || '0');
      const eth = Number(wei) / 1e18;
      return eth.toFixed(6);
    } catch {
      return '0';
    }
  };

  return (
    <PageContainer>
      <BackButton onClick={handleCancel}>
        ← Back to Strategies
      </BackButton>

      <PageHeader>
        <PageTitle>Import Strategy</PageTitle>
        <PageDescription>
          Import your strategy configuration from the external builder
        </PageDescription>
      </PageHeader>

      <FormCard>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        {success && <SuccessMessage>Strategy created successfully! Redirecting...</SuccessMessage>}

        <FormSection>
          <SectionTitle>Basic Information</SectionTitle>
          
          <FormGroup>
            <Label>
              Strategy Name
              <RequiredIndicator>*</RequiredIndicator>
            </Label>
            <Input
              type="text"
              placeholder="e.g., ETH-USDC Momentum Strategy"
              value={formData.strategyName}
              onChange={(e) => handleInputChange('strategyName', e.target.value)}
              disabled={loading}
            />
            <HelpText>Choose a descriptive name for your strategy</HelpText>
          </FormGroup>

          <FormGroup>
            <Label>Description</Label>
            <TextArea
              placeholder="Describe your strategy's approach, goals, and risk profile..."
              value={formData.strategyDescription}
              onChange={(e) => handleInputChange('strategyDescription', e.target.value)}
              disabled={loading}
            />
            <HelpText>Optional: Help consumers understand your strategy</HelpText>
          </FormGroup>
        </FormSection>

        <FormSection>
          <SectionTitle>Configuration</SectionTitle>
          
          <FormGroup>
            <Label>
              Subscription Fee (Wei)
              <RequiredIndicator>*</RequiredIndicator>
            </Label>
            <Input
              type="text"
              placeholder="1000000000000000000"
              value={formData.subscriptionFee}
              onChange={(e) => handleInputChange('subscriptionFee', e.target.value)}
              disabled={loading}
            />
            <HelpText>
              Fee in Wei (≈ {formatFeeInEth(formData.subscriptionFee)} ETH) that consumers pay to subscribe
            </HelpText>
          </FormGroup>

          <FormGroup>
            <Label>
              Supported Protocols
              <RequiredIndicator>*</RequiredIndicator>
            </Label>
            <ProtocolsContainer>
              {availableProtocols.map(protocol => (
                <ProtocolCheckbox key={protocol}>
                  <input
                    type="checkbox"
                    checked={formData.supportedProtocols.includes(protocol)}
                    onChange={() => handleProtocolToggle(protocol)}
                    disabled={loading}
                  />
                  <span>{protocol}</span>
                </ProtocolCheckbox>
              ))}
            </ProtocolsContainer>
            <HelpText>Select all protocols your strategy will interact with</HelpText>
          </FormGroup>
        </FormSection>

        <FormSection>
          <SectionTitle>Strategy Configuration</SectionTitle>
          
          <FormGroup>
            <Label>
              Strategy JSON
              <RequiredIndicator>*</RequiredIndicator>
            </Label>
            <CodeTextArea
              placeholder="Paste your strategy JSON from the builder..."
              value={formData.strategyJSON}
              onChange={(e) => handleInputChange('strategyJSON', e.target.value)}
              disabled={loading}
            />
            {jsonError && (
              <HelpText style={{ color: 'var(--color-danger)' }}>{jsonError}</HelpText>
            )}
            {!jsonError && (
              <HelpText>Paste the JSON configuration exported from your strategy builder</HelpText>
            )}
          </FormGroup>
        </FormSection>

        <ButtonGroup>
          <Button 
            variant="secondary" 
            onClick={handleCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSubmit}
            disabled={loading || !address}
          >
            {loading ? 'Creating...' : 'Create Strategy'}
          </Button>
        </ButtonGroup>
      </FormCard>
    </PageContainer>
  );
};

export default CreateStrategyPage;
