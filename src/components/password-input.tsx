"use client";

import React, { useEffect, useRef, useState } from "react";

type Props = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> & {
  /** Accessible name of the eye button; pages with two password fields give each its own. */
  toggleLabel?: string;
};

/**
 * Password field with an eye button that shows or hides what was typed. The button is a toggle (aria-pressed) with a
 * fixed name, so screen readers announce "Mostrar senha, pressionado/não pressionado". The password is hidden again
 * when the form is sent, so it is not left on screen and password managers see a password field.
 */
export default function PasswordInput({ toggleLabel = "Mostrar senha", ...inputProps }: Props) {
  const [visible, setVisible] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const form = inputRef.current?.form;
    if (!form) return;
    const hide = () => setVisible(false);
    form.addEventListener("submit", hide);
    return () => form.removeEventListener("submit", hide);
  }, []);

  return <div className="password-field">
    <input {...inputProps} ref={inputRef} type={visible ? "text" : "password"} autoCapitalize="off" autoCorrect="off" spellCheck={false} />
    <button type="button" className="password-toggle" aria-label={toggleLabel} aria-pressed={visible}
      aria-controls={inputProps.id} onClick={() => setVisible((value) => !value)}>
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
        <circle cx="12" cy="12" r="3" />
        {visible ? <path d="M3 3l18 18" /> : null}
      </svg>
    </button>
  </div>;
}
