
import { useEffect, useCallback } from 'react';

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  meta?: boolean;
  action: () => void;
  description: string;
  category: 'general' | 'navigation' | 'editing' | 'export';
}

// Keyboard shortcut hook
export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[], enabled: boolean = true) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;

    // Don't trigger shortcuts when user is typing in an input/textarea
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
      return;
    }

    for (const shortcut of shortcuts) {
      const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();
      const ctrlMatch = shortcut.ctrl ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey;
      const altMatch = shortcut.alt ? event.altKey : !event.altKey;
      const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;

      if (keyMatch && ctrlMatch && altMatch && shiftMatch) {
        event.preventDefault();
        shortcut.action();
        break;
      }
    }
  }, [shortcuts, enabled]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

// Format shortcut for display
export function formatShortcut(shortcut: KeyboardShortcut): string {
  const parts: string[] = [];

  if (shortcut.ctrl) parts.push('Ctrl');
  if (shortcut.alt) parts.push('Alt');
  if (shortcut.shift) parts.push('Shift');
  if (shortcut.meta) parts.push('⌘');

  parts.push(shortcut.key.toUpperCase());

  return parts.join('+');
}

// Get platform-specific modifier key name
export function getModifierKey(): 'Ctrl' | '⌘' {
  return navigator.platform.toLowerCase().includes('mac') ? '⌘' : 'Ctrl';
}

// Default shortcuts configuration
export function getDefaultShortcuts(actions: {
  analyze?: () => void;
  export?: () => void;
  copy?: () => void;
  nextSection?: () => void;
  prevSection?: () => void;
  toggleHistory?: () => void;
  toggleSettings?: () => void;
  newAnalysis?: () => void;
  toggleHelp?: () => void;
  search?: () => void;
}): KeyboardShortcut[] {
  return [
    // General
    {
      key: 'Enter',
      ctrl: true,
      action: actions.analyze || (() => {}),
      description: 'Start analysis',
      category: 'general'
    },
    {
      key: 'n',
      ctrl: true,
      action: actions.newAnalysis || (() => {}),
      description: 'New analysis',
      category: 'general'
    },
    {
      key: 'k',
      ctrl: true,
      action: actions.search || (() => {}),
      description: 'Search / Command palette',
      category: 'general'
    },
    {
      key: '/',
      ctrl: false,
      action: actions.toggleHelp || (() => {}),
      description: 'Show keyboard shortcuts',
      category: 'general'
    },

    // Navigation
    {
      key: 'j',
      ctrl: false,
      action: actions.nextSection || (() => {}),
      description: 'Next section',
      category: 'navigation'
    },
    {
      key: 'k',
      ctrl: false,
      action: actions.prevSection || (() => {}),
      description: 'Previous section',
      category: 'navigation'
    },
    {
      key: 'h',
      ctrl: true,
      action: actions.toggleHistory || (() => {}),
      description: 'Toggle history panel',
      category: 'navigation'
    },
    {
      key: ',',
      ctrl: true,
      action: actions.toggleSettings || (() => {}),
      description: 'Open settings',
      category: 'navigation'
    },

    // Editing
    {
      key: 'c',
      ctrl: true,
      shift: true,
      action: actions.copy || (() => {}),
      description: 'Copy current section content',
      category: 'editing'
    },

    // Export
    {
      key: 'e',
      ctrl: true,
      action: actions.export || (() => {}),
      description: 'Export analysis',
      category: 'export'
    },
    {
      key: 's',
      ctrl: true,
      action: actions.export || (() => {}),
      description: 'Save / Export',
      category: 'export'
    }
  ];
}
