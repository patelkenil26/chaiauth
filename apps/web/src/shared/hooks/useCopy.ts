import { useState } from "react";
import { toast } from "sonner";

export function useCopy() {
  const [copied, setCopied] = useState<string>();

  const copy = async (value: string, label: string) => {
    await navigator.clipboard.writeText(value);
    setCopied(value);
    toast.success(`${label} copied`);
    window.setTimeout(() => setCopied(undefined), 1600);
  };

  return { copied, copy };
}
