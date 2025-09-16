import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/router';
import { useAccount } from 'wagmi';
import { Strategy, Subscription } from '@/types/alphaengine';

const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
`;

const PageHeader = styled.div`
  margin-bottom: 32px;
`;

const PageTitle = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 8px 0;
  transition: color 0.2s ease;
`;

const PageDescription = styled.p`
  font-size: 16px;
  color: ${({ theme }) => theme.colors.textMuted};
  margin: 0;
  transition: color 0.2s ease;
`;

const StatsContainer = styled.div`
  display: flex;
  gap: 24px;
  margin-bottom: 32px;
`;

const StatCard = styled.div`
  background: ${({ theme }) => theme.colors.surfaceElevated};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  padding: 16px;
  flex: 1;
  transition: background 0.2s ease, border-color 0.2s ease;
`;

const StatLabel = styled.div`
  font-size: 12px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
  transition: color 0.2s ease;
`;

const StatValue = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  transition: color 0.2s ease;
`;

const SubscriptionCard = styled.div`
  background: ${({ theme }) => theme.colors.surfaceElevated};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: background 0.2s ease, border-color 0.2s ease;
`;

const SubscriptionInfo = styled.div`
  flex: 1;
`;

const StrategyName = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 4px 0;
  transition: color 0.2s ease;
`;

const StrategyDescription = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textMuted};
  margin: 0 0 12px 0;
  transition: color 0.2s ease;
