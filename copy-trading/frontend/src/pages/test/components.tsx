import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import { StrategyCard, TradeConfirmationList } from '@/Components/AlphaEngine';
import { BaseCard, ListContainer } from '@/Components/Containers';
import { StatusBadge, MetricRow, EmptyState } from '@/Components/Common';
import { useConfirmationsSSE } from '@/hooks';
import { Strategy, TradeConfirmation } from '@/types/alphaengine';

const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
  background: #f5f5f5;
  min-height: 100vh;
`;

const Section = styled.section`
  margin-bottom: 48px;
`;

const SectionTitle = styled.h2`
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 24px;
  padding-bottom: 12px;
  border-bottom: 2px solid #e5e7eb;
`;

const SubSection = styled.div`
  margin-bottom: 32px;
`;

const SubTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 16px;
`;

const Grid = styled.div<{ columns?: number }>`
  display: grid;
  grid-template-columns: repeat(${props => props.columns || 2}, 1fr);
  gap: 24px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const SSEStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  margin-bottom: 16px;
`;

const SSEStatusIndicator = styled.div<{ connected: boolean }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${props => props.connected ? '#10b981' : '#ef4444'};
  animation: ${props => props.connected ? 'pulse 2s infinite' : 'none'};
  
  @keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.5; }
    100% { opacity: 1; }
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 16px;
`;

const Button = styled.button`
  background: #2546f0;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #1e40af;
    transform: translateY(-1px);
  }
