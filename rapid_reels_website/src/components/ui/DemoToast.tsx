"use client";

import { useState } from "react";
import { Button } from "./Button";

export function DemoToastButton({
  label = "Continue (static demo)",
  href,
}: {
  label?: string;
  href?: string;
}) {
  const [show, setShow] = useState(false);

  if (href) {
    return <Button href={href}>{label}</Button>;
  }

  return (
    <>
      <Button
        type="button"
        onClick={() => {
          setShow(true);
          window.setTimeout(() => setShow(false), 2200);
        }}
      >
        {label}
      </Button>
      {show ? (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-2xl border border-[var(--rr-outline)] bg-[var(--rr-surface-elevated)] px-4 py-3 text-sm text-[var(--rr-text)] shadow-xl animate-[fadeUp_0.3s_ease]">
          Static demo — no backend yet.
        </div>
      ) : null}
    </>
  );
}
