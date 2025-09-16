import React from 'react';
import styled from 'styled-components';

interface MetricItemProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  color?: string;
}

interface MetricRowProps {
  metrics: MetricItemProps[];
  columns?: 2 | 3 | 4;
  className?: string;
}

const Row = styled.div<{ columns: number }>`
  display: grid;
  grid-template-columns: repeat(${props => props.columns}, 1fr);
  gap: 16px;
  margin: 16px 0;
  
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const MetricItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const MetricLabel = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.025em;
  font-weight: 500;
  transition: color 0.2s ease;
`;

const MetricValue = styled.span<{ color?: string }>`
  font-size: 18px;
  font-weight: 600;
  color: ${({ theme, color }) => color || theme.colors.text};
  display: flex;
  align-items: center;
  gap: 6px;
  transition: color 0.2s ease;
`;

const IconWrapper = styled.span`
  display: inline-flex;
  align-items: center;
  font-size: 16px;
`;

const MetricRow: React.FC<MetricRowProps> = ({
  metrics,
  columns = 2,
  className
}) => {
  return (
    <Row columns={columns} className={className}>
      {metrics.map((metric, index) => (
        <MetricItem key={index}>
          <MetricLabel>{metric.label}</MetricLabel>
          <MetricValue color={metric.color}>
            {metric.icon && <IconWrapper>{metric.icon}</IconWrapper>}
            {metric.value}
          </MetricValue>
        </MetricItem>
      ))}
    </Row>
  );
};

export default MetricRow;
