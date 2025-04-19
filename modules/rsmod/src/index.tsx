import { NitroModules } from 'react-native-nitro-modules';
import type { Multiply } from './Multiply.nitro';

const MultiplyHybridObject =
  NitroModules.createHybridObject<Multiply>('Multiply');

export function multiply(a: number, b: number): number {
  return MultiplyHybridObject.multiply(a, b);
}
