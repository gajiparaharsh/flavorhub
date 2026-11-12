import React from 'react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { cn } from '@/lib/utils';

type AnimationVariant = 
  | 'fade-up' 
  | 'fade-down' 
  | 'fade-left' 
  | 'fade-right' 
  | 'zoom-in' 
  | 'zoom-out'
  | 'slide-up'
  | 'blur-in';

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  variant?: AnimationVariant;
  delay?: number;
  duration?: number;
  threshold?: number;
  triggerOnce?: boolean;
}

const variantStyles: Record<AnimationVariant, { hidden: string; visible: string }> = {
  'fade-up': {
    hidden: 'opacity-0 translate-y-12',
    visible: 'opacity-100 translate-y-0',
  },
  'fade-down': {
    hidden: 'opacity-0 -translate-y-12',
    visible: 'opacity-100 translate-y-0',
  },
  'fade-left': {
    hidden: 'opacity-0 translate-x-12',
    visible: 'opacity-100 translate-x-0',
  },
  'fade-right': {
    hidden: 'opacity-0 -translate-x-12',
    visible: 'opacity-100 translate-x-0',
  },
  'zoom-in': {
    hidden: 'opacity-0 scale-90',
    visible: 'opacity-100 scale-100',
  },
  'zoom-out': {
    hidden: 'opacity-0 scale-110',
    visible: 'opacity-100 scale-100',
  },
  'slide-up': {
    hidden: 'opacity-0 translate-y-20',
    visible: 'opacity-100 translate-y-0',
  },
  'blur-in': {
    hidden: 'opacity-0 blur-sm scale-95',
    visible: 'opacity-100 blur-0 scale-100',
  },
};

export function ScrollReveal({
  children,
  className,
  variant = 'fade-up',
  delay = 0,
  duration = 600,
  threshold = 0.1,
  triggerOnce = true,
}: ScrollRevealProps) {
  const { ref, isVisible } = useScrollAnimation<HTMLDivElement>({ threshold, triggerOnce });
  const styles = variantStyles[variant];

  return (
    <div
      ref={ref}
      className={cn(
        'transition-all ease-out',
        isVisible ? styles.visible : styles.hidden,
        className
      )}
      style={{
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

// Staggered children animation wrapper
interface ScrollRevealGroupProps {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
  variant?: AnimationVariant;
  duration?: number;
  threshold?: number;
}

export function ScrollRevealGroup({
  children,
  className,
  staggerDelay = 100,
  variant = 'fade-up',
  duration = 600,
  threshold = 0.1,
}: ScrollRevealGroupProps) {
  const { ref, isVisible } = useScrollAnimation<HTMLDivElement>({ threshold });
  const styles = variantStyles[variant];

  return (
    <div ref={ref} className={className}>
      {React.Children.map(children, (child, index) => (
        <div
          className={cn(
            'transition-all ease-out',
            isVisible ? styles.visible : styles.hidden
          )}
          style={{
            transitionDuration: `${duration}ms`,
            transitionDelay: `${index * staggerDelay}ms`,
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
}
