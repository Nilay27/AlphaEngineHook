import React, { CSSProperties, PropsWithChildren } from 'react';
import styled from 'styled-components';

interface BaseCardProps {
  clickable?: boolean;
  className?: string;
  style?: CSSProperties;
  onClick?: () => void;
  noPadding?: boolean;
  variant?: 'default' | 'elevated' | 'bordered';
}

const CardContainer = styled.div<BaseCardProps>`
  background: ${({ theme }) => theme.colors.surfaceElevated};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  padding: ${props => props.noPadding ? '0' : '20px'};
  margin-bottom: 16px;
  transition: all 0.2s ease;
  cursor: ${props => props.clickable ? 'pointer' : 'default'};
  position: relative;
  color: ${({ theme }) => theme.colors.text};

  ${props => props.variant === 'elevated' && `
    box-shadow: ${props.theme.mode === 'light'
      ? '0 12px 24px rgba(15, 23, 42, 0.08)'
      : '0 12px 24px rgba(0, 0, 0, 0.45)'};
  `}

  ${props => props.variant === 'bordered' && `
    border: 2px solid ${props.theme.colors.primary};
  `}

  &:hover {
    ${props => props.clickable && `
      transform: translateY(-2px);
      box-shadow: ${props.theme.mode === 'light'
        ? '0 14px 28px rgba(37, 70, 240, 0.12)'
        : '0 18px 32px rgba(92, 124, 255, 0.25)'};
      border-color: ${props.theme.colors.primary};
    `}
  }

  &:active {
    ${props => props.clickable && `
      transform: translateY(0);
    `}
  }
`;

const BaseCard: React.FC<PropsWithChildren<BaseCardProps>> = ({
  children,
  clickable = false,
  className,
  style,
  onClick,
  noPadding = false,
  variant = 'default'
}) => {
  return (
    <CardContainer
      clickable={clickable}
      className={className}
      style={style}
      onClick={clickable ? onClick : undefined}
      noPadding={noPadding}
      variant={variant}
    >
      {children}
    </CardContainer>
  );
};

export default BaseCard;
