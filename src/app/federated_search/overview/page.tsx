"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const OverviewRedirect = () => {
  const router = useRouter();

  useEffect(() => {
    router.replace("/federated_search");
  }, [router]);

  return null;
};

export default OverviewRedirect;
