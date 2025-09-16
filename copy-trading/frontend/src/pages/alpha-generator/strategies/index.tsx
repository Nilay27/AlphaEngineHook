import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/router';
import { useAccount } from 'wagmi';
import StrategyCard from '@/Components/AlphaEngine/StrategyCard';
import { Strategy } from '@/types/alphaengine';
import { listStrategies } from '@/services/strategy-performance.service';

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
  color: var(--color-text);
  margin: 0 0 8px 0;
`;

const PageDescription = styled.p`
  font-size: 16px;
  color: var(--color-text-muted);
  margin: 0;
`;

const HeaderActions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const StatsContainer = styled.div`
  display: flex;
  gap: 24px;
  margin-bottom: 32px;
`;

const StatCard = styled.div`
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  box-shadow: ${({ theme }) =>
    theme.mode === 'light'
      ? '0 12px 28px rgba(15, 23, 42, 0.08)'
      : '0 16px 36px rgba(0, 0, 0, 0.55)'};
  transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;

  &:hover {
    border-color: var(--color-primary);
    box-shadow: ${({ theme }) =>
      theme.mode === 'light'
        ? '0 16px 40px rgba(37, 70, 240, 0.16)'
        : '0 20px 44px rgba(92, 124, 255, 0.35)'};
    transform: translateY(-2px);
  }
`;

const StatLabel = styled.div`
  font-size: 12px;
  font-weight: 500;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
  opacity: 0.85;
`;

const StatValue = styled.div`
  font-size: 28px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primary};
`;

const CreateButton = styled.button`
  background-color: var(--color-primary);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    background-color: var(--color-primary-hover);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(37, 70, 240, 0.2);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const FilterBar = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const FilterButton = styled.button<{ $active?: boolean }>`
  background-color: ${props => props.$active ? 'var(--color-primary)' : 'transparent'};
  color: ${props => props.$active ? 'white' : 'var(--color-text-muted)'};
  border: 1px solid ${props => props.$active ? 'var(--color-primary)' : 'var(--color-border)'};
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    border-color: var(--color-primary);
    color: ${props => props.active ? 'white' : 'var(--color-primary)'};
  }
`;

const StrategiesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 24px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  background: var(--color-surface);
  border-radius: 12px;
  border: 2px dashed var(--color-border);
`;

const EmptyIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
`;

const EmptyTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  color: var(--color-text);
  margin: 0 0 8px 0;
`;

const EmptyDescription = styled.p`
  font-size: 14px;
  color: var(--color-text-muted);
  margin: 0 0 24px 0;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 60px;
  font-size: 16px;
  color: var(--color-text-muted);
`;

const ErrorContainer = styled.div`
  background: var(--color-danger-surface);
  border: 1px solid var(--color-danger-surface);
  border-radius: 8px;
  padding: 16px;
  color: var(--color-danger);
  margin-bottom: 24px;
`;

type FilterType = 'all' | 'active' | 'inactive' | 'my-strategies';

const AlphaGeneratorStrategiesPage: React.FC = () => {
  const router = useRouter();
  const { address } = useAccount();
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [filteredStrategies, setFilteredStrategies] = useState<Strategy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');

  useEffect(() => {
    fetchStrategies();
  }, []);

  const fetchStrategies = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await listStrategies();
      setStrategies(data || []);
    } catch (err: unknown) {
      console.error('Error fetching strategies:', err);
      setError(err instanceof Error ? err.message : 'Failed to load strategies');
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = useCallback(() => {
    let filtered = [...strategies];

    switch (filter) {
      case 'active':
        filtered = filtered.filter(s => s.isActive);
        break;
      case 'inactive':
        filtered = filtered.filter(s => !s.isActive);
        break;
      case 'my-strategies':
        if (address) {
          const normalizedAddress = address.toLowerCase();
          filtered = filtered.filter(s =>
            (s.alphaGeneratorAddress ?? '').toLowerCase() === normalizedAddress
          );
        }
        break;
      case 'all':
      default:
        break;
    }

    setFilteredStrategies(filtered);
  }, [strategies, filter, address]);

  useEffect(() => {
    applyFilter();
  }, [applyFilter]);

  const handleCreateStrategy = () => {
    router.push('/alpha-generator/strategies/create');
  };

  const handleViewDetails = (strategyId: string) => {
    router.push(`/alpha-generator/strategies/${strategyId}`);
  };

  const calculateStats = () => {
    if (!address) {
      return {
        totalStrategies: 0,
        totalSubscribers: 0,
        activeStrategies: 0,
      };
    }

    const normalizedAddress = address.toLowerCase();
    const myStrategies = strategies.filter(s =>
      (s.alphaGeneratorAddress ?? '').toLowerCase() === normalizedAddress
    );
    
    const totalSubscribers = myStrategies.reduce((sum, s) => sum + s.subscriberCount, 0);
    const activeStrategies = myStrategies.filter(s => s.isActive).length;
    
    return {
      totalStrategies: myStrategies.length,
      totalSubscribers,
      activeStrategies
    };
  };

  const stats = calculateStats();

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
        <PageTitle>Alpha Generator Dashboard</PageTitle>
        <PageDescription>
          Manage your trading strategies and monitor performance
        </PageDescription>
      </PageHeader>

      {error && (
        <ErrorContainer>
          Error: {error}
        </ErrorContainer>
      )}

      {address && (
        <StatsContainer>
          <StatCard>
            <StatLabel>Your Strategies</StatLabel>
            <StatValue>{stats.totalStrategies}</StatValue>
          </StatCard>
          <StatCard>
            <StatLabel>Total Subscribers</StatLabel>
            <StatValue>{stats.totalSubscribers}</StatValue>
          </StatCard>
          <StatCard>
            <StatLabel>Active Strategies</StatLabel>
            <StatValue>{stats.activeStrategies}</StatValue>
          </StatCard>
        </StatsContainer>
      )}

      <HeaderActions>
        <FilterBar>
          <FilterButton 
            $active={filter === 'all'} 
            onClick={() => setFilter('all')}
          >
            All Strategies
          </FilterButton>
          <FilterButton 
            active={filter === 'active'} 
            onClick={() => setFilter('active')}
          >
            Active
          </FilterButton>
          <FilterButton 
            active={filter === 'inactive'} 
            onClick={() => setFilter('inactive')}
          >
            Inactive
          </FilterButton>
          {address && (
            <FilterButton 
              active={filter === 'my-strategies'} 
              onClick={() => setFilter('my-strategies')}
            >
              My Strategies
            </FilterButton>
          )}
        </FilterBar>
        <CreateButton onClick={handleCreateStrategy}>
          <span>+</span> Import Strategy
        </CreateButton>
      </HeaderActions>

      {filteredStrategies.length > 0 ? (
        <StrategiesGrid>
          {filteredStrategies.map((strategy) => (
            <StrategyCard
              key={strategy.strategyId}
              strategy={strategy}
              onViewDetails={() => handleViewDetails(strategy.strategyId)}
            />
          ))}
        </StrategiesGrid>
      ) : (
        <EmptyState>
          <EmptyIcon>📊</EmptyIcon>
          <EmptyTitle>No strategies found</EmptyTitle>
          <EmptyDescription>
            {filter === 'my-strategies' 
              ? "You haven't created any strategies yet. Import your first strategy from the builder."
              : "No strategies match your current filter."}
          </EmptyDescription>
          {filter === 'my-strategies' && (
            <CreateButton onClick={handleCreateStrategy}>
              Import Your First Strategy
            </CreateButton>
          )}
        </EmptyState>
      )}
    </PageContainer>
  );
};

export default AlphaGeneratorStrategiesPage;
