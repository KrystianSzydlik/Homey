export interface AccessibleButtonProps {
  'aria-label'?: string;
  'aria-pressed'?: boolean | 'mixed';
  'aria-expanded'?: boolean;
  'aria-haspopup'?: boolean | 'menu' | 'listbox' | 'dialog' | 'tree' | 'grid';
  'aria-controls'?: string;
  'aria-describedby'?: string;
  'aria-disabled'?: boolean;
}

export interface AccessibleFormFieldProps {
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean;
  'aria-required'?: boolean;
  'aria-readonly'?: boolean;
}

export function getAriaLabel(action: string, context?: string): string {
  const label = action.charAt(0).toUpperCase() + action.slice(1);
  return context ? `${label} ${context}` : label;
}

export function getAriaDescribedBy(
  errorId?: string,
  helpTextId?: string
): string | undefined {
  const ids = [errorId, helpTextId].filter(Boolean);
  return ids.length > 0 ? ids.join(' ') : undefined;
}

export const KeyboardKeys = {
  ESCAPE: 'Escape',
  ENTER: 'Enter',
  TAB: 'Tab',
  SPACE: ' ',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  HOME: 'Home',
  END: 'End',
} as const;

export function isKeyboardEvent(
  event: KeyboardEvent,
  key: (typeof KeyboardKeys)[keyof typeof KeyboardKeys]
): boolean {
  return event.key === key;
}

export function getAnnouncementText(
  action: string,
  count?: number
): string {
  if (count !== undefined) {
    return `${action}. ${count} item${count !== 1 ? 's' : ''}.`;
  }
  return action;
}
