import { createClient } from '@blinkdotnew/sdk';

// Initialize Blink client for MindPet app
export const blink = createClient({
  projectId: 'mindpet-meditation-app-t41od9vp',
  authRequired: true
});

export default blink;