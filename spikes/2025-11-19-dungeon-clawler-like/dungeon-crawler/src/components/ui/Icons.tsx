import styled from 'styled-components';

interface IconProps {
  size?: number;
  color?: string;
}

const IconSvg = styled.svg<{ $size: number }>`
  width: ${(props) => props.$size}px;
  height: ${(props) => props.$size}px;
`;

export function DoorIcon({ size = 32, color = '#8B4513' }: IconProps) {
  return (
    <IconSvg $size={size} viewBox="0 0 32 32" fill="none">
      <rect x="8" y="4" width="16" height="24" fill={color} stroke="#000" strokeWidth="2" />
      <rect x="10" y="6" width="12" height="20" fill="#A0522D" />
      <circle cx="20" cy="16" r="1.5" fill="#FFD700" />
    </IconSvg>
  );
}

export function SwordIcon({ size = 32, color = '#ff0000' }: IconProps) {
  return (
    <IconSvg $size={size} viewBox="0 0 32 32" fill="none">
      <rect x="14" y="4" width="4" height="20" fill={color} stroke="#000" strokeWidth="1" />
      <polygon points="16,2 18,4 14,4" fill={color} stroke="#000" strokeWidth="1" />
      <rect x="10" y="22" width="12" height="3" fill="#8B4513" stroke="#000" strokeWidth="1" />
      <rect x="12" y="25" width="8" height="2" fill="#A0522D" stroke="#000" strokeWidth="1" />
    </IconSvg>
  );
}

export function MonsterIcon({ size = 32, color = '#cc3333' }: IconProps) {
  return (
    <IconSvg $size={size} viewBox="0 0 32 32" fill="none">
      <ellipse cx="16" cy="20" rx="10" ry="8" fill={color} stroke="#000" strokeWidth="2" />
      <circle cx="12" cy="18" r="2" fill="#fff" />
      <circle cx="20" cy="18" r="2" fill="#fff" />
      <circle cx="12" cy="18" r="1" fill="#000" />
      <circle cx="20" cy="18" r="1" fill="#000" />
      <path d="M 12 24 Q 16 26 20 24" stroke="#000" strokeWidth="2" fill="none" />
      <polygon points="6,16 8,12 10,16" fill={color} stroke="#000" strokeWidth="1" />
      <polygon points="26,16 24,12 22,16" fill={color} stroke="#000" strokeWidth="1" />
    </IconSvg>
  );
}

export function ChestIcon({ size = 32, color = '#ffcc00' }: IconProps) {
  return (
    <IconSvg $size={size} viewBox="0 0 32 32" fill="none">
      <rect x="8" y="14" width="16" height="12" fill="#8B4513" stroke="#000" strokeWidth="2" />
      <rect x="8" y="10" width="16" height="4" fill={color} stroke="#000" strokeWidth="2" />
      <rect x="14" y="18" width="4" height="4" fill={color} stroke="#000" strokeWidth="1" />
      <line x1="10" y1="14" x2="10" y2="26" stroke="#000" strokeWidth="1" />
      <line x1="22" y1="14" x2="22" y2="26" stroke="#000" strokeWidth="1" />
    </IconSvg>
  );
}

export function CoinIcon({ size = 32, color = '#6699cc' }: IconProps) {
  return (
    <IconSvg $size={size} viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="10" fill={color} stroke="#000" strokeWidth="2" />
      <text
        x="16"
        y="20"
        fontSize="14"
        fontWeight="bold"
        textAnchor="middle"
        fill="#fff"
        stroke="#000"
        strokeWidth="0.5"
      >
        $
      </text>
    </IconSvg>
  );
}

export function StairsIcon({ size = 32, color = '#8B4513' }: IconProps) {
  return (
    <IconSvg $size={size} viewBox="0 0 32 32" fill="none">
      <rect x="6" y="22" width="6" height="4" fill={color} stroke="#000" strokeWidth="1" />
      <rect x="12" y="18" width="6" height="8" fill={color} stroke="#000" strokeWidth="1" />
      <rect x="18" y="14" width="6" height="12" fill={color} stroke="#000" strokeWidth="1" />
      <rect x="24" y="10" width="2" height="16" fill={color} stroke="#000" strokeWidth="1" />
    </IconSvg>
  );
}
