import { cn } from "@/lib/utils";

interface IconTextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon: string; // Material Symbols icon name, e.g. "mail", "lock"
  label: string;
}

export function IconTextField({
  icon,
  label,
  id,
  className,
  ...inputProps
}: IconTextFieldProps) {
  return (
    <div className="space-y-unit">
      <label
        htmlFor={id}
        className="ml-1 block text-label-lg text-on-surface-variant"
      >
        {label}
      </label>
      <div className="group relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-outline transition-colors group-focus-within:text-primary">
          <span className="material-symbols-outlined text-[20px]">
            {icon}
          </span>
        </div>
        <input
          id={id}
          className={cn(
            "w-full rounded-lg border border-outline-variant bg-white/50 py-3 pl-10 pr-4 text-body-md text-on-surface placeholder:text-outline-variant transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary",
            className,
          )}
          {...inputProps}
        />
      </div>
    </div>
  );
}
