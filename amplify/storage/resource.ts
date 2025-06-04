import { defineStorage } from '@aws-amplify/backend';

export const storage = defineStorage({
  name: 'equipmentReservationStorage',
  access: (allow) => ({
    'equipments/*': [
        allow.guest.to(['read', 'write']),
        allow.authenticated.to(['read', 'write', 'delete']),
    ],
  }),
});