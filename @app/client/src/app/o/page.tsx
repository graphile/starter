"use client";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

export default function O() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/");
  }, [router]);
  return <div>Redirecting...</div>;
}
