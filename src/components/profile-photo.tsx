"use client";

import React, { useEffect, useRef, useState } from "react";

export const PHOTO_CHANGED_EVENT = "acessa:photo-changed";
const SIZE = 512;
const MAX_ORIGINAL_BYTES = 15 * 1024 * 1024;
const MAX_UPLOAD_BYTES = 1024 * 1024;

export function initials(name: string) {
  const letters = name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "");
  return letters.join("") || "AV";
}

/**
 * A person's photo or, without one, their initials (OPEN-101). The image is decorative (alt="") because the name is
 * always written next to it; if it fails to load (no photo), the initials stay.
 */
export function PersonAvatar({ name, src, className = "person-avatar" }: { name: string; src: string | null; className?: string }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);
  return <span className={className} aria-hidden="true">
    {/* A plain <img>: photos are private and next/image's optimizer would fetch them without the session cookie. */}
    {/* eslint-disable-next-line @next/next/no-img-element */}
    {src && !failed ? <img src={src} alt="" onError={() => setFailed(true)} /> : initials(name)}
  </span>;
}

/** The signed-in person's avatar in the top bar; refreshes when the photo changes on the profile page. */
export function AccountAvatar({ name, withPhoto }: { name: string; withPhoto: boolean }) {
  const [version, setVersion] = useState(0);
  useEffect(() => {
    const refresh = () => setVersion((value) => value + 1);
    window.addEventListener(PHOTO_CHANGED_EVENT, refresh);
    return () => window.removeEventListener(PHOTO_CHANGED_EVENT, refresh);
  }, []);
  return <PersonAvatar name={name} className="company-avatar" src={withPhoto ? `/api/conta/foto?v=${version}` : null} />;
}

/** Crops the centre square and scales it to 512 px JPEG in the browser; null when the browser cannot draw it. */
async function toSquareJpeg(file: File): Promise<Blob | null> {
  if (typeof document === "undefined" || typeof URL.createObjectURL !== "function") return null;
  const url = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const element = new Image();
      element.onload = () => resolve(element);
      element.onerror = () => reject(new Error("unreadable"));
      element.src = url;
    });
    const side = Math.min(image.naturalWidth, image.naturalHeight);
    if (!side) return null;
    const canvas = document.createElement("canvas");
    canvas.width = SIZE; canvas.height = SIZE;
    const context = canvas.getContext("2d");
    if (!context) return null;
    context.drawImage(image, (image.naturalWidth - side) / 2, (image.naturalHeight - side) / 2, side, side, 0, 0, SIZE, SIZE);
    return await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.86));
  } catch {
    return null;
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Choose, replace or remove the profile photo (candidate profile page and recruiter account page). */
export default function ProfilePhotoEditor({ name, note }: { name: string; note: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [version, setVersion] = useState(0);
  const [hasPhoto, setHasPhoto] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    fetch("/api/conta/foto", { method: "HEAD" }).then((response) => { if (active) setHasPhoto(response.ok); }).catch(() => { if (active) setHasPhoto(false); });
    return () => { active = false; };
  }, [version]);

  function changed(text: string) {
    setMessage(text);
    setVersion((value) => value + 1);
    window.dispatchEvent(new Event(PHOTO_CHANGED_EVENT));
  }

  async function upload(file: File) {
    setError(""); setMessage("");
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) { setError("Use uma imagem JPG, PNG ou WebP."); return; }
    if (file.size > MAX_ORIGINAL_BYTES) { setError("A imagem é muito grande. Escolha uma de até 15 MB."); return; }
    setBusy(true);
    try {
      const prepared = await toSquareJpeg(file) ?? (file.size <= MAX_UPLOAD_BYTES ? file : null);
      if (!prepared) { setError("Não foi possível preparar a imagem. Escolha outra, de até 1 MB."); return; }
      const body = new FormData();
      body.append("photo", prepared, "foto.jpg");
      const response = await fetch("/api/conta/foto", { method: "POST", body });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) { setError(result.message || "Não foi possível enviar a foto."); return; }
      changed("Foto atualizada.");
    } catch {
      setError("Não foi possível conectar ao serviço. Tente novamente.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function remove() {
    if (!window.confirm("Remover a sua foto de perfil?")) return;
    setBusy(true); setError(""); setMessage("");
    try {
      const response = await fetch("/api/conta/foto", { method: "DELETE" });
      if (!response.ok) { setError("Não foi possível remover a foto."); return; }
      changed("Foto removida.");
    } catch {
      setError("Não foi possível conectar ao serviço. Tente novamente.");
    } finally { setBusy(false); }
  }

  return <section className="profile-section profile-photo" aria-labelledby="profile-photo-title">
    <h2 id="profile-photo-title">Foto de perfil</h2>
    <div className="profile-photo-row">
      <PersonAvatar name={name} className="profile-photo-preview" src={hasPhoto ? `/api/conta/foto?v=${version}` : null} />
      <div className="profile-photo-controls">
        <p className="muted">{note}</p>
        <input ref={inputRef} id="profile-photo-input" type="file" accept="image/jpeg,image/png,image/webp" hidden
          onChange={(event) => { const file = event.target.files?.[0]; if (file) void upload(file); }} />
        <div className="apply-actions">
          <button type="button" className="secondary-button" onClick={() => inputRef.current?.click()} disabled={busy}>
            {busy ? "Enviando…" : hasPhoto ? "Trocar foto" : "Escolher foto"}
          </button>
          {hasPhoto ? <button type="button" className="secondary-button" onClick={() => void remove()} disabled={busy}>Remover foto</button> : null}
        </div>
        <p className="muted">JPG, PNG ou WebP. A imagem é cortada em quadrado, a partir do centro.</p>
        {message ? <p className="form-success" role="status">{message}</p> : null}
        {error ? <p className="form-error" role="alert">{error}</p> : null}
      </div>
    </div>
  </section>;
}
