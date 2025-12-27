/**
 * StatusIcon component with NativeWind styling
 * Displays a circular icon indicating payment status (success, error, etc.)
 */

import { PaymentStatus } from '@/types/payments';
import React from 'react';
import { View, Text } from 'react-native';

interface StatusIconProps {
  status: PaymentStatus;
  className?: string;
}

export function StatusIcon({ status, className = '' }: StatusIconProps) {
  const getIconConfig = () => {
    switch (status) {
      case 'succeeded':
      case 'active':
        return {
          icon: '✓',
          bgClass: 'bg-success',
        };
      default:
        return {
          icon: '!',
          bgClass: 'bg-danger',
        };
    }
  };

  const config = getIconConfig();

  return (
    <View
      className={`w-[100px] h-[100px] rounded-full justify-center items-center ${config.bgClass} ${className}`}
    >
      <Text className="text-[28px] text-white font-bold">{config.icon}</Text>
    </View>
  );
}
