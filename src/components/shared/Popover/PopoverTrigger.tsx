'use client';

import { usePopoverContext } from './PopoverContext';
import type { PopoverTriggerProps } from './types';

export function PopoverTrigger({
  className,
  children,
  onClick,
  ...props
}: PopoverTriggerProps) {
  const { isOpen, setIsOpen, triggerRef, contentId } = usePopoverContext();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(e);
    setIsOpen(!isOpen);
  };

  return (
    <button
      type="button"
      ref={triggerRef}
      className={className}
      onClick={handleClick}
      aria-expanded={isOpen}
      aria-haspopup="dialog"
      aria-controls={isOpen ? contentId : undefined}
      {...props}
    >
      {children}
    </button>
  );
}
