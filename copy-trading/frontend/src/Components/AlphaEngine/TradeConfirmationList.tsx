import React from 'react';
import styled from 'styled-components';
import { ListContainer } from '../Containers';
import { EmptyState } from '../Common';
import TradeConfirmationItem from './TradeConfirmationItem';
import { TradeConfirmation } from '@/types/alphaengine';

interface TradeConfirmationListProps {
  confirmations: TradeConfirmation[];
  onApprove?: (confirmationId: string) => void;
  onReject?: (confirmationId: string) => void;
  loading?: boolean;
  processingIds?: string[];
  emptyStateTitle?: string;
  emptyStateDescription?: string;
  onEmptyAction?: () => void;
  emptyActionLabel?: string;
}

const Container = styled.div`
  width: 100%;
`;

const ListHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const Title = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: var(--color-text);
  margin: 0;
`;

const CountBadge = styled.span`
  background: var(--color-primary-muted);
  color: var(--color-primary);
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
`;

const FilterSection = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
`;

const FilterButton = styled.button<{ active?: boolean }>`
  background: ${props => props.active ? 'var(--color-primary)' : 'transparent'};
  color: ${props => props.active ? 'var(--color-nav-text)' : 'var(--color-text-muted)'};
  border: 1px solid ${props => props.active ? 'var(--color-primary)' : 'var(--color-border)'};
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    border-color: var(--color-primary);
    color: ${props => props.active ? 'var(--color-nav-text)' : 'var(--color-primary)'};
  }

  &:focus-visible {
    outline: none;
    box-shadow: ${({ theme }) => theme.shadows.focus};
  }
`;

const EmptyIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
    <path d="M9 11H15M9 15H15M12 3L13.4302 6.59109C13.6047 7.07191 13.692 7.31232 13.8168 7.52661C13.9278 7.71762 14.0605 7.89517 14.2121 8.05566C14.3821 8.23516 14.5831 8.37855 14.9852 8.66534L18 10.9014V19C18 19.9428 18 20.4142 17.7071 20.7071C17.4142 21 16.9428 21 16 21H8C7.05719 21 6.58579 21 6.29289 20.7071C6 20.4142 6 19.9428 6 19V10.9014L9.01482 8.66534C9.41688 8.37855 9.61791 8.23516 9.78786 8.05566C9.93954 7.89517 10.0722 7.71762 10.1832 7.52661C10.308 7.31232 10.3953 7.07191 10.5698 6.59109L12 3Z"/>
  </svg>
);

const TradeConfirmationList: React.FC<TradeConfirmationListProps> = ({
  confirmations,
  onApprove,
  onReject,
  loading = false,
  processingIds = [],
  emptyStateTitle = 'No pending confirmations',
  emptyStateDescription = 'You don\'t have any trade confirmations waiting for your approval.',
  onEmptyAction,
  emptyActionLabel = 'Browse Strategies'
}) => {
  const [filter, setFilter] = React.useState<'all' | 'pending' | 'executed'>('all');

  const filteredConfirmations = React.useMemo(() => {
    switch (filter) {
      case 'pending':
        return confirmations.filter(c => !c.isExecuted);
      case 'executed':
        return confirmations.filter(c => c.isExecuted);
      default:
        return confirmations;
    }
  }, [confirmations, filter]);

  const pendingCount = confirmations.filter(c => !c.isExecuted).length;

  if (!loading && confirmations.length === 0) {
    return (
      <Container>
        <EmptyState
          title={emptyStateTitle}
          description={emptyStateDescription}
          icon={<EmptyIcon />}
          action={onEmptyAction ? {
            label: emptyActionLabel,
            onClick: onEmptyAction
          } : undefined}
        />
      </Container>
    );
  }

  return (
    <Container>
      <ListHeader>
        <Title>Trade Confirmations</Title>
        {pendingCount > 0 && (
          <CountBadge>{pendingCount} Pending</CountBadge>
        )}
      </ListHeader>

      {confirmations.length > 0 && (
        <FilterSection>
          <FilterButton 
            active={filter === 'all'}
            onClick={() => setFilter('all')}
          >
            All ({confirmations.length})
          </FilterButton>
          <FilterButton 
            active={filter === 'pending'}
            onClick={() => setFilter('pending')}
          >
            Pending ({pendingCount})
          </FilterButton>
          <FilterButton 
            active={filter === 'executed'}
            onClick={() => setFilter('executed')}
          >
            Executed ({confirmations.length - pendingCount})
          </FilterButton>
        </FilterSection>
      )}

      <ListContainer 
        loading={loading}
        empty={filteredConfirmations.length === 0}
        emptyMessage={`No ${filter === 'all' ? '' : filter} confirmations to display`}
        columns={1}
        gap="medium"
      >
        {filteredConfirmations.map((confirmation) => (
          <TradeConfirmationItem
            key={confirmation.confirmationId}
            confirmation={confirmation}
            onApprove={onApprove}
            onReject={onReject}
            isProcessing={processingIds.includes(confirmation.confirmationId)}
          />
        ))}
      </ListContainer>
    </Container>
  );
};

export default TradeConfirmationList;
