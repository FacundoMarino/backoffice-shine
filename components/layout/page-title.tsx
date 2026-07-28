"use client";

import { usePageTitle } from "@/components/layout/title-context";

export function PageTitle({ title }: { title: string }) {
  usePageTitle(title);
  return null;
}
