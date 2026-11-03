/**
 * Utility per la gestione e formattazione uniforme delle date in formato Italiano (giorno-mese-anno / GG/MM/AAAA)
 */

const MONTH_NAMES_IT = [
  'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
  'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
];

/**
 * Converte qualsiasi stringa data o oggetto Date in formato italiano compatto: GG/MM/AAAA
 * Esempi:
 * - "2026-09-12" -> "12/09/2026"
 * - "12/09/2026" -> "12/09/2026"
 * - "2026-09-12T14:30:00Z" -> "12/09/2026"
 */
export function formatDateToItalian(dateInput?: string | Date | null): string {
  if (!dateInput) return '';

  if (dateInput instanceof Date) {
    if (isNaN(dateInput.getTime())) return '';
    const day = String(dateInput.getDate()).padStart(2, '0');
    const month = String(dateInput.getMonth() + 1).padStart(2, '0');
    const year = dateInput.getFullYear();
    return `${day}/${month}/${year}`;
  }

  const str = String(dateInput).trim();
  if (!str) return '';

  // Se è già GG/MM/AAAA o GG-MM-AAAA
  const itMatch = str.match(/^(\d{1,2})[\/\.-](\d{1,2})[\/\.-](\d{4})/);
  if (itMatch) {
    const day = String(itMatch[1]).padStart(2, '0');
    const month = String(itMatch[2]).padStart(2, '0');
    const year = itMatch[3];
    return `${day}/${month}/${year}`;
  }

  // Se è AAAA-MM-GG
  const isoMatch = str.match(/^(\d{4})[\/\.-](\d{1,2})[\/\.-](\d{1,2})/);
  if (isoMatch) {
    const year = isoMatch[1];
    const month = String(isoMatch[2]).padStart(2, '0');
    const day = String(isoMatch[3]).padStart(2, '0');
    return `${day}/${month}/${year}`;
  }

  // Parsing generico tramite Date()
  const d = new Date(str);
  if (!isNaN(d.getTime())) {
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }

  return str;
}

/**
 * Converte qualsiasi data in formato ISO YYYY-MM-DD per l'assegnazione a input type="date"
 */
export function parseItalianDateToIso(dateInput?: string | null): string {
  if (!dateInput) return '';
  const str = String(dateInput).trim();
  if (!str) return '';

  // Se è già YYYY-MM-DD
  const isoMatch = str.match(/^(\d{4})[\/\.-](\d{1,2})[\/\.-](\d{1,2})/);
  if (isoMatch) {
    const year = isoMatch[1];
    const month = String(isoMatch[2]).padStart(2, '0');
    const day = String(isoMatch[3]).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Se è GG/MM/AAAA o GG-MM-AAAA
  const itMatch = str.match(/^(\d{1,2})[\/\.-](\d{1,2})[\/\.-](\d{4})/);
  if (itMatch) {
    const day = String(itMatch[1]).padStart(2, '0');
    const month = String(itMatch[2]).padStart(2, '0');
    const year = itMatch[3];
    return `${year}-${month}-${day}`;
  }

  const d = new Date(str);
  if (!isNaN(d.getTime())) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  return str;
}

/**
 * Formatta la data in esteso in italiano: es. "12 Settembre 2026"
 */
export function formatDateToItalianLong(dateInput?: string | Date | null): string {
  if (!dateInput) return '';
  
  const comp = formatDateToItalian(dateInput);
  if (!comp || !comp.includes('/')) return String(dateInput);

  const parts = comp.split('/');
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const monthIdx = parseInt(parts[1], 10) - 1;
    const year = parts[2];

    if (monthIdx >= 0 && monthIdx < 12) {
      return `${day} ${MONTH_NAMES_IT[monthIdx]} ${year}`;
    }
  }

  return comp;
}

/**
 * Restituisce una stringa data leggibile garantendo sempre il formato giorno-mese-anno
 */
export function ensureItalianDateFormat(dateStr?: string | null, defaultFallback: string = '12/09/2026'): string {
  const formatted = formatDateToItalian(dateStr);
  return formatted || defaultFallback;
}
