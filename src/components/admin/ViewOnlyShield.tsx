"use client";

import { useEffect } from "react";

// UI layer for view-only admins: disables controls that would create,
// change or delete data, so they aren't offered buttons that can only fail.
//
// This is a best-effort convenience, matched on button text/labels and
// icon names — it is NOT the security boundary. Every API route and server
// action checks the admin's permission server-side and returns 403 for
// view-only admins regardless of what the UI shows.
const MUTATING_TEXT =
  /^\s*(\+\s*)?(add|new|create|edit|delete|remove|save|approve|reject|upload|publish|unpublish|send|sync|import|update|submit|resolve|verify|unverify|activate|deactivate|rematch|restore)\b/i;
const MUTATING_ICONS = [
  "lucide-trash",
  "lucide-pencil",
  "lucide-square-pen",
  "lucide-edit",
  "lucide-plus",
  "lucide-send",
  "lucide-upload",
  "lucide-check-circle",
  "lucide-circle-check",
  "lucide-x-circle",
  "lucide-circle-x",
];
const SAFE_TEXT = /^\s*(view|close|cancel|download|preview|refresh|export|next|prev|search|back|details?)\b/i;

function isMutating(btn: HTMLButtonElement): boolean {
  const label = [btn.textContent, btn.getAttribute("title"), btn.getAttribute("aria-label")]
    .filter(Boolean)
    .join(" ")
    .trim();
  if (label && SAFE_TEXT.test(label)) return false;
  if (label && MUTATING_TEXT.test(label)) return true;
  const svg = btn.querySelector("svg");
  const cls = svg?.getAttribute("class") ?? "";
  return !label.replace(/\s+/g, "") && MUTATING_ICONS.some((i) => cls.includes(i));
}

export function ViewOnlyShield() {
  useEffect(() => {
    const apply = () => {
      document.querySelectorAll<HTMLButtonElement>("main button, [role='dialog'] button").forEach((btn) => {
        if (btn.dataset.viewOnly === "1" || btn.closest("[data-sidebar]")) return;
        if (isMutating(btn)) {
          btn.disabled = true;
          btn.dataset.viewOnly = "1";
          btn.title = "View-only access";
          btn.classList.add("opacity-50", "cursor-not-allowed");
        }
      });
    };
    apply();
    const obs = new MutationObserver(apply);
    obs.observe(document.body, { childList: true, subtree: true });
    return () => obs.disconnect();
  }, []);

  return null;
}
