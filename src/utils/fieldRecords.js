// Remove retired commercial fields without touching service types or technician notes.
const retired = new Set(['plus','aksesuar','bakim','plusQuantity','aksesuarQuantity','bakimQuantity','prime','totalPrime','pendingPrime','saleRate','avgPrime']);
export const fieldRecord = record => Object.fromEntries(Object.entries(record).filter(([key]) => !retired.has(key)));
export const fieldState = state => ({...state,services:(state.services || []).map(fieldRecord),archive:(state.archive || []).map(fieldRecord)});
