import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { chatApi } from "../../api/chatApi";
import { BotIcon, ChatIcon, SendIcon, XIcon } from "../icons";
import "./ChatbotWidget.css";

// Định nghĩa các gợi ý nhanh dựa theo vai trò người dùng
const SUGGESTIONS = {
  admin: [
    "Có tài xế nào rảnh không?",
    "Xem danh sách xe và trạng thái",
    "10 chuyến đi gần nhất trong hệ thống",
    "Doanh thu hôm nay thế nào?"
  ],
  dispatcher: [
    "Có tài xế nào đang rảnh gần đây?",
    "Lấy danh sách xe hoạt động",
    "10 chuyến đi gần nhất",
    "Kiểm tra các chuyến mới tạo"
  ],
  driver: [
    "Hôm nay tôi chạy những chuyến nào?",
    "Thông tin xe tôi đang lái",
    "Quy trình bàn giao xe",
    "Liên hệ điều phối khẩn cấp"
  ],
  accountant: [
    "Danh sách tài xế nộp tiền chờ xác nhận",
    "Tổng kết chi phí xăng dầu",
    "Doanh số điều hành hôm nay"
  ],
  default: [
    "Hệ thống Smart Fleet AI hoạt động ra sao?",
    "Làm cách nào để đổi mật khẩu?",
    "Quyền hạn của tôi là gì?"
  ]
};

