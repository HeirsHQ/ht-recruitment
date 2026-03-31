import * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "focus-visible:border-primary-400 flex field-sizing-content min-h-20 w-full resize-none rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none placeholder:text-gray-400 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-red-500 md:text-sm",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
