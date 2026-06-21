const { BlobServiceClient } = require("@azure/storage-blob");

const connectionString = process.env.STORAGE_CONNECTION_STRING;
let blobServiceClient;
let containerClient;

if (connectionString) {
  blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
  containerClient = blobServiceClient.getContainerClient('prescriptions');
} else {
  console.warn("STORAGE_CONNECTION_STRING is missing. Blob storage features disabled.");
}

exports.uploadPrescriptionPDF = async (prescriptionId, buffer) => {
  if (!containerClient) return null;
  try {
    const blockBlobClient = containerClient.getBlockBlobClient(prescriptionId);
    await blockBlobClient.uploadData(buffer, {
      blobHTTPHeaders: { blobContentType: "application/pdf" }
    });
    console.log(`Uploaded prescription ${prescriptionId} to blob storage`);
    return blockBlobClient.url;
  } catch (err) {
    console.error('Error uploading to blob storage:', err);
    return null;
  }
};

exports.getPrescriptionURL = (prescriptionId) => {
  if (!containerClient) return null;
  const blockBlobClient = containerClient.getBlockBlobClient(prescriptionId);
  return blockBlobClient.url;
};
