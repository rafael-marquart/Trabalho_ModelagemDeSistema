"use client";

import React, { KeyboardEvent, ReactNode } from "react";

type Choice<T extends string> = { value: T; label: string };

/**
 * Single-choice group where every option is its own tab stop. Native radio groups only let Tab reach the
 * selected option (arrows move between the others), which users found confusing. Here Tab visits each
 * option, Space or Enter selects it, and the arrow keys also move the selection, as in a native group.
 */
export default function ChoiceGroup<T extends string>({
  legend, choices, value, onChange, disabled, describedBy, className, children
}: {
  legend: string; choices: Choice<T>[]; value: T | ""; onChange: (value: T) => void;
  disabled?: boolean; describedBy?: string; className?: string; children?: ReactNode;
}) {
  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const step = event.key === "ArrowDown" || event.key === "ArrowRight" ? 1
      : event.key === "ArrowUp" || event.key === "ArrowLeft" ? -1 : 0;
    if (!step) return;
    event.preventDefault();
    const next = (index + step + choices.length) % choices.length;
    onChange(choices[next].value);
    (event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>("[role=radio]")[next])?.focus();
  }
  return <fieldset className={className} role="radiogroup" aria-describedby={describedBy} disabled={disabled}>
    <legend>{legend}</legend>
    {children}
    {choices.map((choice, index) => {
      const checked = value === choice.value;
      return <button key={choice.value} type="button" role="radio" aria-checked={checked} className="choice-option"
        onClick={() => onChange(choice.value)} onKeyDown={event => onKeyDown(event, index)}>
        <span className="choice-indicator" aria-hidden="true" />{choice.label}
      </button>;
    })}
  </fieldset>;
}
