const mahalleOrder = [
    "GÜMÜŞPALA",
    "DENİZKÖŞKLER",
    "AMBARLI",
    "MERKEZ",
    "CİHANGİR"
];

const timeSlotOrder = ["10/12", "12/14", "14/16", "16/18"];

export const groupByMahalle = (services) => {
    // First, sort all services by TimeSlot
    const sortedServices = [...services].sort((a, b) => {
        const timeIndexA = timeSlotOrder.indexOf(a.timeSlot);
        const timeIndexB = timeSlotOrder.indexOf(b.timeSlot);
        return timeIndexA - timeIndexB;
    });

    const groups = sortedServices.reduce((acc, service) => {
        const key = service.mahalle.toUpperCase().trim();
        if (!acc[key]) acc[key] = [];
        acc[key].push(service);
        return acc;
    }, {});

    // Convert to array and sort groups based on mahalleOrder
    return Object.entries(groups)
        .map(([name, items]) => ({
            name,
            items
        }))
        .sort((a, b) => {
            const indexA = mahalleOrder.indexOf(a.name);
            const indexB = mahalleOrder.indexOf(b.name);

            // If neighborhood not in list, put at the end alphabetically
            if (indexA === -1 && indexB === -1) return a.name.localeCompare(b.name);
            if (indexA === -1) return 1;
            if (indexB === -1) return -1;
            return indexA - indexB;
        });
};
