const { ServiceBusClient } = require("@azure/service-bus");

const connectionString = process.env.SERVICEBUS_CONNECTION_STRING;
let sbClient;
if (connectionString) {
  sbClient = new ServiceBusClient(connectionString);
} else {
  console.warn("SERVICEBUS_CONNECTION_STRING is missing. Events will not be published.");
}

exports.publishAppointmentEvent = async (queueName, messageObject) => {
  if (!sbClient) return;
  const sender = sbClient.createSender(queueName);
  try {
    await sender.sendMessages({
      body: messageObject,
      contentType: "application/json"
    });
    console.log(`Sent message to ${queueName}`);
  } catch (err) {
    console.error(`Error sending message to ${queueName}:`, err);
  } finally {
    await sender.close();
  }
};
