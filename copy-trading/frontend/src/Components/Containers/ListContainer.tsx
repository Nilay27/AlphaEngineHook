import React, { PropsWithChildren } from 'react';
import styled from 'styled-components';

interface ListContainerProps {
  loading?: boolean;
  empty?: boolean;
  emptyMessage?: string;
  columns?: 1 | 2 | 3 | 4;
  gap?: 'small' | 'medium' | 'large';
  className?: string;
}

const Container = styled.div<{ columns: number; gap: string }>`
  display: grid;
  grid-template-columns: repeat(${props => props.columns}, 1fr);
  gap: ${props => {
    switch(props.gap) {
      case 'small': return '12px';
      case 'medium': return '16px';
      case 'large': return '24px';
      default: return '16px';
    }
  }};
  width: 100%;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
  
  @media (min-width: 769px) and (max-width: 1024px) {
    grid-template-columns: repeat(${props => Math.min(props.columns, 2)}, 1fr);
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 14px;
  transition: color 0.2s ease;
`;

const EmptyContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  text-align: center;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 14px;
  line-height: 1.5;
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 8px;
  border: 1px dashed ${({ theme }) => theme.colors.subtleBorder};
  transition: background 0.2s ease, border-color 0.2s ease, color 0.2s ease;
`;

const ListContainer: React.FC<PropsWithChildren<ListContainerProps>> = ({
  children,
  loading = false,
  empty = false,
  emptyMessage = 'No items to display',
  columns = 1,
  gap = 'medium',
  className
}) => {
  if (loading) {
    return (
      <LoadingContainer>
        Loading...
      </LoadingContainer>
    );
  }

  if (empty) {
    return (
      <EmptyContainer>
        {emptyMessage}
      </EmptyContainer>
    );
  }

  return (
    <Container columns={columns} gap={gap} className={className}>
      {children}
    </Container>
  );
};

export default ListContainer;
