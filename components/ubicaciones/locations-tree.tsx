"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ChevronDown, ChevronRight, Plus } from "lucide-react";

import {
  createCity,
  createCountry,
  createDistrict,
  toggleLocation,
} from "@/actions/admin";
import { Button } from "@/components/ui/button";

type District = { id: string; name: string; isActive: boolean };
type City = {
  id: string;
  name: string;
  isActive: boolean;
  districts: District[];
};
type Country = {
  id: string;
  name: string;
  isActive: boolean;
  cities: City[];
};

function Toggle({
  active,
  onToggle,
  disabled,
}: {
  active: boolean;
  onToggle: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onToggle}
      className="relative h-6 w-10 shrink-0 rounded-full transition"
      style={{ background: active ? "#8FB6CF" : "#D8E3EB" }}
    >
      <span
        className="absolute top-[3px] h-[18px] w-[18px] rounded-full bg-white shadow"
        style={{ left: active ? 19 : 3 }}
      />
    </button>
  );
}

function InlineAdd({
  placeholder,
  onAdd,
  disabled,
}: {
  placeholder: string;
  onAdd: (name: string) => Promise<void>;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (!open) {
    return (
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
      >
        <Plus size={14} />
        Agregar
      </button>
    );
  }

  return (
    <form
      className="flex flex-wrap items-center gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        if (!name.trim()) return;
        startTransition(async () => {
          try {
            await onAdd(name.trim());
            setName("");
            setOpen(false);
            setError(null);
          } catch (err) {
            setError(err instanceof Error ? err.message : "Error");
          }
        });
      }}
    >
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={placeholder}
        className="rounded-full border border-input bg-background px-3 py-1.5 text-xs outline-none"
        autoFocus
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-white"
      >
        Guardar
      </button>
      <button
        type="button"
        onClick={() => {
          setOpen(false);
          setName("");
          setError(null);
        }}
        className="text-xs text-muted-foreground"
      >
        Cancelar
      </button>
      {error ? <span className="text-xs text-destructive">{error}</span> : null}
    </form>
  );
}

export function LocationsTree({ initial }: { initial: Country[] }) {
  const router = useRouter();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [pending, startTransition] = useTransition();
  const [countryName, setCountryName] = useState("");
  const [topError, setTopError] = useState<string | null>(null);

  function toggleExpand(key: string) {
    setExpanded((s) => ({ ...s, [key]: !s[key] }));
  }

  function setActive(
    level: "country" | "city" | "district",
    id: string,
    isActive: boolean,
  ) {
    startTransition(async () => {
      await toggleLocation(level, id, isActive);
      router.refresh();
    });
  }

  async function addAndRefresh(
    action: () => Promise<{ error: { message: string } | null }>,
  ) {
    const res = await action();
    if (res.error) throw new Error(res.error.message);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4">
      <form
        className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-background p-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (!countryName.trim()) return;
          startTransition(async () => {
            const res = await createCountry(countryName.trim());
            if (res.error) {
              setTopError(res.error.message);
              return;
            }
            setCountryName("");
            setTopError(null);
            router.refresh();
          });
        }}
      >
        <div className="text-sm font-semibold">Nuevo país</div>
        <input
          value={countryName}
          onChange={(e) => setCountryName(e.target.value)}
          placeholder="Ej. España, México…"
          className="min-w-[200px] flex-1 rounded-full border border-input bg-white px-4 py-2 text-sm outline-none"
        />
        <Button type="submit" disabled={pending}>
          Agregar país
        </Button>
        {topError ? (
          <span className="w-full text-sm text-destructive">{topError}</span>
        ) : null}
      </form>

      <div className="flex flex-col gap-2">
        {initial.map((country) => {
          const countryOpen = expanded[country.id] ?? true;
          return (
            <div
              key={country.id}
              className="rounded-2xl border border-border bg-white"
            >
              <div className="flex items-center gap-3 px-4 py-3">
                <button type="button" onClick={() => toggleExpand(country.id)}>
                  {countryOpen ? (
                    <ChevronDown size={16} />
                  ) : (
                    <ChevronRight size={16} />
                  )}
                </button>
                <div className="flex-1 font-bold">{country.name}</div>
                <InlineAdd
                  placeholder="Nueva ciudad / provincia"
                  disabled={pending}
                  onAdd={(name) =>
                    addAndRefresh(() => createCity(country.id, name))
                  }
                />
                <Toggle
                  active={country.isActive}
                  disabled={pending}
                  onToggle={() =>
                    setActive("country", country.id, !country.isActive)
                  }
                />
              </div>
              {countryOpen
                ? country.cities.map((city) => {
                    const cityKey = `${country.id}:${city.id}`;
                    const cityOpen = expanded[cityKey] ?? false;
                    return (
                      <div key={city.id} className="border-t border-background">
                        <div className="flex items-center gap-3 py-2.5 pl-10 pr-4">
                          <button
                            type="button"
                            onClick={() => toggleExpand(cityKey)}
                          >
                            {cityOpen ? (
                              <ChevronDown size={16} />
                            ) : (
                              <ChevronRight size={16} />
                            )}
                          </button>
                          <div className="flex-1 text-sm font-semibold">
                            {city.name}
                          </div>
                          <InlineAdd
                            placeholder="Nuevo barrio / distrito"
                            disabled={pending}
                            onAdd={(name) =>
                              addAndRefresh(() => createDistrict(city.id, name))
                            }
                          />
                          <Toggle
                            active={city.isActive}
                            disabled={pending}
                            onToggle={() =>
                              setActive("city", city.id, !city.isActive)
                            }
                          />
                        </div>
                        {cityOpen
                          ? city.districts.map((d) => (
                              <div
                                key={d.id}
                                className="flex items-center gap-3 py-2 pl-16 pr-4 text-sm"
                              >
                                <div className="flex-1 text-[#374151]">
                                  {d.name}
                                </div>
                                <Toggle
                                  active={d.isActive}
                                  disabled={pending}
                                  onToggle={() =>
                                    setActive("district", d.id, !d.isActive)
                                  }
                                />
                              </div>
                            ))
                          : null}
                      </div>
                    );
                  })
                : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
