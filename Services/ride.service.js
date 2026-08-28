module.exports.getFare = async ({ pickup, destination }) => {
    if (!pickup || !destination) {
        throw new Error('Pickup and destination required');
    }

    const pickupValue = pickup
        .split('')
        .reduce((sum, char) => sum + char.charCodeAt(0), 0);

    const destinationValue = destination
        .split('')
        .reduce((sum, char) => sum + char.charCodeAt(0), 0);

    const distance = Math.abs(pickupValue - destinationValue) % 30 + 5;

    const fare = {
        toto: Math.round(20 + distance * 8),
        bike: Math.round(30 + distance * 10),
        car: Math.round(50 + distance * 15),
    };

    return { distance, fare };
};