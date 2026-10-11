export const COMMISSION_RATES = { plus: 120, aksesuar: 100, bakim: 250 };
export const SALE_LABELS = { plus: 'Plus', aksesuar: 'Aksesuar', bakim: 'Bakım' };
export function saleQuantity(service, type) {
    const value = service[`${type}Quantity`];
    if (value == null) return service[type] ? 1 : 0;
    return Number.isSafeInteger(value) && value >= 0 ? value : 0;
}
export function saleUpdates(type, quantity) {
    if (!Object.hasOwn(COMMISSION_RATES, type) || !Number.isSafeInteger(quantity) || quantity < 0) throw new Error('Geçersiz satış adedi');
    return { [type]: quantity > 0, [`${type}Quantity`]: quantity };
}
export function serviceCommission(service) {
    return Object.keys(COMMISSION_RATES).reduce((sum, type) => sum + saleQuantity(service, type) * COMMISSION_RATES[type], 0);
}
export function commissionStats(data) {
    const stats = { done: 0, cancelled: 0, postponed: 0, pending: 0, totalPrime: 0, pendingPrime: 0, sales: 0, bakims: 0, quantities: { plus: 0, aksesuar: 0, bakim: 0 } };
    for (const service of data) {
        const amount = serviceCommission(service);
        if (service.status === 'done') {
            stats.done++;
            stats.totalPrime += amount;
            if (amount > 0) stats.sales++;
            if (saleQuantity(service, 'bakim') > 0) stats.bakims++;
            for (const type of Object.keys(COMMISSION_RATES)) stats.quantities[type] += saleQuantity(service, type);
        } else if (service.status === 'cancelled') stats.cancelled++;
        else {
            stats.pending++;
            if (service.status === 'postponed') stats.postponed++;
            stats.pendingPrime += amount;
        }
    }
    const total = data.length;
    return { ...stats, prime: stats.totalPrime, saleRate: stats.done ? Math.round(stats.sales / stats.done * 100) : 0, avgPrime: stats.done ? Math.round(stats.totalPrime / stats.done) : 0, cancelRate: total ? Math.round(stats.cancelled / total * 100) : 0, bakimRate: stats.done ? Math.round(stats.bakims / stats.done * 100) : 0 };
}
