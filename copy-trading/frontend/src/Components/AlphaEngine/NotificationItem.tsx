import React from 'react';
import { formatEther, formatUnits } from 'viem';
import styled from 'styled-components';

const Item = styled.div<{ $isNew?: boolean }>`
  padding: 12px;
  margin-bottom: 8px;
  background: ${props => props.$isNew ? 'var(--color-primary-bg)' : 'var(--color-surface-elevated)'};
  border: 1px solid ${props => props.$isNew ? 'var(--color-primary)' : 'var(--color-border)'};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: translateX(2px);
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const TypeBadge = styled.span<{ $type: string }>`
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
  background: ${props => {
    switch(props.$type) {
      case 'NEW_TRADE': return 'var(--color-success-bg)';
      case 'STATUS_UPDATE': return 'var(--color-info-bg)';
      case 'EXPIRY_WARNING': return 'var(--color-warning-bg)';
      default: return 'var(--color-surface)';
    }
  }};
  color: ${props => {
    switch(props.$type) {
      case 'NEW_TRADE': return 'var(--color-success)';
      case 'STATUS_UPDATE': return 'var(--color-info)';
      case 'EXPIRY_WARNING': return 'var(--color-warning)';
      default: return 'var(--color-text)';
    }
  }};
`;

const Time = styled.span`
  font-size: 11px;
  color: var(--color-text-muted);
`;

const Content = styled.div`
  font-size: 13px;
  color: var(--color-text);
  line-height: 1.4;
`;

const TradeDetails = styled.div`
  margin-top: 8px;
  padding: 8px;
  background: var(--color-surface);
  border-radius: 6px;
`;

const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
  font-size: 12px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const DetailLabel = styled.span`
  color: var(--color-text-muted);
`;

const DetailValue = styled.span`
  color: var(--color-text);
  font-weight: 500;
`;

const ActionButton = styled.button`
  margin-top: 8px;
  width: 100%;
  padding: 6px 12px;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: var(--color-primary-hover);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

interface NotificationItemProps {
  notification: any;
}

export default function NotificationItem({ notification }: NotificationItemProps) {
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;

    return date.toLocaleDateString();
  };

  const getTypeLabel = (type: string) => {
    switch(type) {
      case 'NEW_TRADE': return 'New Trade';
      case 'STATUS_UPDATE': return 'Status Update';
      case 'EXPIRY_WARNING': return 'Expiring Soon';
      case 'SUBSCRIPTION_UPDATE': return 'Subscription';
      default: return type;
    }
  };

  const getMessage = () => {
    switch(notification.type) {
      case 'NEW_TRADE':
        return `New ${notification.trade?.action || 'trade'} signal from your generator`;
      case 'STATUS_UPDATE':
        return `Trade ${notification.trade?.status || 'updated'}`;
      case 'EXPIRY_WARNING':
        return 'Trade expiring soon - execute now or it will expire';
      case 'SUBSCRIPTION_UPDATE':
        return notification.update?.message || 'Subscription updated';
      default:
        return 'Notification received';
    }
  };

  const handleExecute = () => {
    console.log('Execute trade:', notification.trade);
    // Implementation would trigger trade execution
  };

  const isNew = notification.type === 'NEW_TRADE' && !notification.read;

  return (
    <Item $isNew={isNew}>
      <Header>
        <TypeBadge $type={notification.type}>
          {getTypeLabel(notification.type)}
        </TypeBadge>
        <Time>{formatTime(notification.timestamp)}</Time>
      </Header>

      <Content>{getMessage()}</Content>

      {notification.trade && (
        <TradeDetails>
          <DetailRow>
            <DetailLabel>Protocol</DetailLabel>
            <DetailValue>{notification.trade.protocol?.toUpperCase()}</DetailValue>
          </DetailRow>
          <DetailRow>
            <DetailLabel>Action</DetailLabel>
            <DetailValue>{notification.trade.action}</DetailValue>
          </DetailRow>
          {notification.trade.amount && (
            <DetailRow>
              <DetailLabel>Amount</DetailLabel>
              <DetailValue>{formatEther(BigInt(notification.trade.amount))} ETH</DetailValue>
            </DetailRow>
          )}
          <DetailRow>
            <DetailLabel>Gas Estimate</DetailLabel>
            <DetailValue>{formatUnits(BigInt(notification.trade.gasEstimate || '0'), 9)} Gwei</DetailValue>
          </DetailRow>

          {notification.trade.status === 'pending' && (
            <ActionButton onClick={handleExecute}>
              Execute Trade
            </ActionButton>
          )}
        </TradeDetails>
      )}
    </Item>
  );
}