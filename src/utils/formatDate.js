// src/utils/formatDate.js

/**
 * Converte uma data ISO (UTC) para string no formato "dd/MM/yyyy" no horário local,
 * evitando que o dia anterior apareça por causa do fuso horário.
 *
 * @param {string | Date} dateInput - String ISO (ex: "2025-09-23T00:00:00.000Z") ou objeto Date
 * @returns {string} - Data formatada "dd/MM/yyyy"
 */
export function formatDateToBrazil(dateInput) {
  if (!dateInput) return 'N/A';

  let year, month, day;

  if (typeof dateInput === 'string') {
    // Pega só a parte da data "YYYY-MM-DD"
    const datePart = dateInput.split('T')[0];
    [year, month, day] = datePart.split('-').map(Number);
  } else if (dateInput instanceof Date) {
    year = dateInput.getFullYear();
    month = dateInput.getMonth() + 1;
    day = dateInput.getDate();
  } else {
    return 'N/A';
  }

  // Cria um Date no horário local, evitando subtração do fuso
  const localDate = new Date(year, month - 1, day);

  const dd = String(localDate.getDate()).padStart(2, '0');
  const mm = String(localDate.getMonth() + 1).padStart(2, '0');
  const yyyy = localDate.getFullYear();

  return `${dd}/${mm}/${yyyy}`;
}
