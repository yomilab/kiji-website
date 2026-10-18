import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';

interface Props {
  /** Design size of the screenshot in CSS pixels. */
  width?: number;
  height?: number;
  className?: string;
  style?: CSSProperties;
  /** When set, the canvas is announced as one image with this description. */
  label?: string;
  children: ReactNode;
}

/**
 * Renders a fixed-size screenshot canvas and scales it to fit its container,
 * so a shot designed at 1280x800 stays pixel-identical at any width.
 * Server-rendered HTML shows the canvas cropped at full size until the island
 * hydrates and measures its width.
 */
export function ShotCanvas({ width = 1280, height = 800, className, style, label, children }: Props) {
  const outer = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const node = outer.current;
    if (!node) return;
    const update = () => setScale(node.clientWidth / width);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, [width]);

  return (
    <div
      ref={outer}
      className={className}
      role={label ? 'img' : undefined}
      aria-label={label}
      style={{ position: 'relative', width: '100%', aspectRatio: `${width} / ${height}`, overflow: 'hidden', ...style }}
    >
      <div
        aria-hidden={label ? true : undefined}
        style={{
          position: 'absolute',
          inset: 0,
          width,
          height,
          transform: `scale(${scale})`,
          transformOrigin: '0 0',
        }}
      >
        {children}
      </div>
    </div>
  );
}
