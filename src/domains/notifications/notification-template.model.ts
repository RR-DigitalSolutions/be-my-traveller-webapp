import mongoose, { type Document, type Model, Schema } from "mongoose";

export interface INotificationTemplate extends Document {
  name: string;
  channel: "EMAIL" | "WHATSAPP" | "SMS";
  subject?: string;
  body: string; // handlebars template
  variables: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationTemplateSchema = new Schema<INotificationTemplate>(
  {
    name: { type: String, required: true, unique: true },
    channel: {
      type: String,
      enum: ["EMAIL", "WHATSAPP", "SMS"],
      required: true,
    },
    subject: { type: String },
    body: { type: String, required: true },
    variables: [{ type: String }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, collection: "notification_templates" }
);

export const NotificationTemplateModel: Model<INotificationTemplate> =
  mongoose.models.NotificationTemplate ??
  mongoose.model<INotificationTemplate>(
    "NotificationTemplate",
    NotificationTemplateSchema
  );

export default NotificationTemplateModel;
