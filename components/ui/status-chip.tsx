import { cn } from "@/lib/utils";

export function StatusChip({
  label,
  tone = "neutral",
  className,
}: {
  label: string;
  tone?: "neutral" | "success" | "warning" | "danger" | "info";
  className?: string;
}) {
  const tones = {
    neutral: "bg-[#EEF1F4] text-[#4b5563]",
    success: "bg-[#E9F7F0] text-[#237a4e]",
    warning: "bg-[#FFF6D8] text-[#8a6d00]",
    danger: "bg-[#FDECEA] text-[#c22a25]",
    info: "bg-[#E7EFF4] text-[#3d6a82]",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold",
        tones[tone],
        className,
      )}
    >
      {label}
    </span>
  );
}
