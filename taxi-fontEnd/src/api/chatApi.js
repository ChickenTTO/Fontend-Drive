import axiosClient from "./axiosClient";

export const chatApi = {
  /**
   * Gửi tin nhắn đến chatbot AI ở backend
   * @param {string} message - Nội dung tin nhắn
   * @param {Array} history - Lịch sử trò chuyện
   * @returns {Promise<{success: boolean, reply: string}>} Phản hồi từ server
   */
  sendMessage: async (message, history = []) => {
    try {
      const response = await axiosClient.post("/chat", { message, history });
      return response.data;
    } catch (error) {
      console.error("Lỗi khi gọi API chat:", error);
      throw error;
    }
  }
};
