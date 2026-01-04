import axios from 'axios';

const API_BASE_URL = 'https://api.xlap.top/v1';
// 本地存储的key
const STORAGE_KEY = 'nano_banana_x_key';

// 尝试从本地存储中获取API Key
let API_KEY = '';
// 检查是否在浏览器环境中
if (typeof window !== 'undefined') {
  const savedKey = localStorage.getItem(STORAGE_KEY);
  if (savedKey) {
    API_KEY = savedKey;
  }
}

// 设置API Key的函数
export const setApiKey = (newApiKey: string) => {
  API_KEY = newApiKey;
  // 更新apiClient的headers
  apiClient.defaults.headers.common['Authorization'] = `Bearer ${API_KEY}`;
};

// 创建axios实例
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${API_KEY}`
  }
});

// 文生图的接口
export const generateImage = async (prompt: string, aspect_ratio: string = "4:3", model: string = "nano-banana"): Promise<string> => {
  try {
    const response = await apiClient.post('/images/generations', {
      model,
      prompt,
      aspect_ratio,
    });
    // 假设API返回的结构包含图片URL
    return response.data.data[0].url;
  } catch (error) {
    console.error('生成图片失败:', error);
    throw error;
  }
};
// 图生图的接口
export const editImage = async (prompt: string, image: File, model: string = "nano-banana"): Promise<string> => {
  try {
    // 创建FormData对象用于文件上传
    const formData = new FormData();
    formData.append('model', model);
    formData.append('prompt', prompt);
    formData.append('image', image);
    
    // 发送FormData请求，不设置Content-Type，让浏览器自动设置
    const response = await axios.post(`${API_BASE_URL}/images/edits`, formData, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`
        // 不设置Content-Type，让浏览器自动设置正确的Content-Type和boundary
      }
    });
    
    // 假设API返回的结构包含图片URL
    return response.data.data[0].url;
  } catch (error) {
    console.error('生成图片失败:', error);
    throw error;
  }
};

export default apiClient;