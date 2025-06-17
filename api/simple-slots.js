module.exports = (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');
    
    res.status(200).json({
        status: 'SUCCESS',
        message: 'Horarios API funcionando correctamente',
        data: [
            {
                time: '08:30 - 10:00',
                start: '08:30',
                end: '10:00',
                isBooked: false,
                duration: 90
            },
            {
                time: '10:00 - 11:30',
                start: '10:00',
                end: '11:30',
                isBooked: false,
                duration: 90
            },
            {
                time: '11:30 - 13:00',
                start: '11:30',
                end: '13:00',
                isBooked: false,
                duration: 90
            },
            {
                time: '14:00 - 15:30',
                start: '14:00',
                end: '15:30',
                isBooked: false,
                duration: 90
            },
            {
                time: '15:30 - 17:00',
                start: '15:30',
                end: '17:00',
                isBooked: false,
                duration: 90
            }
        ]
    });
};
