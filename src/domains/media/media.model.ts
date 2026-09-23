import mongoose, { type Document, type Model, Schema } from "mongoose";

export interface IMedia extends Document {
  filename: string;
  provider?: "cloudinary" | "r2" | "local" | "unsplash";
  cloudinaryPublicId?: string;
  r2Key?: string;
  publicUrl: string;
  optimizedUrl?: string;
  thumbnailUrl?: string;
  cardUrl?: string;
  bannerUrl?: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  altText?: string;
  caption?: string;
  copyright?: string;
  folder?: string;
  category?: string;
  tags: string[];
  variants: {
    size: string;
    width: number;
    height?: number;
    r2Key?: string;
    publicUrl: string;
  }[];
  entityType?: string;
  entityId?: mongoose.Types.ObjectId;
  uploadedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const MediaSchema = new Schema<IMedia>(
  {
    filename: { type: String, required: true },
    provider: { type: String, enum: ["cloudinary", "r2", "local", "unsplash"], default: "cloudinary" },
    cloudinaryPublicId: { type: String, sparse: true },
    r2Key: { type: String, sparse: true },
    publicUrl: { type: String, required: true },
    optimizedUrl: { type: String },
    thumbnailUrl: { type: String },
    cardUrl: { type: String },
    bannerUrl: { type: String },
    mimeType: { type: String, default: "image/webp" },
    size: { type: Number, default: 0 },
    width: { type: Number },
    height: { type: Number },
    altText: { type: String },
    caption: { type: String },
    copyright: { type: String },
    folder: { type: String },
    category: { type: String },
    tags: [{ type: String }],
    variants: [
      {
        size: { type: String, required: true },
        width: { type: Number, required: true },
        height: { type: Number },
        r2Key: { type: String },
        publicUrl: { type: String, required: true },
      },
    ],
    entityType: { type: String },
    entityId: { type: Schema.Types.ObjectId },
    uploadedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true, collection: "media" }
);

MediaSchema.index({ folder: 1, createdAt: -1 });
MediaSchema.index({ category: 1, createdAt: -1 });
MediaSchema.index({ entityType: 1, entityId: 1 });
MediaSchema.index({ tags: 1 });
MediaSchema.index({ mimeType: 1 });

export const MediaModel: Model<IMedia> =
  mongoose.models.Media ?? mongoose.model<IMedia>("Media", MediaSchema);

export default MediaModel;
