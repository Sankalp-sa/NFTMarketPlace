const calculateTimeLeft = (endTime) => {
    const difference = new Date(Number(endTime) * 1000) - new Date();
    let timeLeft = {};

    if (difference > 0) {
        const totalSeconds = Math.floor(difference / 1000);
        timeLeft = {
            days: Math.floor(totalSeconds / (3600 * 24)),
            hours: Math.floor((totalSeconds % (3600 * 24)) / 3600),
            minutes: Math.floor((totalSeconds % 3600) / 60),
            seconds: Math.floor(totalSeconds % 60),
        };  
    }

    return timeLeft;
};

export { calculateTimeLeft };