import { a, defineData } from '@aws-amplify/backend';

export const data = defineData({
  schema: a.schema({
    Student: a.model({
      name: a.string().required(),
    }),

    Equipment: a.model({
      name: a.string().required(),
      category: a.string(),
      description: a.string(),
      image: a.string(),
      quantity: a.integer(),
    }),

    Reservation: a.model({
      studentId: a.id().required(),
      equipmentId: a.id().required(),
      startDate: a.date().required(),
      endDate: a.date().required(),
      status: a.string().default('confirmed'),
    }),
  }),
});
