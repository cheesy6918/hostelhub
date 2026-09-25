import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Sparkles,
  MessageSquare,
  Send,
  X,
  RotateCcw,
  Minimize2,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
  ArrowRight,
  Building2,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export interface ChatAction {
  type: 'view_room';
  roomId: string;
  label: string;
}

export interface MessageItem {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  actions?: ChatAction[];
  isError?: boolean;
}

interface ChatWidgetProps {
  onViewRoomDetail: (roomId: string) => void;
  onNavigate: (view: string) => void;
}

export const ChatWidget: React.FC<ChatWidgetProps> = ({
  onViewRoomDetail,
  onNavigate,
}) => {
  const { user, token } = useAuth();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [hasUnread, setHasUnread] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Generate initial welcome message according to user role
  const getInitialMessage = (): MessageItem => {
    let greeting = '';
    const name = user?.HoTen ? user.HoTen.split(' ').pop() : 'bạn';

    if (user?.VaiTro === 'SinhVien') {
      greeting = `Chào ${name}! 👋 Mình là Trợ lý AI của HostelHub.\n\nMình có thể hỗ trợ bạn:\n• 🔍 Tìm phòng trọ theo ngân sách hoặc khu vực (vd: *"Tìm phòng dưới 2 triệu"*)\n• 📅 Cách đặt lịch xem phòng trực tiếp miễn phí\n• 🛡️ Quy trình đặt cọc giữ chỗ 500k & Chính sách hoàn tiền 100%\n\nBạn đang cần tìm phòng khu vực nào hoặc cần hỗ trợ gì không?`;
    } else if (user?.VaiTro === 'ChuTro') {
      greeting = `Kính chào Chủ trọ ${name}! 👋 Tôi là Trợ lý AI HostelHub.\n\nTôi có thể hỗ trợ bạn:\n• 📝 Hướng dẫn đăng tin cho thuê phòng trọ\n• 📋 Cách duyệt lịch hẹn xem phòng của sinh viên\n• 💰 Quy trình xác nhận tiếp nhận tiền cọc giữ chỗ\n• ⏱️ Quy định kiểm duyệt tin đăng từ Admin\n\nBạn cần hỗ trợ thao tác nào hôm nay?`;
    } else if (user?.VaiTro === 'Admin') {
      greeting = `Xin chào Quản trị viên ${name}! 🛡️ Trợ lý AI sẵn sàng hỗ trợ các thông tin quy trình duyệt tin, kiểm soát tài khoản và điều khoản nền tảng.`;
    } else {
      greeting = `Xin chào bạn! 👋 Chào mừng bạn đến với **HostelHub** — Nền tảng thuê trọ sinh viên tiện lợi và minh bạch.\n\nMình có thể hỗ trợ bạn tra cứu danh sách phòng thực tế, hướng dẫn quy trình đặt cọc an toàn, hoặc giải đáp các thắc mắc chung về nền tảng.\n\nBạn muốn tìm kiếm thông tin gì?`;
    }

    return {
      id: 'welcome_' + Date.now(),
      role: 'assistant',
      content: greeting,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };
  };

  // Initialize or reset chat
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([getInitialMessage()]);
    }
  }, [user]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setHasUnread(false);
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  // Quick reply prompt chips depending on current user role
  const quickReplies = React.useMemo(() => {
    if (user?.VaiTro === 'ChuTro') {
      return [
        'Cách đăng tin phòng trọ?',
        'Làm sao duyệt yêu cầu đặt cọc?',
        'Quy trình Admin duyệt tin đăng?',
        'Lịch hẹn xem phòng xử lý ra sao?',
      ];
    }
    if (user?.VaiTro === 'Admin') {
      return [
        'Quy trình duyệt tin đăng?',
        'Chính sách hoàn cọc 100% ra sao?',
        'Quản trị tài khoản người dùng',
      ];
    }
    // Sinh viên hoặc Khách
    return [
      'Tìm phòng dưới 2 triệu',
      'Làm sao để đặt cọc?',
      'Phí giữ chỗ bao nhiêu?',
      'Chính sách hoàn cọc 100%',
      'Cách đặt lịch xem phòng',
    ];
  }, [user?.VaiTro]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    const userMessage: MessageItem = {
      id: 'msg_u_' + Date.now(),
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Build messages array for API
      const apiMessages = newMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          messages: apiMessages,
          userRole: user?.VaiTro || null,
          userName: user?.HoTen || undefined,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        const botReply: MessageItem = {
          id: 'msg_a_' + Date.now(),
          role: 'assistant',
          content: data.reply,
          actions: data.actions || [],
          timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, botReply]);
      } else {
        const errorReply: MessageItem = {
          id: 'msg_err_' + Date.now(),
          role: 'assistant',
          content: data.reply || 'Xin lỗi, trợ lý đang gặp sự cố, vui lòng thử lại sau.',
          isError: true,
          timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, errorReply]);
      }
    } catch {
      const errorReply: MessageItem = {
        id: 'msg_err_' + Date.now(),
        role: 'assistant',
        content: 'Xin lỗi, trợ lý đang gặp sự cố, vui lòng thử lại sau.',
        isError: true,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorReply]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([getInitialMessage()]);
    setInputMessage('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Render markdown-like simple formatting (bold, bullets)
  const renderFormattedText = (text: string) => {
    const lines = text.split('\n');
    return (
      <div className="space-y-1.5 leading-relaxed text-xs sm:text-[13px]">
        {lines.map((line, idx) => {
          if (!line.trim()) {
            return <div key={idx} className="h-1" />;
          }

          // Format bold **text**
          const parts = line.split(/(\*\*[^*]+\*\*)/g);
          const formattedParts = parts.map((part, pIdx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return (
                <strong key={pIdx} className="font-semibold text-slate-900">
                  {part.slice(2, -2)}
                </strong>
              );
            }
            if (part.startsWith('*') && part.endsWith('*')) {
              return (
                <em key={pIdx} className="italic text-slate-700">
                  {part.slice(1, -1)}
                </em>
              );
            }
            return part;
          });

          // Bullet points
          if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
            return (
              <div key={idx} className="flex items-start gap-1.5 pl-1">
                <span className="text-blue-500 font-bold shrink-0 mt-0.5">•</span>
                <span>{formattedParts}</span>
              </div>
            );
          }

          // Numbered lists
          const numMatch = line.match(/^([0-9]+)\.\s*(.*)/);
          if (numMatch) {
            return (
              <div key={idx} className="flex items-start gap-1.5 pl-1">
                <span className="text-blue-600 font-semibold shrink-0">{numMatch[1]}.</span>
                <span>{formattedParts}</span>
              </div>
            );
          }

          return <p key={idx}>{formattedParts}</p>;
        })}
      </div>
    );
  };

  return (
    <>
      {/* Floating Toggle Button (Always visible on all views) */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-40 flex items-center group">
          <button
            onClick={() => setIsOpen(true)}
            aria-label="Mở Trợ lý AI HostelHub"
            className="relative flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full shadow-xl shadow-blue-500/25 hover:shadow-2xl hover:shadow-blue-500/40 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer border border-white/20"
          >
            <div className="relative">
              <Bot className="w-5 h-5 text-white" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 border-2 border-blue-600 rounded-full animate-ping" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 border-2 border-blue-600 rounded-full" />
            </div>
            <span className="text-xs font-bold tracking-wide">Trợ lý AI</span>
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
          </button>
        </div>
      )}

      {/* Floating Chat Popup Widget */}
      {isOpen && (
        <div className="fixed bottom-6 right-4 sm:right-6 z-50 w-[94vw] sm:w-[400px] h-[580px] max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in zoom-in-95 fade-in duration-200">
          {/* Header */}
          <div className="px-4 py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white flex items-center justify-between shrink-0 shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-xs sm:text-sm tracking-tight">HostelHub AI Assistant</h3>
                  <Sparkles className="w-3 h-3 text-amber-300" />
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-blue-100/90 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>
                    {user?.VaiTro === 'SinhVien'
                      ? 'Hỗ trợ Sinh viên'
                      : user?.VaiTro === 'ChuTro'
                      ? 'Hỗ trợ Chủ trọ'
                      : user?.VaiTro === 'Admin'
                      ? 'Hỗ trợ Quản trị'
                      : 'Hỗ trợ Người dùng'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleResetChat}
                title="Xóa hội thoại & bắt đầu lại"
                className="p-1.5 hover:bg-white/15 active:bg-white/25 rounded-xl transition-colors cursor-pointer text-white/90 hover:text-white"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Thu nhỏ khung chat"
                className="p-1.5 hover:bg-white/15 active:bg-white/25 rounded-xl transition-colors cursor-pointer text-white/90 hover:text-white"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Đóng"
                className="p-1.5 hover:bg-white/15 active:bg-white/25 rounded-xl transition-colors cursor-pointer text-white/90 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Replies Bar */}
          <div className="px-3 py-2 bg-slate-50 border-b border-slate-100 overflow-x-auto no-scrollbar flex items-center gap-1.5 shrink-0">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider shrink-0 pl-1">
              Gợi ý:
            </span>
            {quickReplies.map((reply, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(reply)}
                disabled={isLoading}
                className="shrink-0 px-2.5 py-1 text-[11px] font-medium bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-600 rounded-full border border-slate-200 hover:border-blue-300 transition-colors shadow-2xs cursor-pointer active:scale-95 disabled:opacity-50"
              >
                {reply}
              </button>
            ))}
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-gradient-to-b from-slate-50/50 to-white">
            {messages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1.5`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 shadow-2xs ${
                      isUser
                        ? 'bg-blue-600 text-white rounded-tr-xs'
                        : msg.isError
                        ? 'bg-rose-50 text-rose-800 border border-rose-200 rounded-tl-xs'
                        : 'bg-white text-slate-800 border border-slate-200/90 rounded-tl-xs'
                    }`}
                  >
                    {isUser ? (
                      <p className="text-xs sm:text-[13px] leading-relaxed whitespace-pre-wrap">
                        {msg.content}
                      </p>
                    ) : (
                      <>
                        {msg.isError && (
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 mb-1">
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>Thông báo sự cố</span>
                          </div>
                        )}
                        {renderFormattedText(msg.content)}
                      </>
                    )}
                  </div>

                  {/* Interactive Action Buttons attached to assistant message */}
                  {!isUser && msg.actions && msg.actions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-0.5 max-w-[90%]">
                      {msg.actions.map((act, actIdx) => (
                        <button
                          key={actIdx}
                          type="button"
                          onClick={() => {
                            if (act.type === 'view_room') {
                              onViewRoomDetail(act.roomId);
                            }
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl border border-blue-200 transition-colors shadow-2xs hover:shadow-xs active:scale-95 cursor-pointer"
                        >
                          <Building2 className="w-3.5 h-3.5 text-blue-600" />
                          <span>{act.label}</span>
                          <ArrowRight className="w-3 h-3 text-blue-500" />
                        </button>
                      ))}
                    </div>
                  )}

                  <span className="text-[10px] text-slate-400 px-1 font-medium">
                    {msg.timestamp}
                  </span>
                </div>
              );
            })}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex items-start gap-2 animate-in fade-in duration-200">
                <div className="w-7 h-7 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-white border border-slate-200/90 rounded-2xl rounded-tl-xs px-4 py-3 shadow-2xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                    <span className="text-[11px] text-slate-400 font-medium ml-2">
                      Trợ lý đang phản hồi...
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Footer Input Area */}
          <div className="p-3 bg-white border-t border-slate-100 shrink-0 space-y-1.5">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Hỏi về phòng, đặt cọc 500k, lịch hẹn..."
                disabled={isLoading}
                maxLength={400}
                className="flex-1 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden transition-all"
              />
              <button
                type="button"
                onClick={() => handleSendMessage()}
                disabled={!inputMessage.trim() || isLoading}
                aria-label="Gửi tin nhắn"
                className="w-10 h-10 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 text-white disabled:text-slate-400 flex items-center justify-center transition-colors shadow-sm cursor-pointer disabled:cursor-not-allowed shrink-0 active:scale-95"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center justify-between px-1 text-[10px] text-slate-400 font-medium">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-500" />
                Dữ liệu phòng xác thực từ HostelHub
              </span>
              <span>{inputMessage.length}/400</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
