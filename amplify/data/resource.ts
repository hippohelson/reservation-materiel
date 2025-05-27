import { a, defineData } from '@aws-amplify/backend';

export const data = defineData({
  schema: a.schema({
    Student: a.model({
      name: a.string().required(),
    }).authRules([
      a.auth.public().to(['read', 'create', 'update', 'delete']),
    ]),

    Equipment: a.model({
      name: a.string().required(),
      category: a.string(),
      description: a.string(),
      image: a.string(),
      quantity: a.integer(),
    }).authRules([
      a.auth.public().to(['read', 'create', 'update', 'delete']),
    ]),

    Reservation: a.model({
      studentId: a.id().required(),
      equipmentId: a.id().required(),
      startDate: a.date().required(),
      endDate: a.date().required(),
      status: a.string().default('confirmed'),
    }).authRules([
      a.auth.public().to(['read', 'create', 'update', 'delete']),
    ]),
  }),
});
