import api from './api';

export const demoService = {
  async simulateBruteForce(sourceIp = '192.168.1.105') {
    const response = await api.post(`/demo/brute-force?sourceIp=${encodeURIComponent(sourceIp)}`);
    return response.data.data;
  },

  async simulatePortScan(sourceIp = '10.10.4.52') {
    const response = await api.post(`/demo/port-scan?sourceIp=${encodeURIComponent(sourceIp)}`);
    return response.data.data;
  },

  async simulateCorrelation(sourceIp = '172.16.8.99') {
    const response = await api.post(`/demo/correlation-attack?sourceIp=${encodeURIComponent(sourceIp)}`);
    return response.data.data;
  },
};
