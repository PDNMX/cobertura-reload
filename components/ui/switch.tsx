// src/components/ui/switch.tsx
import * as SwitchPrimitive from '@radix-ui/react-switch';
import React from 'react';

interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
}

export const Switch: React.FC<SwitchProps> = ({ checked, onCheckedChange, disabled }) => (
  <SwitchPrimitive.Root
    className={`relative inline-flex items-center h-6 rounded-full w-11 ${checked ? 'bg-blue-600' : 'bg-gray-200'}`}
    checked={checked}
    onCheckedChange={onCheckedChange}
    disabled={disabled}
  >
    <SwitchPrimitive.Thumb
      className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`}
    />
  </SwitchPrimitive.Root>
);