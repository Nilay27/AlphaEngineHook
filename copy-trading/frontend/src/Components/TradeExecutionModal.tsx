import React, { useState } from 'react';
import styled from 'styled-components';
import { confirmationsService } from '@/services/confirmations.service';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: var(--color-surface-elevated);
  border-radius: 12px;
  padding: 32px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
`;

const ModalHeader = styled.div`
  margin-bottom: 24px;
`;

const ModalTitle = styled.h2`
  font-size: 24px;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 8px;
`;

const ModalSubtitle = styled.p`
  font-size: 14px;
  color: var(--color-text-muted);
`;

const FormSection = styled.div`
  margin-bottom: 24px;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text);
  margin-bottom: 8px;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  font-size: 14px;
  color: var(--color-text);
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: var(--color-primary);
  }

  &::placeholder {
    color: var(--color-text-muted);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 10px 12px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  font-size: 14px;
  color: var(--color-text);
  transition: border-color 0.2s ease;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: var(--color-primary);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 10px 12px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  font-size: 14px;
  color: var(--color-text);
  transition: border-color 0.2s ease;
  min-height: 80px;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: var(--color-primary);
  }

  &::placeholder {
    color: var(--color-text-muted);
  }
`;

const HelpText = styled.p`
  font-size: 12px;
  color: var(--color-text-muted);
  margin-top: 4px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: 10px 20px;
  background: ${props => props.variant === 'secondary' 
    ? 'transparent' 
    : 'var(--color-primary)'};
  color: ${props => props.variant === 'secondary' 
    ? 'var(--color-text)' 
    : 'var(--color-nav-text)'};
  border: ${props => props.variant === 'secondary' 
    ? '1px solid var(--color-border)' 
    : 'none'};
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.variant === 'secondary'
      ? 'var(--color-surface)'
      : 'var(--color-primary-hover)'};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const SuccessMessage = styled.div`
  padding: 12px 16px;
  background: var(--color-success-muted);
  color: var(--color-success);
  border-radius: 6px;
  margin-bottom: 20px;
  font-size: 14px;
`;

const ErrorMessage = styled.div`
  padding: 12px 16px;
  background: var(--color-error-muted);
  color: var(--color-error);
  border-radius: 6px;
  margin-bottom: 20px;
  font-size: 14px;
`;

const PreviewSection = styled.div`
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  padding: 16px;
  margin-bottom: 20px;
`;

const PreviewTitle = styled.h4`
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  color: var(--color-text-muted);
  margin-bottom: 12px;
`;

const PreviewContent = styled.pre`
  font-family: monospace;
  font-size: 12px;
  color: var(--color-text);
  white-space: pre-wrap;
  word-wrap: break-word;
`;

interface TradeExecutionModalProps {
  strategyId: string;
  strategyName: string;
  onClose: () => void;
  onSubmit: () => void;
}

