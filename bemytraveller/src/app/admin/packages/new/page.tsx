"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NewPackageRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/packages");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[60vh] text-slate-400 text-xs">
      Redirecting to Package Management Studio...
    </div>
  );
}