`;

// Mock data
const mockStrategies: Strategy[] = [
  {
    strategyId: 'strat-001',
    strategyName: 'ETH Momentum Strategy',
    strategyDescription: 'A momentum-based trading strategy focusing on ETH/USDT pairs with dynamic position sizing',
    subscriptionFee: '100000000000000000', // 0.1 ETH
    supportedProtocols: ['Uniswap V3', 'Aave', 'Compound'],
    strategyJSON: { version: '1.0', rules: [] },
    alphaGeneratorAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
    subscriberCount: 42,
    totalVolume: '5000000000000000000000', // 5000 ETH
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    strategyId: 'strat-002',
    strategyName: 'DeFi Yield Optimizer',
    strategyDescription: 'Automated yield farming across multiple DeFi protocols',
    subscriptionFee: '50000000000000000', // 0.05 ETH
    supportedProtocols: ['Yearn', 'Curve', 'Convex'],
    strategyJSON: { version: '1.0', rules: [] },
    alphaGeneratorAddress: '0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199',
    subscriberCount: 128,
    totalVolume: '10000000000000000000000', // 10000 ETH
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    strategyId: 'strat-003',
    strategyName: 'Arbitrage Bot Alpha',
    strategyDescription: 'Cross-DEX arbitrage opportunities',
    subscriptionFee: '200000000000000000', // 0.2 ETH
    supportedProtocols: ['SushiSwap', 'Balancer'],
    strategyJSON: { version: '1.0', rules: [] },
    alphaGeneratorAddress: '0xdD2FD4581271e230360230F9337D5c0430Bf44C0',
    subscriberCount: 7,
    totalVolume: '500000000000000000000', // 500 ETH
    isActive: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const mockConfirmations: TradeConfirmation[] = [
  {
    confirmationId: 'conf-001',
    strategyId: 'strat-001',
    alphaConsumerAddress: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    executionParams: {
      protocol: 'Uniswap V3',
      action: 'SWAP',
      tokenIn: 'ETH',
      tokenOut: 'USDT',
      amount: '1000000000000000000', // 1 ETH
      data: { slippage: 0.5, deadline: 1800 }
    },
    gasEstimate: '150000',
    isExecuted: false,
    executionTxHash: undefined,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString()
  },
  {
    confirmationId: 'conf-002',
    strategyId: 'strat-002',
    alphaConsumerAddress: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    executionParams: {
      protocol: 'Aave',
      action: 'DEPOSIT',
      tokenIn: 'USDC',
      amount: '10000000000', // 10000 USDC
      data: { apy: 5.2 }
    },
    gasEstimate: '200000',
    isExecuted: false,
    executionTxHash: undefined,
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    updatedAt: new Date(Date.now() - 7200000).toISOString()
  },
  {
    confirmationId: 'conf-003',
    strategyId: 'strat-001',
    alphaConsumerAddress: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    executionParams: {
      protocol: 'Compound',
      action: 'BORROW',
      tokenOut: 'DAI',
      amount: '5000000000000000000000', // 5000 DAI
      data: { collateralRatio: 150 }
    },
    gasEstimate: '180000',
    isExecuted: true,
    executionTxHash: '0x123abc456def789ghi012jkl345mno678pqr901stu234vwx567yz',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString()
  }
];

export default function ComponentsTestPage() {
  const [subscribedStrategies, setSubscribedStrategies] = useState<string[]>([]);
  const [processingConfirmations, setProcessingConfirmations] = useState<string[]>([]);
  const [sseMessages, setSseMessages] = useState<TradeConfirmation[]>([]);

  // SSE Hook usage
  const { status: sseStatus, isConnected, reconnect, disconnect } = useConfirmationsSSE({
    onMessage: (confirmation) => {
      console.log('SSE Message received:', confirmation);
      setSseMessages(prev => [confirmation, ...prev].slice(0, 5)); // Keep last 5
    },
    onError: (error) => {
      console.error('SSE Error:', error);
    },
    filterByAddress: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'
  });

  const handleSubscribe = useCallback((strategyId: string) => {
    console.log('Subscribe to strategy:', strategyId);
    setSubscribedStrategies(prev => [...prev, strategyId]);
  }, []);

  const handleApprove = useCallback((confirmationId: string) => {
    console.log('Approve confirmation:', confirmationId);
    setProcessingConfirmations(prev => [...prev, confirmationId]);
    
    // Simulate processing
    setTimeout(() => {
      setProcessingConfirmations(prev => prev.filter(id => id !== confirmationId));
    }, 2000);
  }, []);

  const handleReject = useCallback((confirmationId: string) => {
    console.log('Reject confirmation:', confirmationId);
  }, []);

  return (
    <PageContainer>
      <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '32px' }}>
        AlphaEngine Components Test Page
      </h1>

      {/* Base Components Section */}
      <Section>
        <SectionTitle>Base Components</SectionTitle>
        
        <SubSection>
          <SubTitle>Status Badges</SubTitle>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <StatusBadge status="active" />
            <StatusBadge status="inactive" />
            <StatusBadge status="pending" />
            <StatusBadge status="success" />
            <StatusBadge status="error" />
            <StatusBadge status="warning" />
            <StatusBadge status="active" size="small" />
            <StatusBadge status="pending" size="large" label="Processing" />
          </div>
        </SubSection>

        <SubSection>
          <SubTitle>Base Cards</SubTitle>
          <Grid>
            <BaseCard>
              <h4>Default Card</h4>
              <p>This is a basic card with default styling</p>
            </BaseCard>
            <BaseCard variant="elevated">
              <h4>Elevated Card</h4>
              <p>This card has a shadow for elevation</p>
            </BaseCard>
            <BaseCard variant="bordered">
              <h4>Bordered Card</h4>
              <p>This card has a colored border</p>
            </BaseCard>
            <BaseCard clickable onClick={() => alert('Card clicked!')}>
              <h4>Clickable Card</h4>
              <p>This card responds to clicks with hover effects</p>
            </BaseCard>
          </Grid>
        </SubSection>

        <SubSection>
          <SubTitle>Metric Rows</SubTitle>
          <BaseCard>
            <MetricRow
              columns={4}
              metrics={[
                { label: 'Total Value', value: '$125,432', color: '#2546f0' },
                { label: 'Active Users', value: '1,234', color: '#10b981' },
                { label: 'Success Rate', value: '94.5%', color: '#f59e0b' },
                { label: 'Avg Response', value: '1.2s', color: '#6b7280' }
              ]}
            />
          </BaseCard>
        </SubSection>

        <SubSection>
          <SubTitle>Empty States</SubTitle>
          <Grid>
            <EmptyState />
            <EmptyState
              title="No strategies found"
              description="Start by creating your first trading strategy to begin copy trading"
              action={{
                label: 'Create Strategy',
                onClick: () => console.log('Create strategy clicked')
              }}
            />
          </Grid>
        </SubSection>
      </Section>

      {/* Strategy Cards Section */}
      <Section>
        <SectionTitle>Strategy Cards</SectionTitle>
        <ListContainer columns={2} gap="large">
          {mockStrategies.map(strategy => (
            <StrategyCard
              key={strategy.strategyId}
              strategy={strategy}
              isSubscribed={subscribedStrategies.includes(strategy.strategyId)}
              onSubscribe={() => handleSubscribe(strategy.strategyId)}
              onViewDetails={() => console.log('View details:', strategy.strategyId)}
            />
          ))}
        </ListContainer>
      </Section>

      {/* Trade Confirmations Section */}
      <Section>
        <SectionTitle>Trade Confirmations</SectionTitle>
        <TradeConfirmationList
          confirmations={mockConfirmations}
          onApprove={handleApprove}
          onReject={handleReject}
          processingIds={processingConfirmations}
        />
      </Section>

      {/* SSE Hook Test Section */}
      <Section>
        <SectionTitle>SSE Connection Test</SectionTitle>
        
        <SSEStatus>
          <SSEStatusIndicator connected={isConnected} />
          <span>Status: <strong>{sseStatus}</strong></span>
          <span style={{ marginLeft: 'auto' }}>
            {isConnected ? 'Connected to SSE stream' : 'Disconnected from SSE stream'}
          </span>
        </SSEStatus>

        <ButtonGroup>
          <Button onClick={reconnect}>Reconnect</Button>
          <Button onClick={disconnect}>Disconnect</Button>
        </ButtonGroup>

        {sseMessages.length > 0 && (
          <SubSection style={{ marginTop: '24px' }}>
            <SubTitle>Recent SSE Messages</SubTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {sseMessages.map((msg, index) => (
                <BaseCard key={index}>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>
                    Confirmation ID: {msg.confirmationId}
                  </div>
                  <div style={{ fontSize: '12px', marginTop: '4px' }}>
                    Strategy: {msg.strategyId}
                  </div>
                </BaseCard>
              ))}
            </div>
          </SubSection>
        )}
      </Section>

      {/* List Container with Empty State */}
      <Section>
        <SectionTitle>List Container States</SectionTitle>
        
        <SubSection>
          <SubTitle>Loading State</SubTitle>
          <ListContainer loading={true} columns={1} />
        </SubSection>

        <SubSection>
          <SubTitle>Empty State</SubTitle>
          <ListContainer 
            empty={true}
            emptyMessage="No items found in this list"
            columns={1}
          />
        </SubSection>
      </Section>
    </PageContainer>
  );
}