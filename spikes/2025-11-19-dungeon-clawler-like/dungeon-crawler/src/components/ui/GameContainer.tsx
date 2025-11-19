import styled from 'styled-components';
import { theme } from '../../styles/theme';

export const GameContainer = styled.div`
  width: ${theme.game.width}px;
  height: ${theme.game.height}px;
  background-color: ${theme.colors.background};
  position: relative;
  overflow: hidden;
  margin: 0 auto;
  border: 2px solid ${theme.colors.border};

  /* Scale to fit screen while maintaining aspect ratio */
  @media (max-width: ${theme.game.width}px) {
    transform: scale(calc(100vw / ${theme.game.width}));
    transform-origin: top center;
  }

  @media (max-height: ${theme.game.height}px) {
    transform: scale(calc(100vh / ${theme.game.height}));
    transform-origin: top center;
  }
`;
