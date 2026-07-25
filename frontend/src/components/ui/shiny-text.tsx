import React, { CSSProperties } from 'react';

interface ShinyTextProps {
  text: string;
  speed?: number;
  delay?: number;
  color?: string;
  shineColor?: string;
  spread?: number;
  direction?: 'left' | 'right';
  yoyo?: boolean;
  pauseOnHover?: boolean;
}

export const ShinyText: React.FC<ShinyTextProps> = ({
  text,
  speed = 3.5,
  delay = 2,
  color = '#94A3B8',
  shineColor = '#FFFFFF',
  spread = 110,
  direction = 'left',
  yoyo = false,
  pauseOnHover = false,
}) => {
  const style = {
    '--shiny-color': color,
    '--shiny-shine-color': shineColor,
    '--shiny-speed': `${speed}s`,
    '--shiny-delay': `${delay}s`,
    '--shiny-spread': `${spread}%`,
  } as CSSProperties;

  const hoverClass = pauseOnHover ? 'hover:animate-none' : '';
  const dirGradient = direction === 'left' ? '110deg' : '70deg';

  return (
    <span
      className={`inline-block text-transparent bg-clip-text animate-[shiny-text_var(--shiny-speed)_linear_infinite] [animation-delay:var(--shiny-delay)] ${hoverClass}`}
      style={{
        ...style,
        backgroundSize: '200% auto',
        backgroundImage: `linear-gradient(${dirGradient}, var(--shiny-color) calc(50% - var(--shiny-spread)/2), var(--shiny-shine-color) 50%, var(--shiny-color) calc(50% + var(--shiny-spread)/2))`,
      }}
    >
      {text}
    </span>
  );
};
