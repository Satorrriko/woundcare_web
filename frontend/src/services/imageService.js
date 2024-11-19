const API_BASE_URL = 'http://3.25.71.234:5000';

export const processImage = async (imageFile) => {
    try {
        // 创建FormData对象
        const formData = new FormData();
        formData.append('image', imageFile);

        // 发送请求到后端服务器
        const response = await fetch(`${API_BASE_URL}/api/detect-marker`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error('Failed to process image');
        }

        return await response.json();
    } catch (error) {
        console.error('Error processing image:', error);
        throw error;
    }
};