"use client";
// Reusable station select dropdown. Stations are static reference data —
// no fetch needed (NO backend, NO API).
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { STATIONS } from "@/lib/stations-data";

export function StationSelect({
  value,
  onChange,
  placeholder = "Select a station",
  autoFocus,
}: {
  value?: string;
  onChange: (id: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}) {
  return (
    <Select value={value ?? ""} onValueChange={onChange}>
      <SelectTrigger autoFocus={autoFocus}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="max-h-72">
        {STATIONS.map((s) => (
          <SelectItem key={s.id} value={s.id}>
            <span className="text-xs text-muted-foreground">{s.code}</span>
            <span className="ml-2">{s.name}</span>
            <span className="ml-2 text-xs text-muted-foreground">{s.city}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
