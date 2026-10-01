// Declarative control list. The playground renders it today; the customer dashboard can render the SAME list later.
export type Field = { path: string; label: string; type: 'select' | 'color' | 'range' | 'text' | 'textarea' | 'checkbox' | 'lines'; options?: string[]; min?: number; max?: number; group: string };
export const FIELDS: Field[] = [
  { group: 'Theme', path: 'theme.mode', label: 'Mode', type: 'select', options: ['dark', 'light', 'system'] },
  { group: 'Theme', path: 'theme.primaryColor', label: 'Brand colour', type: 'color' },
  { group: 'Theme', path: 'theme.radius', label: 'Corner radius', type: 'range', min: 0, max: 32 },
  { group: 'Theme', path: 'theme.font', label: 'Font stack', type: 'text' },
  { group: 'Launcher', path: 'launcher.show', label: 'Show launcher', type: 'checkbox' },
  { group: 'Launcher', path: 'launcher.position', label: 'Position', type: 'select', options: ['bottom-right', 'bottom-left', 'top-right', 'top-left'] },
  { group: 'Launcher', path: 'launcher.shape', label: 'Shape', type: 'select', options: ['rounded', 'circle'] },
  { group: 'Launcher', path: 'launcher.icon', label: 'Icon', type: 'select', options: ['chat', 'sparkles', 'bot', 'help'] },
  { group: 'Launcher', path: 'launcher.size', label: 'Size', type: 'range', min: 44, max: 84 },
  { group: 'Panel', path: 'panel.width', label: 'Width', type: 'range', min: 300, max: 560 },
  { group: 'Panel', path: 'panel.height', label: 'Height', type: 'range', min: 360, max: 820 },
  { group: 'Panel', path: 'panel.showBranding', label: 'Show “Powered by”', type: 'checkbox' },
  { group: 'Persona', path: 'persona.name', label: 'Name', type: 'text' },
  { group: 'Persona', path: 'persona.subtitle', label: 'Subtitle', type: 'text' },
  { group: 'Persona', path: 'persona.avatarUrl', label: 'Avatar URL', type: 'text' },
  { group: 'Persona', path: 'persona.greeting', label: 'Greeting', type: 'textarea' },
  { group: 'Behavior', path: 'behavior.placeholder', label: 'Input placeholder', type: 'text' },
  { group: 'Behavior', path: 'behavior.suggestedQuestions', label: 'Suggested questions (one per line)', type: 'lines' },
  { group: 'Behavior', path: 'behavior.autoOpenAfterSeconds', label: 'Auto-open after (s)', type: 'range', min: 0, max: 30 },
  { group: 'Advanced', path: 'customCss', label: 'Custom CSS (.launcher, .panel, .m.user …)', type: 'textarea' },
];
