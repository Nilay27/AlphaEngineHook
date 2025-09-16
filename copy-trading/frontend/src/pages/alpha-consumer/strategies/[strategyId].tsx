import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import { useAccount } from 'wagmi';
import { apiClient } from '@/utils/api-client';
import { subscriptionService } from '@/services/subscription.service';

const Container = styled.div`
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
  flex-wrap: wrap;
  gap: 20px;
`;

const TitleSection = styled.div``;

const Title = styled.h1`
  font-size: 32px;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: 8px;
`;

const Subtitle = styled.p`
  font-size: 16px;
  color: var(--color-text-muted);
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' | 'success' }>`
  padding: 10px 20px;
  background: ${props => {
    switch(props.$variant) {
      case 'secondary': return 'transparent';
      case 'success': return 'var(--color-success)';
      default: return 'var(--color-primary)';
    }
  }};
  color: ${props => props.$variant === 'secondary'
    ? 'var(--color-text)'
    : 'var(--color-nav-text)'};
  border: ${props => props.$variant === 'secondary'
    ? '1px solid var(--color-border)'
    : 'none'};
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => {
      switch(props.$variant) {
        case 'secondary': return 'var(--color-surface-elevated)';
        case 'success': return 'var(--color-success-hover)';
        default: return 'var(--color-primary-hover)';
      }
    }};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
`;

const StatCard = styled.div`
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 20px;
`;

const StatLabel = styled.p`
  font-size: 12px;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
`;

const StatValue = styled.h3`
  font-size: 24px;
  font-weight: 600;
  color: var(--color-text);
`;

const DetailsSection = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
  margin-bottom: 32px;

  @media (max-width: 968px) {
    grid-template-columns: 1fr;
  }
`;

const DescriptionCard = styled.div`
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 24px;
`;

const SectionTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 16px;
`;

const Description = styled.p`
  font-size: 14px;
  line-height: 1.6;
  color: var(--color-text-muted);
`;

const InfoCard = styled.div`
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 24px;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid var(--color-border);

  &:last-child {
    border-bottom: none;
  }
`;

const InfoLabel = styled.span`
  font-size: 14px;
  color: var(--color-text-muted);
`;

const InfoValue = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text);
`;

const PerformanceSection = styled.div`
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 32px;
`;

const ChartPlaceholder = styled.div`
  height: 300px;
  background: var(--color-surface);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
  font-size: 14px;
`;

const RecentTradesSection = styled.div`
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 24px;
`;

const TradeItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: var(--color-surface);
  border-radius: 6px;
  margin-bottom: 8px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const TradeInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const TradeAction = styled.span`
  font-size: 14px;
  color: var(--color-text);
`;

const TradeTime = styled.span`
  font-size: 12px;
  color: var(--color-text-muted);
`;

const TradeProfit = styled.span<{ $positive?: boolean }>`
  font-size: 14px;
  font-weight: 500;
  color: ${props => props.$positive ? 'var(--color-success)' : 'var(--color-error)'};
`;

const LoadingState = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  color: var(--color-text-muted);
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px;
  color: var(--color-text-muted);
`;

const SubscriptionBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  background: var(--color-success-muted);
  color: var(--color-success);
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
`;

interface Strategy {
  strategyId: string;
  name: string;
  description: string;
  alphaGeneratorAddress: string;
  performanceFee: number;
  subscriptionFee: string;
  subscriberCount: number;
  totalTrades: number;
  successRate: number;
  status: string;
  createdAt: string;
}

