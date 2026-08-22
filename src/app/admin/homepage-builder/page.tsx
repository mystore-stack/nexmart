"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomepageBuilderPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the new Homepage CMS
    router.replace("/admin/cms/homepage");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <p className="text-muted-foreground">Redirecting to Homepage CMS...</p>
      </div>
    </div>
  );
}
