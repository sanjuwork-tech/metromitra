"use client";
// Reusable station select dropdown. Loads stations once, caches in TanStack Query.
import { useQuery } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiFetch } from "@/lib/api-fetch";

type StationOption = { id: string; code: string; name: string; city: string };

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
  const { data, isLoading } = useQuery({
    queryKey: ["stations", "all"],
    queryFn: () => apiFetch<StationOption[]>("/api/stations"),
  });

  return (
    <Select value={value ?? ""} onValueChange={onChange} disabled={isLoading}>
      <SelectTrigger autoFocus={autoFocus}>
        <SelectValue placeholder={isLoading ? "Loading stations…" : placeholder} />
      </SelectTrigger>
      <SelectContent className="max-h-72">
        {(data ?? []).map((s) => (
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
