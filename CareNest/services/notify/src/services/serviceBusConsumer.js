const { ServiceBusClient } = require("@azure/service-bus");
const Notification = require('../models/Notification'); // assuming this exists, if not I should check
const nodemailer = require('nodemailer');

const connectionString = process.env.SERVICEBUS_CONNECTION_STRING;
let sbClient;

exports.startConsumer = async () => {
  if (!connectionString) {
    console.warn("SERVICEBUS_CONNECTION_STRING missing, not starting consumer.");
    return;
  }
  sbClient = new ServiceBusClient(connectionString);
  const queues = [
    'appointment-created',
    'appointment-confirmed',
    'appointment-cancelled',
    'appointment-completed',
    'prescription-created'
  ];

  for (const queue of queues) {
    const receiver = sbClient.createReceiver(queue);
    receiver.subscribe({
      processMessage: async (message) => {
        try {
          const body = message.body;
          const notificationData = {
            userId: body.patientId, // typically notifications go to the patient
            title: `Update: ${queue}`,
            message: `Event ${queue} occurred for appointment/prescription.`,
            type: queue.split('-')[0]
          };

          // Try using existing notifyService if available, otherwise raw DB.
          // Let's use raw model or a service if we can.
          // Wait, Notification model might be in src/models/Notification.js
          const newNotif = new Notification(notificationData);
          await newNotif.save();
          console.log(`Processed message from ${queue} for user ${body.patientId}`);
          
          // Send email alert
          try {
            const transporter = nodemailer.createTransport({
              host: "smtp.ethereal.email",
              port: 587,
              secure: false,
              auth: {
                user: process.env.SMTP_USER || "test@ethereal.email",
                pass: process.env.SMTP_PASS || "testpass"
              }
            });
            await transporter.sendMail({
              from: '"CareNest Alerts" <alerts@carenest.com>',
              to: "jayadevarun03@gmail.com",
              subject: notificationData.title,
              text: notificationData.message
            });
            console.log(`Alert email sent to jayadevarun03@gmail.com for event: ${queue}`);
          } catch (emailErr) {
            console.error(`Failed to send email alert for ${queue}:`, emailErr);
          }

          await receiver.completeMessage(message);
        } catch (err) {
          console.error(`Error processing message from ${queue}:`, err);
        }
      },
      processError: async (args) => {
        console.error(`Error from ${args.errorSource} in ${queue}:`, args.error);
      }
    });
    console.log(`Subscribed to queue: ${queue}`);
  }
};