export default function TradeExecutionModal({
  strategyId,
  strategyName,
  onClose,
  onSubmit
}: TradeExecutionModalProps) {
  const [protocol, setProtocol] = useState('Uniswap V3');
  const [action, setAction] = useState('Swap');
  const [tokenIn, setTokenIn] = useState('');
  const [tokenOut, setTokenOut] = useState('');
  const [amount, setAmount] = useState('');
  const [additionalParams, setAdditionalParams] = useState('');
  const [gasEstimate, setGasEstimate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      // Parse additional parameters if provided
      let extraParams = {};
      if (additionalParams.trim()) {
        try {
          extraParams = JSON.parse(additionalParams);
        } catch {
          setError('Additional parameters must be valid JSON');
          setSubmitting(false);
          return;
        }
      }

      const executionParams = {
        protocol,
        action,
        tokenIn,
        tokenOut,
        amount,
        ...extraParams
      };

      const response = await confirmationsService.broadcastTrade({
        strategyId,
        executionParams,
        gasEstimate: gasEstimate || undefined
      });

      setSuccess(true);
      
      // Show success message
      setTimeout(() => {
        onSubmit();
      }, 2000);

    } catch (err: any) {
      setError(err.message || 'Failed to broadcast trade');
    } finally {
      setSubmitting(false);
    }
  };

  const getExecutionParamsPreview = () => {
    let extraParams = {};
    if (additionalParams.trim()) {
      try {
        extraParams = JSON.parse(additionalParams);
      } catch {
        return 'Invalid JSON';
      }
    }

    return JSON.stringify({
      protocol,
      action,
      tokenIn,
      tokenOut,
      amount,
      ...extraParams
    }, null, 2);
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>Execute Trade</ModalTitle>
          <ModalSubtitle>
            Broadcast trade signal to all subscribers of {strategyName}
          </ModalSubtitle>
        </ModalHeader>

        {success && (
          <SuccessMessage>
            ✅ Trade successfully broadcasted to all subscribers!
          </SuccessMessage>
        )}

        {error && (
          <ErrorMessage>
            ❌ {error}
          </ErrorMessage>
        )}

        <form onSubmit={handleSubmit}>
          <FormSection>
            <FormGroup>
              <Label>Protocol</Label>
              <Select 
                value={protocol} 
                onChange={(e) => setProtocol(e.target.value)}
                disabled={submitting}
              >
                <option value="Uniswap V3">Uniswap V3</option>
                <option value="Uniswap V2">Uniswap V2</option>
                <option value="SushiSwap">SushiSwap</option>
                <option value="1inch">1inch</option>
                <option value="Curve">Curve</option>
                <option value="Balancer">Balancer</option>
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>Action</Label>
              <Select 
                value={action} 
                onChange={(e) => setAction(e.target.value)}
                disabled={submitting}
              >
                <option value="Swap">Swap</option>
                <option value="Add Liquidity">Add Liquidity</option>
                <option value="Remove Liquidity">Remove Liquidity</option>
                <option value="Stake">Stake</option>
                <option value="Unstake">Unstake</option>
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>Token In</Label>
              <Input
                type="text"
                value={tokenIn}
                onChange={(e) => setTokenIn(e.target.value)}
                placeholder="e.g., ETH, USDC, WBTC"
                required
                disabled={submitting}
              />
            </FormGroup>

            <FormGroup>
              <Label>Token Out</Label>
              <Input
                type="text"
                value={tokenOut}
                onChange={(e) => setTokenOut(e.target.value)}
                placeholder="e.g., USDC, DAI, USDT"
                required
                disabled={submitting}
              />
            </FormGroup>

            <FormGroup>
              <Label>Amount</Label>
              <Input
                type="text"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g., 1.5"
                required
                disabled={submitting}
              />
              <HelpText>Amount of Token In to trade</HelpText>
            </FormGroup>

            <FormGroup>
              <Label>Gas Estimate (Optional)</Label>
              <Input
                type="text"
                value={gasEstimate}
                onChange={(e) => setGasEstimate(e.target.value)}
                placeholder="e.g., 150000"
                disabled={submitting}
              />
              <HelpText>Estimated gas units for this transaction</HelpText>
            </FormGroup>

            <FormGroup>
              <Label>Additional Parameters (Optional)</Label>
              <TextArea
                value={additionalParams}
                onChange={(e) => setAdditionalParams(e.target.value)}
                placeholder='{"slippage": "0.5", "deadline": "1800"}'
                disabled={submitting}
              />
              <HelpText>JSON object with additional parameters</HelpText>
            </FormGroup>
          </FormSection>

          {tokenIn && tokenOut && amount && (
            <PreviewSection>
              <PreviewTitle>Execution Parameters Preview</PreviewTitle>
              <PreviewContent>{getExecutionParamsPreview()}</PreviewContent>
            </PreviewSection>
          )}

          <ButtonGroup>
            <Button 
              type="button" 
              variant="secondary" 
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={submitting || !tokenIn || !tokenOut || !amount}
            >
              {submitting ? 'Broadcasting...' : '🚀 Broadcast Trade'}
            </Button>
          </ButtonGroup>
        </form>
      </ModalContent>
    </ModalOverlay>
  );
}