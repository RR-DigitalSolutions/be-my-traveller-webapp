"use server";

import { revalidatePath } from "next/cache";
import connectDB from "@/lib/db/mongoose";
import { DestinationModel } from "./destination.model";
import { requirePermission } from "@/lib/auth/authorize";
import { Permission } from "@/lib/auth/permissions";
import { AuditService } from "@/domains/auth/audit.service";
import { slugify } from "@/lib/utils";

export async function createDestination(formData: any) {
  const session = await requirePermission(Permission.DESTINATION_CREATE);
  await connectDB();

  const slug = formData.slug ? slugify(formData.slug) : slugify(formData.name);

  // Check duplicate slug
  const existing = await DestinationModel.findOne({ slug });
  if (existing) {
    throw new Error(`A destination with slug "${slug}" already exists.`);
  }

  // If parent is set, calculate ancestors array
  const ancestors: string[] = [];
  if (formData.parent) {
    const parentDoc = await DestinationModel.findById(formData.parent);
    if (parentDoc) {
      ancestors.push(...parentDoc.ancestors.map((a: any) => a.toString()), parentDoc._id.toString());
    }
  }

  const destination = await DestinationModel.create({
    ...formData,
    slug,
    ancestors,
    createdBy: session.user.id,
  });

  await AuditService.log({
    userId: session.user.id,
    userEmail: session.user.email || "admin",
    action: "CREATE",
    entityType: "Destination",
    entityId: destination._id.toString(),
    entitySlug: destination.slug,
    newValue: { name: destination.name, slug: destination.slug, type: destination.type },
  });

  revalidatePath("/admin/content/destinations");
  revalidatePath("/destinations");

  return { success: true, id: destination._id.toString(), slug: destination.slug };
}

export async function updateDestination(id: string, formData: any) {
  const session = await requirePermission(Permission.DESTINATION_EDIT);
  await connectDB();

  const destination = await DestinationModel.findById(id);
  if (!destination) {
    throw new Error("Destination not found.");
  }

  const oldValue = { name: destination.name, status: destination.status, type: destination.type };

  // Update fields
  if (formData.name) destination.name = formData.name;
  if (formData.type) destination.type = formData.type;
  if (formData.tagline !== undefined) destination.tagline = formData.tagline;
  if (formData.shortDescription) destination.shortDescription = formData.shortDescription;
  if (formData.longDescription) destination.longDescription = formData.longDescription;
  if (formData.highlights) destination.highlights = formData.highlights;
  if (formData.bestTimeToVisit) destination.bestTimeToVisit = formData.bestTimeToVisit;
  if (formData.weather) destination.weather = formData.weather;
  if (formData.coverImage) destination.coverImage = formData.coverImage;
  if (formData.gallery) destination.gallery = formData.gallery;
  if (formData.seo) destination.seo = formData.seo;
  if (formData.faqs) destination.faqs = formData.faqs;
  if (formData.status) destination.status = formData.status;
  if (formData.isFeatured !== undefined) destination.isFeatured = formData.isFeatured;
  if (formData.sortOrder !== undefined) destination.sortOrder = formData.sortOrder;

  destination.updatedBy = session.user.id as any;
  await destination.save();

  await AuditService.log({
    userId: session.user.id,
    userEmail: session.user.email || "admin",
    action: "UPDATE",
    entityType: "Destination",
    entityId: destination._id.toString(),
    entitySlug: destination.slug,
    oldValue,
    newValue: { name: destination.name, status: destination.status },
  });

  revalidatePath("/admin/content/destinations");
  revalidatePath(`/destinations/${destination.slug}`);

  return { success: true, id: destination._id.toString() };
}

export async function publishDestination(id: string) {
  const session = await requirePermission(Permission.DESTINATION_PUBLISH);
  await connectDB();

  const destination = await DestinationModel.findById(id);
  if (!destination) throw new Error("Destination not found.");

  destination.status = "PUBLISHED";
  destination.publishedAt = new Date();
  destination.updatedBy = session.user.id as any;
  await destination.save();

  await AuditService.log({
    userId: session.user.id,
    userEmail: session.user.email || "admin",
    action: "PUBLISH",
    entityType: "Destination",
    entityId: destination._id.toString(),
    entitySlug: destination.slug,
  });

  revalidatePath("/admin/content/destinations");
  revalidatePath(`/destinations/${destination.slug}`);

  return { success: true };
}

export async function deleteDestination(id: string) {
  const session = await requirePermission(Permission.DESTINATION_DELETE);
  await connectDB();

  const destination = await DestinationModel.findById(id);
  if (!destination) throw new Error("Destination not found.");

  await DestinationModel.deleteOne({ _id: id });

  await AuditService.log({
    userId: session.user.id,
    userEmail: session.user.email || "admin",
    action: "DELETE",
    entityType: "Destination",
    entityId: id,
    entitySlug: destination.slug,
  });

  revalidatePath("/admin/content/destinations");
  return { success: true };
}
