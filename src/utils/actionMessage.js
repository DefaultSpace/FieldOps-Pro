export const firstReceipt = value => String(value || '').trim().split(/[\s,;]+/)[0] || '';
export function actionMessage(receipt, count, reason) {
    return [firstReceipt(receipt) || '—', count > 1 ? `${count} kaydı var` : '', String(reason || '').trim()].filter(Boolean).join(' ');
}
