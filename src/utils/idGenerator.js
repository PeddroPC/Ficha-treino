/**
 * Gera um identificador único (UUID v4) para as entidades do sistema.
 * Utiliza crypto.randomUUID() nativo quando disponível.
 * Fallback para pseudo-random (v4 compliant) em ambientes sem suporte.
 * 
 * Se fornecido um prefixo (opcional), retorna `${prefix}-${uuid}`.
 * Como o banco de dados Supabase foi modelado com PRIMARY KEY do tipo TEXT,
 * ele suporta tanto UUIDs puros quanto com prefixos.
 * O prefixo facilita o debug no LocalStorage.
 * 
 * @param {string} [prefix] - Opcional. Prefixo para o ID (ex: 'sheet', 'log')
 * @returns {string} Identificador único
 */
export function generateId(prefix = '') {
  let uuid;
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    uuid = crypto.randomUUID();
  } else {
    // Fallback para UUID v4
    uuid = '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, c =>
      (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
  }
  
  return prefix ? `${prefix}-${uuid}` : uuid;
}
