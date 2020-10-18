import libAxios, { AxiosInstance } from 'axios';
import * as AxiosLogger from 'axios-logger';

const axios = {
  create: (options: any): AxiosInstance => {
    const instance = libAxios.create(options);
    instance.interceptors.response.use(null, AxiosLogger.errorLogger);
    return instance;
  },
};

export default axios;

export { AxiosInstance } from 'axios';
