import colors from './colors';

export const theme = {
  colors: colors.light,
  maroon: '#B4232A',
  amber: '#F2A93B',
  amberSoft: '#FFF1D8',
  cream: '#FFFBF3',
  ink: '#33261F',
  mutedInk: '#866F62',
  green: '#4F8A68',
  blue: '#4C78A8',
  lavender: '#8873A8',
  radius: {
    card: 20,
    pill: 999,
    control: 14,
  },
  shadow: {
    color: '#6B3C22',
    opacity: 0.09,
    radius: 14,
    elevation: 3,
  },
} as const;

export type Theme = typeof theme;