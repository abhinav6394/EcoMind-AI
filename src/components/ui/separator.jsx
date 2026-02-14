import { cn } from "@/lib/utils";

const Separator = ({ className }) => {
  return (
    <div
      className={cn(
        " w-full bg-linear-to-r from-transparent via-neutral-300 to-transparent dark:via-neutral-700 h-1",
        className
      )}
    />
  );
};

export { Separator };