import axios from 'axios';
import { fetchAuthSession } from 'aws-amplify/auth';

const API_URL = 'https://4uvipv74bc.execute-api.us-east-2.amazonaws.com/dev';

export interface Instance {
  id: string;
  name: string;
  state: 'running' | 'stopped' | 'pending' | 'stopping' | 'shutting-down' | 'terminated' | 'unknown';
  type: string;
  publicIp: string | null;
}

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    try {
      const { tokens } = await fetchAuthSession();
      if (tokens?.idToken) {
        config.headers.Authorization = `Bearer ${tokens.idToken.toString()}`;
      }
    } catch (error) {
      console.error('Error fetching auth session', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const getInstances = async (): Promise<Instance[]> => {
  try {
    const response = await api.get('/instances');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching instances:', error);
    throw error;
  }
};

export const manageInstance = async (instanceId: string, action: 'start' | 'stop'): Promise<any> => {
  try {
    const response = await api.post('/instances/manage', { action, instanceId });
    return response.data;
  } catch (error) {
    console.error(`Error sending ${action} command:`, error);
    throw error;
  }
};

export interface CostItem {
  serviceName: string;
  amount: string;
  unit: string;
}

export const getCosts = async (): Promise<{ data: CostItem[], period: { start: string, end: string } }> => {
  try {
    const response = await api.get('/costs');
    return response.data; // Helper returns { message, data, period }
  } catch (error) {
    console.error('Error fetching costs:', error);
    throw error;
  }
};
