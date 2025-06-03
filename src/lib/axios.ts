import axios from 'axios';

// 创建axios实例，配置默认设置
const axiosInstance = axios.create({
  baseURL: process.env.NODE_ENV === 'production' ? '' : '',
  headers: {
    'Content-Type': 'application/json',
  },
});

// 响应拦截器
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // 如果是401错误，可能需要重新登录
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
