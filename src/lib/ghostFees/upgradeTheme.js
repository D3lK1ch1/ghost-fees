import { useTheme } from '@/lib/ThemeContext';

// Colours for the upgrade flow (limit sheet, sign in, /upgrade, /unlocked), from the
// Claude Design canvas "Ghost Fees upgrade flow" (2 Nov 2026). One palette per theme.
export const UPGRADE_PALETTES = {
  haunted: { page: '#16101F', bg: '#1E1433', sheet: '#2B1F47', card: '#241B33', raised: '#2A2040', line: '#2E2440', chip: '#3A2D5A', handle: '#5A4C7A', track: '#33284A', muted: '#C9BFE0', soft: '#E4DDF5', faint: '#B9AFCC', accent: '#6EF0C2', ink: '#16101F', founding: '#FFB86B' },
  ex: { page: '#2A0F1F', bg: '#2A0F1F', sheet: '#3D1A2E', card: '#3D1A2E', raised: '#4A2238', line: '#552840', chip: '#552840', handle: '#6E3A55', track: '#552840', muted: '#E7C7D6', soft: '#F6E3EC', faint: '#D4A9BD', accent: '#FF9BC2', ink: '#2A0F1F', founding: '#FFB86B' },
  christmas: { page: '#0F2A1F', bg: '#0F2A1F', sheet: '#1A3D2E', card: '#1A3D2E', raised: '#21493A', line: '#2C5443', chip: '#24503D', handle: '#3A6150', track: '#2C5443', muted: '#CFE3D8', soft: '#E6F2EB', faint: '#AFCBBD', accent: '#F2CB6B', ink: '#0F2A1F', founding: '#FF9BC2' },
};

export function useUpgradePalette() {
  const { theme } = useTheme();
  return UPGRADE_PALETTES[theme?.key] || UPGRADE_PALETTES.haunted;
}
