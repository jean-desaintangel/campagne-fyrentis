/**
 * utils.js — Échappement HTML/attributs (protection anti-XSS).
 * À utiliser pour TOUTE donnée issue des JSON injectée via innerHTML :
 * escapeHTML() pour le contenu des balises, escapeAttr() pour les attributs.
 * @author  Jean
 * @since   2026-07
 */
export function escapeHTML(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function escapeAttr(str) {
  return String(str).replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