`;

const SubscriptionMeta = styled.div`
  display: flex;
  gap: 24px;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textMuted};
  transition: color 0.2s ease;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const StatusBadge = styled.span<{ status: 'active' | 'paused' | 'expired' }>`
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 600;
  text-transform: capitalize;
  transition: background-color 0.2s ease, color 0.2s ease;

  ${({ theme, status }) => {
    switch (status) {
      case 'active':
        return `
          background: ${theme.colors.successSurface};
          color: ${theme.colors.success};
        `;
      case 'paused':
        return `
          background: ${theme.colors.warningSurface};
          color: ${theme.colors.warning};
        `;
      case 'expired':
      default:
        return `
          background: ${theme.colors.dangerSurface};
          color: ${theme.colors.danger};
        `;
    }
  }}
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' | 'danger' }>`
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;

  ${({ theme, variant }) => {
    switch (variant) {
      case 'danger':
        return `
          background: ${theme.colors.danger};
          color: ${theme.colors.navText};

          &:hover {
            background: ${theme.colors.dangerSurface};
            color: ${theme.colors.danger};
          }
        `;
      case 'secondary':
        return `
          background: ${theme.colors.surface};
          color: ${theme.colors.textMuted};
          border: 1px solid ${theme.colors.border};

          &:hover {
            background: ${theme.colors.surfaceAlt};
          }
        `;
      case 'primary':
      default:
        return `
          background: ${theme.colors.primary};
          color: ${theme.colors.navText};

          &:hover {
            background: ${theme.colors.primaryHover};
          }
        `;
    }
  }}

  &:focus-visible {
    outline: none;
    box-shadow: ${({ theme }) => theme.shadows.focus};
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 12px;
  border: 2px dashed ${({ theme }) => theme.colors.subtleBorder};
  transition: background 0.2s ease, border-color 0.2s ease;
`;

const EmptyIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
`;

const EmptyTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 8px 0;
  transition: color 0.2s ease;
`;

const EmptyDescription = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textMuted};
  margin: 0 0 24px 0;
  transition: color 0.2s ease;
`;

interface SubscriptionWithStrategy extends Subscription {
  strategy?: Strategy;
}

const AlphaConsumerSubscriptionsPage: React.FC = () => {
  const router = useRouter();
  const { address } = useAccount();
  const [subscriptions, setSubscriptions] = useState<SubscriptionWithStrategy[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSubscriptions = useCallback(async () => {
    try {
      setLoading(true);

      // Mock data for subscriptions
      const mockSubscriptions: SubscriptionWithStrategy[] = [
        {
          subscriptionId: 'sub1',
          strategyId: '1',
          alphaConsumerAddress: address || '0x0000000000000000000000000000000000000000',
          subscriptionTxHash: '0x123456789abcdef',
          subscribedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          isActive: true,
          strategy: {
            strategyId: '1',
            strategyName: 'ETH-USDC Momentum Strategy',
            strategyDescription: 'Automated momentum trading strategy',
            subscriptionFee: '1000000000000000000',
            supportedProtocols: ['Uniswap', 'Aave'],
            subscriberCount: 15,
            alphaGeneratorAddress: '0x1234567890123456789012345678901234567890',
            isActive: true,
            totalVolume: '0',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        }
      ];

      setSubscriptions(mockSubscriptions);
    } catch (err) {
      console.error('Error fetching subscriptions:', err);
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  const handleViewStrategy = (strategyId: string) => {
    router.push(`/alpha-consumer/strategies/${strategyId}`);
  };

  const handlePauseSubscription = (subscriptionId: string) => {
    console.log('Pause subscription:', subscriptionId);
  };

  const handleCancelSubscription = (subscriptionId: string) => {
    console.log('Cancel subscription:', subscriptionId);
  };

  const browseStrategies = () => {
    router.push('/alpha-consumer/strategies');
  };

  const activeSubscriptions = subscriptions.filter(s => s.isActive).length;
  const totalFeesPaid = subscriptions.reduce((sum, s) => {
    // Use strategy subscription fee as fee paid estimate
    return sum + parseFloat(s.strategy?.subscriptionFee || '0') / 1e18;
  }, 0);

  if (loading) {
    return (
      <PageContainer>
        <PageHeader>
          <PageTitle>My Subscriptions</PageTitle>
        </PageHeader>
        <div>Loading subscriptions...</div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader>
        <PageTitle>My Subscriptions</PageTitle>
        <PageDescription>
          Manage your active strategy subscriptions
        </PageDescription>
      </PageHeader>

      <StatsContainer>
        <StatCard>
          <StatLabel>Active Subscriptions</StatLabel>
          <StatValue>{activeSubscriptions}</StatValue>
        </StatCard>
        <StatCard>
          <StatLabel>Total Fees Paid</StatLabel>
          <StatValue>{totalFeesPaid.toFixed(4)} ETH</StatValue>
        </StatCard>
        <StatCard>
          <StatLabel>Total Strategies</StatLabel>
          <StatValue>{subscriptions.length}</StatValue>
        </StatCard>
      </StatsContainer>

      {subscriptions.length > 0 ? (
        subscriptions.map((subscription) => (
          <SubscriptionCard key={subscription.subscriptionId}>
            <SubscriptionInfo>
              <StrategyName>{subscription.strategy?.strategyName}</StrategyName>
              <StrategyDescription>
                {subscription.strategy?.strategyDescription}
              </StrategyDescription>
              <SubscriptionMeta>
                <MetaItem>
                  Subscribed: {new Date(subscription.subscribedAt).toLocaleDateString()}
                </MetaItem>
                <MetaItem>
                  Status: {subscription.isActive ? 'Active' : 'Inactive'}
                </MetaItem>
                <MetaItem>
                  Fee: {parseFloat(subscription.strategy?.subscriptionFee || '0') / 1e18} ETH
                </MetaItem>
              </SubscriptionMeta>
            </SubscriptionInfo>
            <StatusBadge status={subscription.isActive ? 'active' : 'expired'}>
              {subscription.isActive ? 'Active' : 'Expired'}
            </StatusBadge>
            <ActionButtons>
              <Button
                variant="secondary"
                onClick={() => handleViewStrategy(subscription.strategyId)}
              >
                View Strategy
              </Button>
              {subscription.isActive && (
                <>
                  <Button
                    variant="secondary"
                    onClick={() => handlePauseSubscription(subscription.subscriptionId)}
                  >
                    Pause
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => handleCancelSubscription(subscription.subscriptionId)}
                  >
                    Cancel
                  </Button>
                </>
              )}
            </ActionButtons>
          </SubscriptionCard>
        ))
      ) : (
        <EmptyState>
          <EmptyIcon>📋</EmptyIcon>
          <EmptyTitle>No active subscriptions</EmptyTitle>
          <EmptyDescription>
            You haven't subscribed to any trading strategies yet
          </EmptyDescription>
          <Button variant="primary" onClick={browseStrategies}>
            Browse Strategies
          </Button>
        </EmptyState>
      )}
    </PageContainer>
  );
};

export default AlphaConsumerSubscriptionsPage;
