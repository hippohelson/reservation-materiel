import { a, defineData } from '@aws-amplify/backend';

const schema = a.schema({
  Student: a
    .model({
      name: a.string().required(),
    })
    .authorization((allow) => [allow.publicApiKey()]),

  Equipment: a
    .model({
      name: a.string().required(),
      category: a.string(),
      description: a.string(),
      image: a.string(),
      quantity: a.integer(),
    })
    .authorization((allow) => [allow.publicApiKey()]),

  Reservation: a
    .model({
      studentId: a.id().required(),
      equipmentId: a.id().required(),
      startDate: a.date().required(),
      endDate: a.date().required(),
      status: a.string().default('confirmed'),
    })
    .authorization((allow) => [allow.publicApiKey()]),
});

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'apiKey',
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
});
