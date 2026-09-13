import React from "react";
import { notFound } from "next/navigation";
import connectDB from "@/lib/db/mongoose";
import { DestinationModel } from "@/domains/destinations/destination.model";
import DestinationForm from "@/components/admin/DestinationForm";

export const dynamic = "force-dynamic";

interface EditDestinationPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditDestinationPage({
  params,
}: EditDestinationPageProps) {
  const { id } = await params;
  await connectDB();

  const destination = await DestinationModel.findById(id)
    .populate("coverImage")
    .lean();

  if (!destination) {
    notFound();
  }

  const initialData = {
    ...destination,
    _id: destination._id.toString(),
    coverImageUrl: (destination.coverImage as any)?.publicUrl,
  };

  return (
    <div className="space-y-6">
      <DestinationForm initialData={initialData} isEdit={true} />
    </div>
  );
}
