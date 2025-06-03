import { defineStorage } from '@aws-amplify/backend';

export const storage = defineStorage({
  access: (allow) => ({
    'public/': [allow.public()],
  }),
});
