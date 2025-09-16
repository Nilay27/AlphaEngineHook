import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/router';
import { useAccount } from 'wagmi';
import StrategyCard from '@/Components/AlphaEngine/StrategyCard';
import { Strategy } from '@/types/alphaengine';
import { subscriptionService } from '@/services/subscription.service';

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

const FilterBar = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 24px;
`;

const FilterButton = styled.button<{ $active?: boolean }>`
  background-color: ${({ theme, $active }) =>
    $active ? theme.colors.primary : 'transparent'};
  color: ${({ theme, $active }) =>
    $active ? theme.colors.navText : theme.colors.textMuted};
  border: 1px solid ${({ theme, $active }) =>
    $active ? theme.colors.primary : theme.colors.subtleBorder};
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme, active }) =>
      active ? theme.colors.navText : theme.colors.primary};
  }

  &:focus-visible {
    outline: none;
    box-shadow: ${({ theme }) => theme.shadows.focus};
  }
`;

const StrategiesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 24px;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 60px;
  font-size: 16px;
  color: ${({ theme }) => theme.colors.textMuted};
  transition: color 0.2s ease;
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
  margin: 0;
  transition: color 0.2s ease;
`;

type FilterType = 'all' | 'trending' | 'new' | 'best-performance';

const AlphaConsumerStrategiesPage: React.FC = () => {
  const router = useRouter();
  const { address } = useAccount();
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [subscribedStrategies, setSubscribedStrategies] = useState<Set<string>>(new Set());
  const [subscribing, setSubscribing] = useState<string | null>(null);

  const fetchStrategies = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch strategies from backend API
      const response = await fetch(`${process.env.NEXT_PUBLIC_ALPHAENGINE_API_URL || 'http://localhost:3001'}/api/strategies`);
      const result = await response.json();

      if (result.isSuccess) {
        setStrategies(result.data || []);
      } else {
        console.error('Failed to fetch strategies:', result.message);
        setStrategies([]);
      }
    } catch (err) {
      console.error('Error fetching strategies:', err);
      setStrategies([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSubscriptions = useCallback(async () => {
    if (!address) return;
    
    try {
      // Fetch user's subscriptions to mark them in the UI
      const response = await fetch(`${process.env.NEXT_PUBLIC_ALPHAENGINE_API_URL || 'http://localhost:3001'}/api/consumer/subscriptions?alphaConsumerAddress=${address}`);
      const result = await response.json();
      
      if (result.isSuccess && result.data) {
        const subscribed = new Set(result.data.map((sub: any) => sub.strategyId));
        setSubscribedStrategies(subscribed);
      }
    } catch (err) {
      console.error('Error fetching subscriptions:', err);
    }
  }, [address]);

  useEffect(() => {
    fetchStrategies();
  }, [fetchStrategies]);
  
  useEffect(() => {
    if (address) {
      fetchSubscriptions();
    }
  }, [address, fetchSubscriptions]);

  const handleViewDetails = (strategyId: string) => {
    router.push(`/alpha-consumer/strategies/${strategyId}`);
  };

  const handleSubscribe = async (strategyId: string) => {
    if (!address) {
      alert('Please connect your wallet to subscribe');
      return;
    }
    
    setSubscribing(strategyId);
    try {
      // For now, use a temporary tx hash as we're stubbing the smart contract
      const tempTxHash = `pending-tx-${Date.now()}`;
      
      // Call backend to register subscription
      await subscriptionService.registerSubscription(
        strategyId,
        address,
        tempTxHash
      );
      
      // Update local state
      setSubscribedStrategies(prev => new Set(prev).add(strategyId));
      
      // Update strategy subscriber count
      setStrategies(prev => prev.map(s => 
        s.strategyId === strategyId 
          ? { ...s, subscriberCount: s.subscriberCount + 1 }
          : s
      ));
      
      // Show success (you might want to add a toast notification here)
      alert('Successfully subscribed to strategy!');
    } catch (error) {
      console.error('Failed to subscribe:', error);
      alert('Failed to subscribe. Please try again.');
    } finally {
      setSubscribing(null);
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <LoadingContainer>Loading strategies...</LoadingContainer>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader>
        <PageTitle>Browse Trading Strategies</PageTitle>
        <PageDescription>
          Discover and subscribe to profitable trading strategies from top alpha generators
        </PageDescription>
      </PageHeader>

      <FilterBar>
        <FilterButton
          $active={filter === 'all'}
          onClick={() => setFilter('all')}
        >
          All Strategies
        </FilterButton>
        <FilterButton
          active={filter === 'trending'}
          onClick={() => setFilter('trending')}
        >
          Trending
        </FilterButton>
        <FilterButton
          active={filter === 'new'}
          onClick={() => setFilter('new')}
        >
          New
        </FilterButton>
        <FilterButton
          active={filter === 'best-performance'}
          onClick={() => setFilter('best-performance')}
        >
          Best Performance
        </FilterButton>
      </FilterBar>

      {strategies.length > 0 ? (
        <StrategiesGrid>
          {strategies.map((strategy) => (
            <StrategyCard
              key={strategy.strategyId}
              strategy={strategy}
              onViewDetails={() => handleViewDetails(strategy.strategyId)}
              onSubscribe={() => handleSubscribe(strategy.strategyId)}
              isSubscribed={subscribedStrategies.has(strategy.strategyId) || subscribing === strategy.strategyId}
              isConsumerView={true}
            />
          ))}
        </StrategiesGrid>
      ) : (
        <EmptyState>
          <EmptyIcon>🔍</EmptyIcon>
          <EmptyTitle>No strategies available</EmptyTitle>
          <EmptyDescription>
            Check back later for new trading strategies to subscribe to
          </EmptyDescription>
        </EmptyState>
      )}
    </PageContainer>
  );
};

export default AlphaConsumerStrategiesPage;
