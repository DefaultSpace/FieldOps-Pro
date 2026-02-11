const MAHALLE_PRIORITY = [
    "GÜMÜŞPALA",
    "DENİZKÖŞKLER",
    "AMBARLI",
    "MERKEZ",
    "CİHANGİR"
];

const TIMESLOT_ORDER = ["10/12", "12/14", "14/16", "16/18"];

export const getActiveTimeSlot = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "10/12";
    if (hour < 14) return "12/14";
    if (hour < 16) return "14/16";
    if (hour < 18) return "16/18";
    return "16/18"; // After 18:00, still match last slot
};

export const calculatePriorityScore = (service) => {
    const activeSlot = getActiveTimeSlot();
    const activeIndex = TIMESLOT_ORDER.indexOf(activeSlot);
    const serviceIndex = TIMESLOT_ORDER.indexOf(service.timeSlot);

    let score = 0;

    // Time Priority
    if (serviceIndex === activeIndex) {
        score += 1000; // Active Slot
    } else if (serviceIndex < activeIndex) {
        score += 500;  // Delayed
    } else {
        // Future jobs get lower priority than delayed/active
        score += (100 - (serviceIndex - activeIndex) * 20);
    }

    // Neighborhood Priority
    const mahalleName = service.mahalle.toUpperCase().trim();
    const mahalleIndex = MAHALLE_PRIORITY.indexOf(mahalleName);
    if (mahalleIndex !== -1) {
        score += (MAHALLE_PRIORITY.length - mahalleIndex) * 10;
    }

    return score;
};

export const groupAndSortServices = (services) => {
    // Sort all services by priority score first
    const sorted = [...services].sort((a, b) => {
        // Handle Pending vs Done/Cancelled first
        if (a.status === 'pending' && b.status !== 'pending') return -1;
        if (a.status !== 'pending' && b.status === 'pending') return 1;

        // Sort by priority logic
        return calculatePriorityScore(b) - calculatePriorityScore(a);
    });

    return sorted;
};
