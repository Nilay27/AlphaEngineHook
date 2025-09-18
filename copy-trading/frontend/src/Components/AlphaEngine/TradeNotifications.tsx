import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { formatEther, formatUnits } from 'viem';
import { useTradeNotifications } from '@/hooks/use-alpha-engine';
import NotificationItem from './NotificationItem';
import styled from 'styled-components';

const Container = styled.div`
  position: fixed;
  right: 20px;
  top: 80px;
  width: 400px;
  max-height: 600px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  z-index: 999;
`;

const Header = styled.div`
  padding: 16px 20px;
  background: var(--color-surface-elevated);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text);
  display: flex;
  align-items: center;
  gap: 8px;
`;

const StatusIndicator = styled.span<{ $connected: boolean }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => props.$connected ? 'var(--color-success)' : 'var(--color-error)'};
  animation: ${props => props.$connected ? 'pulse 2s infinite' : 'none'};

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: var(--color-text-muted);
  font-size: 20px;
  cursor: pointer;

  &:hover {
    color: var(--color-text);
  }
`;

const FilterBar = styled.div`
  padding: 12px 20px;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  gap: 8px;
`;

const FilterButton = styled.button<{ $active: boolean }>`
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px solid ${props => props.$active ? 'var(--color-primary)' : 'var(--color-border)'};
  background: ${props => props.$active ? 'var(--color-primary)' : 'transparent'};
  color: ${props => props.$active ? 'white' : 'var(--color-text)'};
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.$active ? 'var(--color-primary-hover)' : 'var(--color-surface-hover)'};
  }
`;

const NotificationList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 12px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 32px 20px;
  color: var(--color-text-muted);
`;

const EmptyIcon = styled.div`
  font-size: 48px;
  margin-bottom: 12px;
  opacity: 0.3;
`;

const EmptyText = styled.p`
  font-size: 14px;
`;

const MinimizeButton = styled.button`
  padding: 4px 8px;
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  color: var(--color-text-muted);
  font-size: 11px;
  cursor: pointer;

  &:hover {
    background: var(--color-surface-hover);
  }
`;

const Badge = styled.span`
  padding: 2px 6px;
  border-radius: 10px;
  background: var(--color-error);
  color: white;
  font-size: 10px;
  font-weight: 600;
`;

type FilterType = 'all' | 'pending' | 'executed' | 'expired';

interface TradeNotificationsProps {
  onClose?: () => void;
}

export default function TradeNotifications({ onClose }: TradeNotificationsProps) {
  const { address: userAddress } = useAccount();
  const { notifications, isConnected } = useTradeNotifications(userAddress);

  const [filter, setFilter] = useState<FilterType>('all');
  const [isMinimized, setIsMinimized] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Count unread notifications
    const newCount = notifications.filter(n =>
      n.type === 'NEW_TRADE' && !n.read
    ).length;
    setUnreadCount(newCount);
  }, [notifications]);

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (!notification.trade) return false;

    switch (filter) {
      case 'pending':
        return notification.trade.status === 'pending';
      case 'executed':
        return notification.trade.status === 'executed';
      case 'expired':
        return notification.trade.status === 'expired';
      default:
        return true;
    }
  });

  if (isMinimized) {
    return (
      <Container style={{ height: 'auto' }}>
        <Header>
          <Title>
            <StatusIndicator $connected={isConnected} />
            Trade Notifications
            {unreadCount > 0 && <Badge>{unreadCount}</Badge>}
          </Title>
          <div style={{ display: 'flex', gap: '8px' }}>
            <MinimizeButton onClick={() => setIsMinimized(false)}>
              Expand
            </MinimizeButton>
            {onClose && <CloseButton onClick={onClose}>×</CloseButton>}
          </div>
        </Header>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>
          <StatusIndicator $connected={isConnected} />
          Trade Notifications
          {unreadCount > 0 && <Badge>{unreadCount}</Badge>}
        </Title>
        <div style={{ display: 'flex', gap: '8px' }}>
          <MinimizeButton onClick={() => setIsMinimized(true)}>
            Minimize
          </MinimizeButton>
          {onClose && <CloseButton onClick={onClose}>×</CloseButton>}
        </div>
      </Header>

      <FilterBar>
        <FilterButton
          $active={filter === 'all'}
          onClick={() => setFilter('all')}
        >
          All
        </FilterButton>
        <FilterButton
          $active={filter === 'pending'}
          onClick={() => setFilter('pending')}
        >
          Pending
        </FilterButton>
        <FilterButton
          $active={filter === 'executed'}
          onClick={() => setFilter('executed')}
        >
          Executed
        </FilterButton>
        <FilterButton
          $active={filter === 'expired'}
          onClick={() => setFilter('expired')}
        >
          Expired
        </FilterButton>
      </FilterBar>

      <NotificationList>
        {filteredNotifications.length === 0 ? (
          <EmptyState>
            <EmptyIcon>📭</EmptyIcon>
            <EmptyText>
              {filter === 'all'
                ? 'No notifications yet'
                : `No ${filter} notifications`}
            </EmptyText>
          </EmptyState>
        ) : (
          filteredNotifications.map((notification, index) => (
            <NotificationItem
              key={`${notification.timestamp}-${index}`}
              notification={notification}
            />
          ))
        )}
      </NotificationList>
    </Container>
  );
}