import React, { useMemo } from 'react';
import styled, { useTheme } from 'styled-components';
import { formatEther } from 'viem';
import { BaseCard } from '../Containers';
import { StatusBadge, MetricRow } from '../Common';
import Pressable from '../PressableButton/Pressable';
import { type AlphaGenerator } from '@/utils/alphaengine-client';

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
`;

const TitleSection = styled.div`
  flex: 1;
`;

const GeneratorTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 4px 0;
  transition: color 0.2s ease;
`;

const GeneratorAddress = styled.p`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textMuted};
  font-family: ${({ theme }) => theme.fonts.mono};
  margin: 0;
  transition: color 0.2s ease;
`;

const GeneratorDescription = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textMuted};
  margin: 8px 0 0 0;
  line-height: 1.4;
  transition: color 0.2s ease;
`;

const BadgeContainer = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const RatingSection = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 12px 0;
  padding: 8px 12px;
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.radii.md};
  transition: background 0.2s ease;
`;

const StarRating = styled.div`
  display: flex;
  gap: 2px;
`;

const Star = styled.span<{ $filled: boolean }>`
  color: ${props => props.$filled ? props.theme.colors.warning : props.theme.colors.border};
  font-size: 16px;
  transition: color 0.2s ease;
`;

const RatingText = styled.span`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textMuted};
  font-weight: 500;
`;

const ActionSection = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid ${({ theme }) => theme.colors.subtleBorder};
  transition: border-color 0.2s ease;
`;

const SubscribeButton = styled.button<{ $isSubscribed?: boolean }>`
  flex: 1;
  background-color: ${({ theme, $isSubscribed }) =>
    $isSubscribed ? theme.colors.success : theme.colors.primary};
  color: ${({ theme }) => theme.colors.navText};
  border: none;
  border-radius: ${({ theme }) => theme.radii.sm};
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: ${({ $isSubscribed }) => ($isSubscribed ? 'default' : 'pointer')};
  transition: all 0.2s ease;
  opacity: ${({ $isSubscribed }) => ($isSubscribed ? 0.85 : 1)};

  &:hover {
    ${({ $isSubscribed, theme }) =>
      !$isSubscribed && `
        background-color: ${theme.colors.primaryHover};
        transform: translateY(-1px);
      `}
  }

  &:active {
    ${({ $isSubscribed }) =>
      !$isSubscribed && `
        transform: translateY(0);
      `}
  }

  &:focus-visible {
    outline: none;
    box-shadow: ${({ theme }) => theme.shadows.focus};
  }

  &:disabled {
    cursor: not-allowed;
  }
`;

interface GeneratorCardProps {
  generator: AlphaGenerator;
  isSubscribed: boolean;
  onSubscribe: () => void;
}

const formatAddress = (address: string | undefined) => {
  if (!address) return '-';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

const renderRating = (rating: number) => {
  const stars = [];
  for (let i = 0; i < 5; i++) {
    stars.push(
      <Star key={i} $filled={i < Math.floor(rating)}>★</Star>
    );
  }
  return stars;
};

const GeneratorCard: React.FC<GeneratorCardProps> = ({
  generator,
  isSubscribed,
  onSubscribe
}) => {
  const theme = useTheme();

  const metrics = useMemo(
    () => [
      {
        label: 'Subscription Fee',
        value: generator.subscriptionFee
          ? `${formatEther(BigInt(generator.subscriptionFee))} ETH`
          : '-',
        color: theme.colors.primary,
      },
      {
        label: 'Performance Fee',
        value: generator.performanceFee
          ? `${(generator.performanceFee / 100).toFixed(1)}%`
          : '-',
        color: theme.colors.info,
      },
      {
        label: 'Subscribers',
        value: generator.totalSubscribers?.toString() || '-',
        color: theme.colors.success,
      },
      {
        label: 'Total Volume',
        value: generator.totalVolume
          ? `${parseFloat(formatEther(BigInt(generator.totalVolume))).toFixed(2)} ETH`
          : '-',
        color: theme.colors.text,
      },
    ],
    [generator, theme]
  );

  return (
    <BaseCard>
      <CardHeader>
        <TitleSection>
          <GeneratorTitle>
            {generator.displayName || '-'}
          </GeneratorTitle>
          <GeneratorAddress>
            {formatAddress(generator.walletAddress)}
          </GeneratorAddress>
          {generator.description && (
            <GeneratorDescription>
              {generator.description}
            </GeneratorDescription>
          )}
        </TitleSection>
        <BadgeContainer>
          {generator.isVerified && (
            <StatusBadge 
              status="success"
              label="Verified"
              size="small"
            />
          )}
          {isSubscribed && (
            <StatusBadge 
              status="success"
              label="Subscribed"
              size="small"
            />
          )}
          <StatusBadge 
            status={generator.isActive ? 'active' : 'inactive'}
            size="small"
          />
        </BadgeContainer>
      </CardHeader>

      <RatingSection>
        <StarRating>
          {renderRating(generator.rating || 0)}
        </StarRating>
        <RatingText>
          {generator.rating?.toFixed(1) || '-'} / 5.0
        </RatingText>
      </RatingSection>

      <MetricRow metrics={metrics} columns={2} />

      <ActionSection>
        {isSubscribed ? (
          <SubscribeButton
            $isSubscribed={true}
            disabled
          >
            ✓ Subscribed
          </SubscribeButton>
        ) : (
          <Pressable>
            <SubscribeButton
              onClick={onSubscribe}
              $isSubscribed={false}
            >
              Subscribe
            </SubscribeButton>
          </Pressable>
        )}
      </ActionSection>
    </BaseCard>
  );
};

export default GeneratorCard;