export default function ConsumerStrategyDetailPage() {
  const router = useRouter();
  const { strategyId } = router.query;
  const { address } = useAccount();
  const [strategy, setStrategy] = useState<Strategy | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const [recentTrades, setRecentTrades] = useState<any[]>([]);

  useEffect(() => {
    if (strategyId && typeof strategyId === 'string' && address) {
      fetchStrategyDetails();
    }
  }, [strategyId, address]);

  const fetchStrategyDetails = async () => {
    try {
      setLoading(true);
      
      // Fetch strategy details
      const response = await apiClient.get(`/api/strategies/${strategyId}`);
      const strategyData = response.data;
      
      setStrategy(strategyData);
      
      // Check subscription status
      if (address) {
        try {
          const subscriptionRes = await apiClient.get('/api/consumer/subscriptions', {
            params: { alphaConsumerAddress: address }
          });
          const subscriptions = subscriptionRes.data || [];
          setIsSubscribed(subscriptions.some((sub: any) => sub.strategyId === strategyId));
        } catch (error) {
          console.error('Failed to check subscription status:', error);
        }
      }
      
      // TODO: Fetch recent trades from backend
      setRecentTrades([]);
    } catch (error) {
      console.error('Failed to fetch strategy details:', error);
      // Strategy not found - will show empty state
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async () => {
    if (!address || !strategy) return;
    
    setSubscribing(true);
    try {
      // For now, use a temporary tx hash as we're stubbing the smart contract
      const tempTxHash = `pending-tx-${Date.now()}`;
      
      // Call backend to register subscription
      await subscriptionService.registerSubscription(
        strategy.strategyId,
        address,
        tempTxHash
      );
      
      setIsSubscribed(true);
      
      // Update local subscriber count
      setStrategy(prev => prev ? {
        ...prev,
        subscriberCount: prev.subscriberCount + 1
      } : null);
      
      // Show success message (you might want to add a toast notification here)
      alert('Successfully subscribed to strategy!');
    } catch (error) {
      console.error('Failed to subscribe:', error);
      alert('Failed to subscribe. Please try again.');
    } finally {
      setSubscribing(false);
    }
  };

  const handleUnsubscribe = async () => {
    // For now, just show a message
    alert('Unsubscribe functionality will be implemented with smart contract integration');
  };

  const handleViewPerformance = () => {
    router.push(`/alpha-consumer/performance?strategyId=${strategyId}`);
  };

  if (loading) {
    return (
      <Container>
        <LoadingState>Loading strategy details...</LoadingState>
      </Container>
    );
  }

  if (!strategy) {
    return (
      <Container>
        <EmptyState>Strategy not found</EmptyState>
      </Container>
    );
  }

  return (
      <Container>
        <Header>
          <TitleSection>
            <Title>
              {strategy.name}
              {isSubscribed && (
                <SubscriptionBadge style={{ marginLeft: '12px' }}>
                  ✓ Subscribed
                </SubscriptionBadge>
              )}
            </Title>
            <Subtitle>Strategy ID: {strategy.strategyId}</Subtitle>
          </TitleSection>
          <ActionButtons>
            {!isSubscribed ? (
              <Button 
                onClick={handleSubscribe}
                disabled={subscribing || !address}
              >
                {subscribing ? 'Subscribing...' : '🔔 Subscribe'}
              </Button>
            ) : (
              <Button
                $variant="secondary"
                onClick={handleUnsubscribe}
              >
                🔕 Unsubscribe
              </Button>
            )}
            <Button $variant="secondary" onClick={handleViewPerformance}>
              📊 View Performance
            </Button>
          </ActionButtons>
        </Header>

        <StatsGrid>
          <StatCard>
            <StatLabel>Subscribers</StatLabel>
            <StatValue>{strategy.subscriberCount}</StatValue>
          </StatCard>
          <StatCard>
            <StatLabel>Total Trades</StatLabel>
            <StatValue>{strategy.totalTrades}</StatValue>
          </StatCard>
          <StatCard>
            <StatLabel>Success Rate</StatLabel>
            <StatValue>{strategy.successRate}%</StatValue>
          </StatCard>
          <StatCard>
            <StatLabel>Performance Fee</StatLabel>
            <StatValue>{strategy.performanceFee}%</StatValue>
          </StatCard>
          <StatCard>
            <StatLabel>Subscription Fee</StatLabel>
            <StatValue>{strategy.subscriptionFee} ETH</StatValue>
          </StatCard>
          <StatCard>
            <StatLabel>Status</StatLabel>
            <StatValue style={{ textTransform: 'capitalize' }}>{strategy.status}</StatValue>
          </StatCard>
        </StatsGrid>

        <DetailsSection>
          <DescriptionCard>
            <SectionTitle>Description</SectionTitle>
            <Description>{strategy.description}</Description>
          </DescriptionCard>
          
          <InfoCard>
            <SectionTitle>Strategy Information</SectionTitle>
            <InfoRow>
              <InfoLabel>Generator</InfoLabel>
              <InfoValue>{strategy.alphaGeneratorAddress.substring(0, 8)}...</InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoLabel>Created</InfoLabel>
              <InfoValue>{new Date(strategy.createdAt).toLocaleDateString()}</InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoLabel>Last Trade</InfoLabel>
              <InfoValue>2 hours ago</InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoLabel>Avg. Trade Size</InfoLabel>
              <InfoValue>0.5 ETH</InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoLabel>Monthly ROI</InfoLabel>
              <InfoValue style={{ color: 'var(--color-success)' }}>+15.3%</InfoValue>
            </InfoRow>
          </InfoCard>
        </DetailsSection>

        <PerformanceSection>
          <SectionTitle>Performance Chart</SectionTitle>
          <ChartPlaceholder>
            Performance chart will be displayed here
          </ChartPlaceholder>
        </PerformanceSection>

        <RecentTradesSection>
          <SectionTitle>Recent Trades</SectionTitle>
          {recentTrades.length === 0 ? (
            <EmptyState>No recent trades</EmptyState>
          ) : (
            recentTrades.map(trade => (
              <TradeItem key={trade.id}>
                <TradeInfo>
                  <TradeAction>{trade.action}</TradeAction>
                  <TradeTime>{trade.time}</TradeTime>
                </TradeInfo>
                <TradeProfit $positive={trade.positive}>
                  {trade.positive ? '+' : ''}{trade.profit}%
                </TradeProfit>
              </TradeItem>
            ))
          )}
        </RecentTradesSection>
      </Container>
  );
}