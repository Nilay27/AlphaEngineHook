import React from 'react';
import styled from 'styled-components';
import type { AppTheme } from '@/styles/theme';

type StatusType = 'active' | 'inactive' | 'pending' | 'success' | 'error' | 'warning';
type SizeType = 'small' | 'medium' | 'large';

interface StatusBadgeProps {
  status: StatusType;
  label?: string;
  size?: SizeType;
  className?: string;
}

const getStatusColor = (theme: AppTheme, status: StatusType) => {
  switch (status) {
    case 'active':
    case 'success':
      return {
        bg: theme.colors.successSurface,
        text: theme.colors.success,
        border: 'transparent',
      };
    case 'pending':
      return {
        bg: theme.colors.infoSurface,
        text: theme.colors.info,
        border: 'transparent',
      };
    case 'warning':
      return {
        bg: theme.colors.warningSurface,
        text: theme.colors.warning,
        border: 'transparent',
      };
    case 'error':
      return {
        bg: theme.colors.dangerSurface,
        text: theme.colors.danger,
        border: 'transparent',
      };
    case 'inactive':
      return {
        bg: theme.colors.neutralSurface,
        text: theme.colors.textMuted,
        border: 'transparent',
      };
    default:
      return {
        bg: theme.colors.surfaceAlt,
        text: theme.colors.textMuted,
        border: theme.colors.border,
      };
  }
};

const getSize = (size: SizeType) => {
  switch (size) {
    case 'small':
      return { padding: '2px 8px', fontSize: '11px' };
    case 'large':
      return { padding: '6px 16px', fontSize: '14px' };
    case 'medium':
    default:
      return { padding: '4px 12px', fontSize: '12px' };
  }
};

const Badge = styled.span<{ status: StatusType; size: SizeType }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.025em;
  transition: all 0.2s;
  
  ${({ theme, status, size }) => {
    const colors = getStatusColor(theme, status);
    const sizing = getSize(size);
    return `
      background-color: ${colors.bg};
      color: ${colors.text};
      border: 1px solid ${colors.border};
      padding: ${sizing.padding};
      font-size: ${sizing.fontSize};
    `;
  }}
  
  &:hover {
    transform: scale(1.05);
  }
`;

const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  size = 'medium',
  className
}) => {
  const getDefaultLabel = () => {
    switch (status) {
      case 'active': return 'Active';
      case 'inactive': return 'Inactive';
      case 'pending': return 'Pending';
      case 'success': return 'Success';
      case 'error': return 'Error';
      case 'warning': return 'Warning';
      default: return status;
    }
  };

  return (
    <Badge status={status} size={size} className={className}>
      {label || getDefaultLabel()}
    </Badge>
  );
};

export default StatusBadge;
