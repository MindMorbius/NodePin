export interface Subscription {
  _id?: string;
  name: string;
  url: string;
  created_at: Date;
  updated_at?: Date;
}

// MongoDB 验证规则
export const subscriptionSchema = {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["name", "url", "created_at"],
      properties: {
        name: {
          bsonType: "string",
          description: "must be a string and is required"
        },
        url: {
          bsonType: "string",
          description: "must be a string and is required"
        },
        created_at: {
          bsonType: "date",
          description: "must be a date and is required"
        },
        updated_at: {
          bsonType: "date",
          description: "must be a date if the field exists"
        }
      }
    }
  }
}; 