export const ChatbotWidget = () => {
  const { user, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const messagesEndRef = useRef(null);

  // Cuộn xuống tin nhắn mới nhất
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Khởi tạo tin nhắn chào mừng dựa theo tên và vai trò người dùng
  useEffect(() => {
    if (isAuthenticated && user && messages.length === 0) {
      let welcomeMsg = `Xin chào **${user.fullName || user.username}**! Tôi là trợ lý ảo **Smart Fleet AI**.\n\nHôm nay tôi có thể giúp gì cho bạn trong công việc điều phối và quản lý vận tải?`;
      
      if (user.role === "driver") {
        welcomeMsg = `Xin chào tài xế **${user.fullName}**! Chúc bạn có những lộ trình an toàn.\n\nBạn có thể hỏi tôi về lịch chuyến xe chạy hôm nay, thông tin xe được bàn giao hoặc quy trình nộp tiền mặt.`;
      } else if (user.role === "accountant") {
        welcomeMsg = `Xin chào Kế toán **${user.fullName}**!\n\nHôm nay bạn cần tôi hỗ trợ tra cứu danh sách nộp tiền của tài xế hay tổng hợp báo cáo chi phí nào?`;
      }

      setMessages([
        {
          id: "welcome",
          sender: "bot",
          text: welcomeMsg,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ]);
    }
  }, [isAuthenticated, user]);

  // Nếu chưa đăng nhập thì không hiển thị chatbot
  if (!isAuthenticated) return null;

  // Lấy danh sách câu hỏi gợi ý phù hợp với role của user
  const userRole = user?.role || "default";
  const userSuggestions = SUGGESTIONS[userRole] || SUGGESTIONS.default;

  // Định dạng Bold, Code inline
  const formatInlineMarkdown = (text) => {
    let html = text;
    // Bọc code: `code` -> <code>code</code>
    html = html.replace(/`([^`]+)`/g, "<code>$1</code>");
    // Bọc bold: **text** -> <strong>$1</strong>
    html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    return html;
  };

  // Parser Markdown đơn giản để vẽ bảng, danh sách từ câu trả lời của AI
  const parseMarkdown = (text) => {
    if (!text) return "";
    
    const lines = text.split("\n");
    const parsedElements = [];
    let inTable = false;
    let tableHeaders = [];
    let tableRows = [];
    let inList = false;
    let listItems = [];

    const flushList = (key) => {
      if (listItems.length > 0) {
        parsedElements.push(
          <ul key={`list-${key}`} style={{ paddingLeft: "20px", margin: "8px 0" }}>
            {listItems.map((li, idx) => (
              <li key={idx} dangerouslySetInnerHTML={{ __html: li }} />
            ))}
          </ul>
        );
        listItems = [];
        inList = false;
      }
    };

    const flushTable = (key) => {
      if (tableRows.length > 0 || tableHeaders.length > 0) {
        parsedElements.push(
          <div key={`table-wrapper-${key}`} style={{ overflowX: "auto", margin: "10px 0" }}>
            <table>
              {tableHeaders.length > 0 && (
                <thead>
                  <tr>
                    {tableHeaders.map((th, idx) => (
                      <th key={idx} dangerouslySetInnerHTML={{ __html: th }} />
                    ))}
                  </tr>
                </thead>
              )}
              <tbody>
                {tableRows.map((row, rowIdx) => (
                  <tr key={rowIdx}>
                    {row.map((cell, cellIdx) => (
                      <td key={cellIdx} dangerouslySetInnerHTML={{ __html: cell }} />
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        tableHeaders = [];
        tableRows = [];
        inTable = false;
      }
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Xử lý Bảng Markdown
      if (line.startsWith("|")) {
        flushList(i);
        inTable = true;
        
        // Cắt dữ liệu ô dựa theo dấu |
        const cells = line
          .split("|")
          .map(c => c.trim())
          .filter((c, idx, arr) => idx > 0 && idx < arr.length - 1);
        
        // Bỏ qua dòng kẻ phân cách bảng |---|---|
        if (cells.every(c => c.match(/^:-*-?:*$/) || c.match(/^-+$/))) {
          continue;
        }
        
        if (tableHeaders.length === 0) {
          tableHeaders = cells.map(c => formatInlineMarkdown(c));
        } else {
          tableRows.push(cells.map(c => formatInlineMarkdown(c)));
        }
        continue;
      } else if (inTable) {
        flushTable(i);
      }

      // Xử lý Danh sách Bullet
      if (line.startsWith("* ") || line.startsWith("- ")) {
        inList = true;
        listItems.push(formatInlineMarkdown(line.substring(2)));
        continue;
      } else if (inList) {
        flushList(i);
      }

      // Dòng trống
      if (line === "") {
        continue;
      }

      // Văn bản bình thường
      parsedElements.push(
        <p key={i} style={{ margin: "6px 0" }} dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(line) }} />
      );
    }

    // Đảm bảo flush hết list hoặc table ở cuối văn bản
    flushList(lines.length);
    flushTable(lines.length);

    return parsedElements;
  };

  // Gửi tin nhắn
  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputValue;
    if (!text.trim() || isLoading) return;

    // Reset input nếu gửi từ textbox
    if (!textToSend) setInputValue("");

    // Thêm tin nhắn user vào danh sách
    const newMessages = [
      ...messages,
      {
        id: `user-${Date.now()}`,
        sender: "user",
        text: text,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      }
    ];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      // Chỉ gửi 6 tin nhắn gần nhất làm lịch sử chat để tiết kiệm token
      const historyForApi = messages
        .filter(m => m.id !== "welcome")
        .slice(-6)
        .map(m => ({
          sender: m.sender,
          text: m.text
        }));

      const res = await chatApi.sendMessage(text, historyForApi);
      
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: "bot",
          text: res.reply,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          sender: "bot",
          text: "⚠️ Lỗi: Không thể kết nối với máy chủ AI. Vui lòng kiểm tra kết nối mạng hoặc thử lại sau.",
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Xóa lịch sử trò chuyện
  const handleClearHistory = () => {
    if (window.confirm("Bạn có chắc chắn muốn xóa lịch sử trò chuyện?")) {
      setMessages([
        {
          id: "welcome",
          sender: "bot",
          text: `Đã làm mới hội thoại. Tôi là trợ lý ảo **Smart Fleet AI**, tôi có thể giúp gì thêm cho bạn?`,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ]);
    }
  };

  return (
    <>
      {/* Bong bóng chat nổi */}
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className={`chatbot-trigger ${isOpen ? "active" : ""}`}
        title="Trợ lý ảo AI"
      >
        {isOpen ? <XIcon /> : <ChatIcon />}
      </button>

      {/* Cửa sổ chat */}
      {isOpen && (
        <div className="chatbot-window">
          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-header-info">
              <div className="chatbot-avatar">
                <BotIcon />
              </div>
              <div className="chatbot-title">
                <h3>Smart Fleet AI</h3>
                <span>Trực tuyến</span>
              </div>
            </div>
            <div className="chatbot-actions">
              <button 
                onClick={handleClearHistory} 
                className="chatbot-btn-action" 
                title="Xóa lịch sử"
              >
                🗑️
              </button>
              <button 
                onClick={() => setIsOpen(false)} 
                className="chatbot-btn-action" 
                title="Thu nhỏ"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Hộp thoại tin nhắn */}
          <div className="chatbot-messages">
            {messages.map((msg) => (
              <div key={msg.id} className={`chat-bubble-container ${msg.sender}`}>
                <div className="chat-bubble">
                  {msg.sender === "bot" ? parseMarkdown(msg.text) : msg.text}
                  <span className="chat-time">{msg.time}</span>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="chat-bubble-container bot">
                <div className="chat-bubble">
                  <div className="typing-indicator">
                    <span className="typing-dot"></span>
                    <span className="typing-dot"></span>
                    <span className="typing-dot"></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Gợi ý câu hỏi nhanh (chỉ hiện khi rảnh) */}
          {!isLoading && userSuggestions.length > 0 && (
            <div className="chatbot-suggestions-container">
              <span className="chatbot-suggestions-title">Hỏi nhanh trợ lý:</span>
              <div className="chatbot-suggestions">
                {userSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSendMessage(suggestion)}
                    className="chatbot-btn-suggestion"
                    title={suggestion}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Form nhập văn bản */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }} 
            className="chatbot-input-form"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Nhập câu hỏi của bạn..."
              className="chatbot-input"
              disabled={isLoading}
            />
            <button 
              type="submit" 
              className="chatbot-btn-send"
              disabled={!inputValue.trim() || isLoading}
            >
              <SendIcon />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
