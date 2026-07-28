import { cn } from "@/lib/utils";

export function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-[18px] bg-card p-6 shadow-[0_1px_3px_rgba(17,24,39,0.06),0_1px_2px_rgba(17,24,39,0.04)]",
        className,
      )}
    >
      {children}
    </div>
  );
}
