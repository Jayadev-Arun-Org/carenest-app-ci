import axios from 'axios';

const getAuthHeaders = () => {
    const token = localStorage.getItem('carenest_token');
    return { Authorization: `Bearer ${token}` };
};

export const checkSymptoms = async (symptoms) => {
    const res = await axios.post('/api/ai/symptom-check', { symptoms }, { headers: getAuthHeaders() });
    return res.data;
};

export const summarizePrescription = async (prescriptionId) => {
    const res = await axios.post('/api/ai/prescription-summary', { prescriptionId }, { headers: getAuthHeaders() });
    return res.data;
};

export const askChatbot = async (question, patientId) => {
    const res = await axios.post('/api/ai/chatbot', { question, patientId }, { headers: getAuthHeaders() });
    return res.data;
};

export const extractEntities = async (notes, patientId, appointmentId) => {
    const res = await axios.post('/api/ai/extract-entities', { notes, patientId, appointmentId }, { headers: getAuthHeaders() });
    return res.data;
};
