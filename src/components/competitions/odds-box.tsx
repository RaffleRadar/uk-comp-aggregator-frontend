import { InfoTooltip } from "@/components/ui/info-tooltip";

interface OddsBoxProps {
  label: string;
  tooltip: string;
  value: string;
  valueClassName: string;
}

export function OddsBox({
  label,
  tooltip,
  value,
  valueClassName,
}: OddsBoxProps) {
  return (
    <div className="rounded-lg border border-rr-border bg-rr-elevated px-4 py-3 text-center">
      <p className="flex items-center justify-center gap-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-rr-muted">
        <span>{label}</span>
        <InfoTooltip text={tooltip} />
      </p>
      <p
        className={`mt-1.5 whitespace-nowrap text-[clamp(1.75rem,8vw,2.5rem)] font-semibold leading-none tabular-nums md:text-3xl ${valueClassName}`}
      >
        {value}
      </p>
    </div>
  );
}
