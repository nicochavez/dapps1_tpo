import React from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';

/**
 * Logo vectorial de BidFlow.
 * Reemplaza el PNG pixelado — siempre nítido a cualquier tamaño.
 * @param {number} size  Tamaño total del cuadrado (default 32)
 */
export default function Logo({ size = 32 }) {
  return (
    <MaterialCommunityIcons
      name="gavel"
      size={size}
      color="#7C3AED"
    />
  );
}
