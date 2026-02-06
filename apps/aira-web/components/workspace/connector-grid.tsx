'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ConnectorCard } from './connector-card';

interface Connector {
  id: string;
  name: string;
  type: 'whatsapp' | 'email' | 'calendar' | 'drive';
  isConnected: boolean;
  rulesCount?: number;
}

interface ConnectorGridProps {
  connectors: Connector[];
  onConnectorClick?: (connector: Connector) => void;
  className?: string;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function ConnectorGrid({
  connectors,
  onConnectorClick,
  className,
}: ConnectorGridProps) {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className={`grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 ${className}`}
    >
      {connectors.map(connector => (
        <motion.div key={connector.id} variants={item}>
          <ConnectorCard
            id={connector.id}
            name={connector.name}
            type={connector.type}
            isConnected={connector.isConnected}
            rulesCount={connector.rulesCount}
            onClick={() => onConnectorClick?.(connector)}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}
