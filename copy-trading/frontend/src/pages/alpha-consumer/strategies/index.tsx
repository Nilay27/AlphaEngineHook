import React from 'react';
import GeneratorList from '@/Components/AlphaEngine/GeneratorList';
import TradeNotifications from '@/Components/AlphaEngine/TradeNotifications';

const AlphaConsumerStrategiesPage: React.FC = () => {
  return (
    <>
      <GeneratorList />
      <TradeNotifications />
    </>
  );
};

export default AlphaConsumerStrategiesPage;
