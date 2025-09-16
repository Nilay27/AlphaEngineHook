import React, { useState } from 'react';
import styled from 'styled-components';
import { useAccount } from 'wagmi';

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

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
`;

const MetricCard = styled.div`
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-shadow: ${({ theme }) =>
    theme.mode === 'light'
      ? '0 12px 28px rgba(15, 23, 42, 0.08)'
      : '0 18px 40px rgba(0, 0, 0, 0.55)'};
  transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;

  &:hover {
    border-color: var(--color-primary);
    box-shadow: ${({ theme }) =>
      theme.mode === 'light'
        ? '0 16px 40px rgba(37, 70, 240, 0.18)'
        : '0 22px 46px rgba(92, 124, 255, 0.35)'};
    transform: translateY(-2px);
  }
`;

const MetricLabel = styled.div`
  font-size: 12px;
  font-weight: 500;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
`;

const MetricValue = styled.div`
  font-size: 32px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 4px;
`;

const MetricChange = styled.div<{ positive?: boolean }>`
  font-size: 14px;
  color: ${props => props.positive ? 'var(--color-success)' : 'var(--color-danger)'};
  display: flex;
  align-items: center;
  gap: 4px;
`;

const ChartSection = styled.div`
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: ${({ theme }) =>
    theme.mode === 'light'
      ? '0 10px 24px rgba(15, 23, 42, 0.06)'
      : '0 16px 36px rgba(0, 0, 0, 0.5)'};
`;

const ChartTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text);
  margin: 0 0 16px 0;
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

const TableSection = styled.div`
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 24px;
  box-shadow: ${({ theme }) =>
    theme.mode === 'light'
      ? '0 10px 24px rgba(15, 23, 42, 0.06)'
      : '0 16px 36px rgba(0, 0, 0, 0.5)'};
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHeader = styled.thead`
  border-bottom: 2px solid var(--color-border);
`;

const TableRow = styled.tr`
  border-bottom: 1px solid var(--color-surface-alt);

  &:last-child {
    border-bottom: none;
  }
`;

const TableHead = styled.th`
  text-align: left;
  padding: 12px;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const TableCell = styled.td`
  padding: 12px;
  font-size: 14px;
  color: var(--color-text);
`;

const PerformanceBadge = styled.span<{ performance: 'positive' | 'negative' | 'neutral' }>`
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;

  ${props => {
    switch (props.performance) {
      case 'positive':
        return `
          background: var(--color-success-surface);
          color: var(--color-success);
        `;
      case 'negative':
        return `
          background: var(--color-danger-surface);
          color: var(--color-danger);
        `;
      default:
        return `
          background: var(--color-surface-alt);
          color: var(--color-text-muted);
        `;
    }
  }}
`;

const AlphaGeneratorPerformancePage: React.FC = () => {
  const { address: _address } = useAccount();
  const [metrics, _setMetrics] = useState({
    totalRevenue: 12.5,
    totalSubscribers: 23,
    avgPerformance: 18.5,
    winRate: 67,
    revenueChange: 15,
    subscriberChange: 8,
    performanceChange: -2.5,
    winRateChange: 3
  });

  const [strategyPerformance] = useState([
    {
      name: 'ETH-USDC Momentum',
      subscribers: 15,
      revenue: '8.5 ETH',
      performance: '+22.5%',
      winRate: '72%',
      status: 'positive' as const
    },
    {
      name: 'DeFi Yield Optimizer',
      subscribers: 8,
      revenue: '4.0 ETH',
      performance: '+14.5%',
      winRate: '62%',
      status: 'positive' as const
    }
  ]);

  return (
    <PageContainer>
      <PageHeader>
        <PageTitle>Performance Dashboard</PageTitle>
        <PageDescription>
          Track your strategies' performance and earnings
        </PageDescription>
      </PageHeader>

      <MetricsGrid>
        <MetricCard>
          <MetricLabel>Total Revenue</MetricLabel>
          <MetricValue>{metrics.totalRevenue} ETH</MetricValue>
          <MetricChange positive={metrics.revenueChange > 0}>
            {metrics.revenueChange > 0 ? '↑' : '↓'} {Math.abs(metrics.revenueChange)}% this month
          </MetricChange>
        </MetricCard>

        <MetricCard>
          <MetricLabel>Total Subscribers</MetricLabel>
          <MetricValue>{metrics.totalSubscribers}</MetricValue>
          <MetricChange positive={metrics.subscriberChange > 0}>
            {metrics.subscriberChange > 0 ? '↑' : '↓'} {Math.abs(metrics.subscriberChange)}% this month
          </MetricChange>
        </MetricCard>

        <MetricCard>
          <MetricLabel>Avg Performance</MetricLabel>
          <MetricValue>{metrics.avgPerformance}%</MetricValue>
          <MetricChange positive={metrics.performanceChange > 0}>
            {metrics.performanceChange > 0 ? '↑' : '↓'} {Math.abs(metrics.performanceChange)}% this month
          </MetricChange>
        </MetricCard>

        <MetricCard>
          <MetricLabel>Win Rate</MetricLabel>
          <MetricValue>{metrics.winRate}%</MetricValue>
          <MetricChange positive={metrics.winRateChange > 0}>
            {metrics.winRateChange > 0 ? '↑' : '↓'} {Math.abs(metrics.winRateChange)}% this month
          </MetricChange>
        </MetricCard>
      </MetricsGrid>

      <ChartSection>
        <ChartTitle>Revenue Over Time</ChartTitle>
        <ChartPlaceholder>
          Revenue chart visualization will be displayed here
        </ChartPlaceholder>
      </ChartSection>

      <ChartSection>
        <ChartTitle>Strategy Performance</ChartTitle>
        <ChartPlaceholder>
          Performance chart visualization will be displayed here
        </ChartPlaceholder>
      </ChartSection>

      <TableSection>
        <ChartTitle>Strategy Breakdown</ChartTitle>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Strategy Name</TableHead>
              <TableHead>Subscribers</TableHead>
              <TableHead>Revenue</TableHead>
              <TableHead>Performance</TableHead>
              <TableHead>Win Rate</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <tbody>
            {strategyPerformance.map((strategy, index) => (
              <TableRow key={index}>
                <TableCell>{strategy.name}</TableCell>
                <TableCell>{strategy.subscribers}</TableCell>
                <TableCell>{strategy.revenue}</TableCell>
                <TableCell>{strategy.performance}</TableCell>
                <TableCell>{strategy.winRate}</TableCell>
                <TableCell>
                  <PerformanceBadge performance={strategy.status}>
                    {strategy.status === 'positive' ? 'Profitable' : 'Needs Review'}
                  </PerformanceBadge>
                </TableCell>
              </TableRow>
            ))}
          </tbody>
        </Table>
      </TableSection>
    </PageContainer>
  );
};

export default AlphaGeneratorPerformancePage;
