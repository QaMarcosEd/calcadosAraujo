/**
 * Formata um número de telefone no padrão (99) 99999-9999
 * @param {string} value - Valor bruto do input
 * @returns {string} - Valor formatado
 */
export function formatPhoneNumber(value) {
  if (!value) return '';
  // Remove tudo que não é dígito
  const cleaned = value.replace(/\D/g, '');
  // Aplica a máscara: (99) 99999-9999
  const match = cleaned.match(/^(\d{0,2})(\d{0,5})(\d{0,4})$/);
  if (match) {
    return !match[2]
      ? match[1]
      : `(${match[1]})${match[2] ? ` ${match[2]}` : ''}${match[3] ? `-${match[3]}` : ''}`;
  }
  return value;
}