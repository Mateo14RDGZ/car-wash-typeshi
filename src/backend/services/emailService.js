const nodemailer = require('nodemailer');

// Configurar el transporter de correo
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    },
    tls: {
        rejectUnauthorized: false
    }
});

// Función para enviar correo de confirmación de reserva
async function sendBookingConfirmation(booking) {
    const adminMailOptions = {
        from: process.env.GMAIL_USER,
        to: process.env.GMAIL_USER,
        subject: '🚗 Nueva Reserva - Car Wash',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
                    <h1 style="margin: 0; font-size: 24px;">🚗 Nueva Reserva Recibida</h1>
                    <p style="margin: 10px 0 0 0; opacity: 0.9;">Sistema de Reservas Car Wash</p>
                </div>
                
                <div style="padding: 30px; background: #f9f9f9;">
                    <h2 style="color: #333; margin-top: 0;">Detalles de la Reserva:</h2>
                    
                    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                        <tr style="background: white;">
                            <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold; background: #f5f5f5;">Cliente:</td>
                            <td style="padding: 12px; border: 1px solid #ddd;">${booking.clientName}</td>
                        </tr>
                        <tr style="background: white;">
                            <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold; background: #f5f5f5;">Teléfono:</td>
                            <td style="padding: 12px; border: 1px solid #ddd;">${booking.clientPhone || 'No proporcionado'}</td>
                        </tr>
                        <tr style="background: white;">
                            <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold; background: #f5f5f5;">Fecha y Hora:</td>
                            <td style="padding: 12px; border: 1px solid #ddd;"><strong>${new Date(booking.date).toLocaleString('es-UY')}</strong></td>
                        </tr>
                        <tr style="background: white;">
                            <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold; background: #f5f5f5;">Vehículo:</td>
                            <td style="padding: 12px; border: 1px solid #ddd;">${booking.vehicleType}</td>
                        </tr>
                        <tr style="background: white;">
                            <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold; background: #f5f5f5;">Patente:</td>
                            <td style="padding: 12px; border: 1px solid #ddd;"><strong>${booking.vehiclePlate}</strong></td>
                        </tr>
                        <tr style="background: white;">
                            <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold; background: #f5f5f5;">Servicio:</td>
                            <td style="padding: 12px; border: 1px solid #ddd;">${booking.serviceType}</td>
                        </tr>
                        <tr style="background: white;">
                            <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold; background: #f5f5f5;">Precio:</td>
                            <td style="padding: 12px; border: 1px solid #ddd; color: green; font-weight: bold;">$${booking.price}</td>
                        </tr>
                        <tr style="background: white;">
                            <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold; background: #f5f5f5;">Extras:</td>
                            <td style="padding: 12px; border: 1px solid #ddd;">${booking.extras && booking.extras.length ? booking.extras.join(', ') : 'Ninguno'}</td>
                        </tr>
                        <tr style="background: white;">
                            <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold; background: #f5f5f5;">ID Reserva:</td>
                            <td style="padding: 12px; border: 1px solid #ddd;">#${booking.id}</td>
                        </tr>
                    </table>
                    
                    <div style="background: #e8f5e8; padding: 15px; border-radius: 5px; border-left: 4px solid #4caf50; margin: 20px 0;">
                        <p style="margin: 0; color: #2e7d32;"><strong>✅ Acción requerida:</strong> Confirmar disponibilidad y preparar el servicio para la fecha programada.</p>
                    </div>
                </div>
                
                <div style="background: #333; color: white; padding: 15px; border-radius: 0 0 8px 8px; text-align: center; font-size: 12px;">
                    <p style="margin: 0;">Enviado automáticamente por el Sistema de Reservas Car Wash</p>
                    <p style="margin: 5px 0 0 0; opacity: 0.7;">${new Date().toLocaleString('es-UY')}</p>
                </div>
            </div>
        `
    };
    
    try {
        await transporter.sendMail(adminMailOptions);
        console.log('✅ Correo de nueva reserva enviado al administrador.');
    } catch (error) {
        console.error('❌ Error al enviar correo de nueva reserva:', error);
    }
}

// Función para enviar correo de cancelación de reserva
async function sendBookingCancellation(booking, cancelReason = 'No especificada') {
    const adminMailOptions = {
        from: process.env.GMAIL_USER,
        to: process.env.GMAIL_USER,
        subject: '❌ Reserva Cancelada - Car Wash',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
                <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
                    <h1 style="margin: 0; font-size: 24px;">❌ Reserva Cancelada</h1>
                    <p style="margin: 10px 0 0 0; opacity: 0.9;">Sistema de Reservas Car Wash</p>
                </div>
                
                <div style="padding: 30px; background: #f9f9f9;">
                    <h2 style="color: #333; margin-top: 0;">Detalles de la Reserva Cancelada:</h2>
                    
                    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                        <tr style="background: white;">
                            <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold; background: #f5f5f5;">Cliente:</td>
                            <td style="padding: 12px; border: 1px solid #ddd;">${booking.clientName}</td>
                        </tr>
                        <tr style="background: white;">
                            <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold; background: #f5f5f5;">Teléfono:</td>
                            <td style="padding: 12px; border: 1px solid #ddd;">${booking.clientPhone || 'No proporcionado'}</td>
                        </tr>
                        <tr style="background: white;">
                            <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold; background: #f5f5f5;">Fecha y Hora:</td>
                            <td style="padding: 12px; border: 1px solid #ddd;"><strong>${new Date(booking.date).toLocaleString('es-UY')}</strong></td>
                        </tr>
                        <tr style="background: white;">
                            <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold; background: #f5f5f5;">Vehículo:</td>
                            <td style="padding: 12px; border: 1px solid #ddd;">${booking.vehicleType}</td>
                        </tr>
                        <tr style="background: white;">
                            <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold; background: #f5f5f5;">Patente:</td>
                            <td style="padding: 12px; border: 1px solid #ddd;"><strong>${booking.vehiclePlate}</strong></td>
                        </tr>
                        <tr style="background: white;">
                            <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold; background: #f5f5f5;">Servicio:</td>
                            <td style="padding: 12px; border: 1px solid #ddd;">${booking.serviceType}</td>
                        </tr>
                        <tr style="background: white;">
                            <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold; background: #f5f5f5;">Precio:</td>
                            <td style="padding: 12px; border: 1px solid #ddd; color: red; font-weight: bold;">$${booking.price}</td>
                        </tr>
                        <tr style="background: white;">
                            <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold; background: #f5f5f5;">ID Reserva:</td>
                            <td style="padding: 12px; border: 1px solid #ddd;">#${booking.id}</td>
                        </tr>
                        <tr style="background: white;">
                            <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold; background: #f5f5f5;">Razón de Cancelación:</td>
                            <td style="padding: 12px; border: 1px solid #ddd; font-style: italic;">${cancelReason}</td>
                        </tr>
                        <tr style="background: white;">
                            <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold; background: #f5f5f5;">Cancelado el:</td>
                            <td style="padding: 12px; border: 1px solid #ddd;">${new Date().toLocaleString('es-UY')}</td>
                        </tr>
                    </table>
                    
                    <div style="background: #fff3cd; padding: 15px; border-radius: 5px; border-left: 4px solid #ffc107; margin: 20px 0;">
                        <p style="margin: 0; color: #856404;"><strong>⚠️ Información:</strong> El horario ahora está disponible para nuevas reservas.</p>
                    </div>
                </div>
                
                <div style="background: #333; color: white; padding: 15px; border-radius: 0 0 8px 8px; text-align: center; font-size: 12px;">
                    <p style="margin: 0;">Enviado automáticamente por el Sistema de Reservas Car Wash</p>
                    <p style="margin: 5px 0 0 0; opacity: 0.7;">${new Date().toLocaleString('es-UY')}</p>
                </div>
            </div>
        `
    };
    
    try {
        await transporter.sendMail(adminMailOptions);
        console.log('✅ Correo de cancelación enviado al administrador.');
    } catch (error) {
        console.error('❌ Error al enviar correo de cancelación:', error);
    }
}

module.exports = {
    sendBookingConfirmation,
    sendBookingCancellation
};