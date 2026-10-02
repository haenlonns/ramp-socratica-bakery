"use client";

import { useEffect, useState } from "react";

/**
 * Dev-only slider panel. Each control writes a CSS custom property that the
 * stylesheet already reads, with the tuned value as its fallback.
 */

export type SliderControl = {
  /** CSS custom property, without the leading `--`. */
  prop: string;
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  /** Appended to the value when writing the property. */
  unit?: string;
};

export function StoreSliders({ title, controls }: { title: string; controls: SliderControl[] }) {
  const [values, setValues] = useState<Record<string, number>>(
    () => Object.fromEntries(controls.map((c) => [c.prop, c.value])),
  );

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    const root = document.documentElement.style;
    for (const control of controls) {
      root.setProperty(`--${control.prop}`, `${values[control.prop]}${control.unit ?? ""}`);
    }
  }, [values, controls]);

  if (process.env.NODE_ENV !== "development") return null;

  const css = controls
    .map((c) => `  --${c.prop}: ${values[c.prop]}${c.unit ?? ""};`)
    .join("\n");

  return (
    <div className="storeTuner">
      <h2>{title}</h2>
      {controls.map((control) => (
        <label key={control.prop}>
          <span>{control.label}</span>
          <input
            type="range"
            min={control.min}
            max={control.max}
            step={control.step}
            value={values[control.prop]}
            onChange={(event) =>
              setValues((current) => ({ ...current, [control.prop]: Number(event.target.value) }))
            }
          />
          <output>{values[control.prop]}{control.unit ?? ""}</output>
        </label>
      ))}
      <div className="storeTunerFoot">
        <button type="button" onClick={() => navigator.clipboard?.writeText(`:root {\n${css}\n}`).catch(() => {})}>
          Copy CSS
        </button>
        <button
          type="button"
          onClick={() => setValues(Object.fromEntries(controls.map((c) => [c.prop, c.value])))}
        >
          Reset
        </button>
      </div>
    </div>
  );
}
