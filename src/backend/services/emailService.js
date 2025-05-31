const nodemailer = require('nodemailer');

// Configurar el transporter de correo
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'porongos84314@gmail.com',
        pass: process.env.EMAIL_PASSWORD
    }
});

// Función para enviar correo de confirmación
async function sendBookingConfirmation(booking) {
    const mailOptions = {
        from: 'porongos84314@gmail.com',
        to: booking.email, // Usar el email del cliente
        subject: 'Confirmación de Reserva - Extreme Wash',
        html: `
            <h1>¡Gracias por tu reserva!</h1>
            <p>Hola ${booking.clientName},</p>
            <p>Tu reserva ha sido confirmada con los siguientes detalles:</p>
            <ul>
                <li><strong>Fecha y hora:</strong> ${new Date(booking.date).toLocaleString()}</li>
                <li><strong>Servicio:</strong> ${booking.serviceType}</li>
                <li><strong>Vehículo:</strong> ${booking.vehicleType}</li>
                <li><strong>Patente:</strong> ${booking.vehiclePlate}</li>
                <li><strong>Precio:</strong> $${booking.price}</li>
            </ul>
            <p>Te esperamos en nuestro local. Si necesitas hacer algún cambio, contáctanos al WhatsApp: 098385709</p>
            <p>¡Gracias por elegir Extreme Wash!</p>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Correo de confirmación enviado a:', booking.email);
    } catch (error) {
        console.error('Error al enviar correo:', error);
        throw error;
    }
}

module.exports = {
    sendBookingConfirmation
}; 