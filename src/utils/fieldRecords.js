import { formatMahalle } from './profile.js';
// Remove retired commercial fields without touching service types or technician notes.
const retired = new Set(['plus','aksesuar','bakim','plusQuantity','aksesuarQuantity','bakimQuantity','prime','totalPrime','pendingPrime','saleRate','avgPrime']);
export const fieldRecord = record => {
    const cleaned = Object.fromEntries(Object.entries(record).filter(([key]) => !retired.has(key)));
    if (cleaned.mahalle) cleaned.mahalle = formatMahalle(cleaned.mahalle);
    // Retired status must not leave an existing receipt stuck outside planning.
    if (cleaned.status === 'waiting_parts') cleaned.status = 'pending';
    if (cleaned.statusBeforeDone === 'waiting_parts') cleaned.statusBeforeDone = 'pending';
    return cleaned;
};
export const fieldState = state => ({...state,services:(state.services || []).map(fieldRecord),archive:(state.archive || []).map(fieldRecord)});
