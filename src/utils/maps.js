export const getMapsSearchUrl = (address) => {
    // Use dir API with My Location as start
    return `https://www.google.com/maps/dir/?api=1&origin=My+Location&destination=${encodeURIComponent(address)}&travelmode=driving`;
};

export const getMapsRouteUrl = (addresses) => {
    if (!addresses || addresses.length === 0) return '';

    const lastAddress = encodeURIComponent(addresses[addresses.length - 1]);
    const waypoints = addresses.slice(0, -1)
        .map(addr => encodeURIComponent(addr))
        .join('|');

    return `https://www.google.com/maps/dir/?api=1&origin=My+Location&destination=${lastAddress}&waypoints=${waypoints}&travelmode=driving`;
};
