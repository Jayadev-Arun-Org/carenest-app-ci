const { TextAnalyticsClient, AzureKeyCredential } = require("@azure/ai-text-analytics");
require('dotenv').config();

const endpoint = process.env.AZURE_LANGUAGE_ENDPOINT;
const apiKey = process.env.AZURE_LANGUAGE_KEY;

if (!endpoint || !apiKey) {
  console.warn("Language Service endpoint or key is missing.");
}

const client = new TextAnalyticsClient(endpoint, new AzureKeyCredential(apiKey));

exports.extractHealthEntities = async (notesText) => {
  const poller = await client.beginAnalyzeHealthcareEntities([notesText]);
  const results = await poller.pollUntilDone();

  const extracted = {
    diagnoses: [],
    medications: [],
    dosages: [],
    symptoms: [],
    allergies: []
  };

  for (const result of results) {
    if (result.error) continue;
    for (const entity of result.entities) {
      if (entity.category === 'Diagnosis') extracted.diagnoses.push(entity.text);
      if (entity.category === 'MedicationName') extracted.medications.push(entity.text);
      if (entity.category === 'Dosage') extracted.dosages.push(entity.text);
      if (entity.category === 'SymptomOrSign') extracted.symptoms.push(entity.text);
      if (entity.category === 'Allergy') extracted.allergies.push(entity.text);
    }
  }

  return extracted;
};
