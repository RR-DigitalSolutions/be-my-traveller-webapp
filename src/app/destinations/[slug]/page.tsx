import { permanentRedirect } from "next/navigation";
import { parseDestinationSlug } from "@/lib/destinations/slug-resolver";

interface LegacyDestinationPageProps {
  params: Promise<{ slug: string }>;
}

export default async function LegacyDestinationRedirectPage({ params }: LegacyDestinationPageProps) {
  const { slug } = await params;
  const parsed = parseDestinationSlug([slug]);
  
  // Permanent 308 redirect to SEO canonical hierarchical URL structure
  permanentRedirect(parsed.canonicalUrl);
}
