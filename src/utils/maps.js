export const getMapsSearchUrl = (address) => {
    const fullAddress = `${address}, Avcılar, İstanbul`;
    return `https://www.google.com/maps/dir/?api=1&origin=My+Location&destination=${encodeURIComponent(fullAddress)}&travelmode=driving`;
};

export const getMapsRouteUrl = (addresses) => {
    if (!addresses || addresses.length === 0) return '';

    const lastAddress = encodeURIComponent(addresses[addresses.length - 1]);
    const waypoints = addresses.slice(0, -1)
        .map(addr => encodeURIComponent(addr))
        .join('|');

    return `https://www.google.com/maps/dir/?api=1&origin=My+Location&destination=${lastAddress}&waypoints=${waypoints}&travelmode=driving`;
};
