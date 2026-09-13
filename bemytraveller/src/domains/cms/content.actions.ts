"use server";

import { revalidatePath } from "next/cache";
import connectDB from "@/lib/db/mongoose";
import { BlogModel } from "./blog.model";
import { TravelGuideModel } from "./travel-guide.model";
import { FAQModel } from "./faq.model";
import { ReviewModel } from "./review.model";
import { RedirectModel } from "@/domains/seo/redirect.model";
import { requirePermission } from "@/lib/auth/authorize";
import { Permission } from "@/lib/auth/permissions";
import { slugify } from "@/lib/utils";

// ── BLOG ACTIONS ─────────────────────────────────────────────

export async function createBlog(formData: any) {
  const session = await requirePermission(Permission.CONTENT_CREATE);
  await connectDB();

  const slug = formData.slug ? slugify(formData.slug) : slugify(formData.title);

  const blog = await BlogModel.create({
    ...formData,
    slug,
    author: session.user.id,
    createdBy: session.user.id,
  });

  revalidatePath("/admin/content/blogs");
  revalidatePath("/blog");
  return { success: true, id: blog._id.toString() };
}

export async function updateBlog(id: string, formData: any) {
  await requirePermission(Permission.CONTENT_EDIT);
  await connectDB();

  await BlogModel.findByIdAndUpdate(id, formData);
  revalidatePath("/admin/content/blogs");
  revalidatePath("/blog");
  return { success: true };
}

export async function deleteBlog(id: string) {
  await requirePermission(Permission.CONTENT_DELETE);
  await connectDB();

  await BlogModel.findByIdAndDelete(id);
  revalidatePath("/admin/content/blogs");
  return { success: true };
}

// ── FAQ ACTIONS ──────────────────────────────────────────────

export async function createFAQ(data: { question: string; answer: string; category: string }) {
  const session = await requirePermission(Permission.CONTENT_CREATE);
  await connectDB();

  const faq = await FAQModel.create({
    ...data,
    createdBy: session.user.id,
  });

  revalidatePath("/admin/content/faqs");
  revalidatePath("/faq");
  return { success: true, id: faq._id.toString() };
}

export async function deleteFAQ(id: string) {
  await requirePermission(Permission.CONTENT_DELETE);
  await connectDB();

  await FAQModel.findByIdAndDelete(id);
  revalidatePath("/admin/content/faqs");
  return { success: true };
}

// ── REVIEW ACTIONS ───────────────────────────────────────────

export async function toggleReviewPublish(id: string, isPublished: boolean) {
  const session = await requirePermission(Permission.CONTENT_PUBLISH);
  await connectDB();

  await ReviewModel.findByIdAndUpdate(id, {
    isPublished,
    publishedAt: isPublished ? new Date() : undefined,
    verifiedBy: isPublished ? session.user.id : undefined,
  });

  revalidatePath("/admin/content/reviews");
  return { success: true };
}

export async function replyToReview(id: string, content: string) {
  const session = await requirePermission(Permission.CONTENT_EDIT);
  await connectDB();

  await ReviewModel.findByIdAndUpdate(id, {
    adminResponse: {
      content,
      respondedBy: session.user.id,
      respondedAt: new Date(),
    },
  });

  revalidatePath("/admin/content/reviews");
  return { success: true };
}

// ── REDIRECT ACTIONS ─────────────────────────────────────────

export async function createRedirect(data: { fromPath: string; toPath: string; statusCode: 301 | 302; reason?: string }) {
  const session = await requirePermission(Permission.REDIRECT_MANAGE);
  await connectDB();

  let fromPath = data.fromPath.trim();
  if (!fromPath.startsWith("/")) fromPath = "/" + fromPath;

  let toPath = data.toPath.trim();
  if (!toPath.startsWith("/") && !toPath.startsWith("http")) toPath = "/" + toPath;

  const redirect = await RedirectModel.create({
    fromPath: fromPath.toLowerCase(),
    toPath,
    statusCode: data.statusCode || 301,
    reason: data.reason,
    createdBy: session.user.id,
  });

  revalidatePath("/admin/seo/redirects");
  return { success: true, id: redirect._id.toString() };
}

export async function deleteRedirect(id: string) {
  await requirePermission(Permission.REDIRECT_MANAGE);
  await connectDB();

  await RedirectModel.findByIdAndDelete(id);
  revalidatePath("/admin/seo/redirects");
  return { success: true };
}
