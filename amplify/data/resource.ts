import { defineData } from '@aws-amplify/backend';

export const data = defineData({
  models: {
    Student: {
      fields: {
        id: 'ID!',
        name: 'String!',
      },
    },
    Equipment: {
      fields: {
        id: 'ID!',
        name: 'String!',
        category: 'String',
        description: 'String',
        image: 'String',
        quantity: 'Int',
      },
    },
    Reservation: {
      fields: {
        id: 'ID!',
        studentID: 'ID!',
        equipmentID: 'ID!',
        startDate: 'AWSDate!',
        endDate: 'AWSDate!',
        status: {
          type: 'String',
          default: 'confirmed',
        },
      },
    },
  },
});
