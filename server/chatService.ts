import { GoogleGenAI } from '@google/genai';
import { readDb, PhongTro } from './db.js';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface RoomAction {
  type: 'view_room';
  roomId: string;
  label: string;
}

export interface ChatResponse {
  success: boolean;
  reply: string;
  actions?: RoomAction[];
  error?: string;
}

// Build system context with platform knowledge and real database rooms
export function buildSystemPrompt(userRole: string | null, userName?: string): string {
  const db = readDb();
  const rooms = db.rooms || [];
  
  // Filter active and public rooms
  const activeRooms = rooms.filter(
    (r) => r.TrangThai === 'Còn phòng' || r.TrangThai === 'Công khai' || r.TrangThai === 'Đã cọc'
  );

  const roomsContext = activeRooms.map((r, idx) => {
    return `${idx + 1}. [MÃ: ${r.Id}] "${r.TieuDe}"
- Địa chỉ: ${r.DiaChi}, ${r.QuanHuyen}
- Giá thuê: ${r.GiaThue.toLocaleString('vi-VN')} đ/tháng | Diện tích: ${r.DienTich} m²
- Tiện ích: ${(r.TienIch || []).join(', ')}
- Trạng thái: ${r.TrangThai}
- Chủ trọ: ${r.ChuTroTen} (SĐT: ${r.ChuTroSdt})`;
  }).join('\n\n');

  return `Bạn là Trợ lý AI thông minh của nền tảng thuê trọ HostelHub (HostelHub AI Assistant).
Nhiệm vụ của bạn là hỗ trợ tư vấn người dùng tìm phòng, giải thích quy trình, chính sách nền tảng và hướng dẫn thao tác.

### THÔNG TIN NGƯỜI DÙNG HIỆN TẠI:
- Vai trò: ${userRole ? userRole : 'Khách vãng lai (Chưa đăng nhập)'}
- Tên người dùng: ${userName || 'Bạn'}

### QUY TẮC BẮT BUỘC THEO VAI TRÒ:
1. Sinh viên (SinhVien):
   - Có thể: Tìm kiếm và lọc phòng, xem chi tiết, so sánh phòng, lưu danh sách yêu thích, đặt lịch hẹn xem phòng, đặt cọc giữ chỗ (500.000 VNĐ), quản lý lịch sử đặt cọc/lịch hẹn.
   - KHÔNG THỂ: Sinh viên KHÔNG thể đăng tin cho thuê phòng trọ. Nếu sinh viên hỏi "sao tôi không đăng được tin", hãy giải thích tính năng đăng tin dành riêng cho tài khoản Chủ trọ.

2. Chủ trọ (ChuTro):
   - Có thể: Đăng tin phòng trọ mới (cần Quản trị viên duyệt), chỉnh sửa thông tin phòng, cập nhật trạng thái Còn phòng / Hết phòng, tiếp nhận hoặc từ chối lịch hẹn xem phòng, xác nhận tiếp nhận hoặc từ chối yêu cầu đặt cọc.
   - KHÔNG THỂ: Chủ trọ không thể tự đặt phòng của chính mình.

3. Quản trị viên (Admin):
   - Có thể: Kiểm duyệt tin đăng phòng trọ mới, quản lý tài khoản người dùng (khóa/mở khóa), giám sát tổng quan giao dịch cọc và lịch hẹn.

4. Khách vãng lai (Chưa đăng nhập):
   - Có thể xem danh sách phòng công khai, xem chi tiết, so sánh phòng.
   - Cần ĐĂNG KÝ hoặc ĐĂNG NHẬP để đặt lịch hẹn xem phòng hoặc đặt cọc giữ chỗ.

### QUY TRÌNH NỀN TẢNG VÀ CHÍNH SÁCH BẢO ĐẢM:
- **Tìm phòng**: Lọc theo khu vực/quận huyện, mức giá ngân sách, diện tích, tiện ích (máy lạnh, máy giặt, gác lửng, ban công, giờ tự do...).
- **Đặt lịch hẹn xem phòng**: Sinh viên chọn ngày giờ xem phòng trực tiếp. ĐIỀU KIỆN QUAN TRỌNG: Tuyệt đối không được chọn thời gian trong quá khứ! Chủ trọ sẽ nhận được thông báo để Xác nhận hoặc Hủy kèm lý do.
- **Đặt cọc giữ chỗ**:
  - Số tiền cọc giữ chỗ chuẩn trên hệ thống: **500.000 VNĐ**.
  - Tiền cọc được tạm giữ trong ví bảo đảm hệ thống trong thời hạn 48 giờ để bảo vệ sinh viên, không chuyển trực tiếp ngay cho chủ trọ.
- **Chính sách hoàn cọc 100%**:
  - Nếu yêu cầu đặt cọc bị chủ trọ từ chối hoặc hủy, sinh viên được **HOÀN TIỀN CỌC 100% (500.000 VNĐ)** về số dư ví ngay lập tức, không mất phí.
  - Nếu phòng thực tế sai lệch nghiêm trọng so với tin đăng, sinh viên có thể khiếu nại để nhận hoàn cọc.
- **Quy trình duyệt tin đăng**: Tin đăng mới của chủ trọ ở trạng thái "Chờ duyệt", Admin sẽ kiểm duyệt trong vòng 24h để đảm bảo thông tin chính xác, phòng thật giá thật.

### DỮ LIỆU PHÒNG TRỌ THỰC TẾ TRÊN HỆ THỐNG HIỆN TẠI (DATABASE):
${roomsContext}

### QUY TẮC TRẢ LỜI:
1. TRẢ LỜI DỰA TRÊN DỮ LIỆU THẬT: Khi người dùng hỏi về phòng trọ (ví dụ: phòng dưới 2 triệu, phòng ở Cầu Giấy, phòng có điều hòa...), BẮT BUỘC chỉ gợi ý các phòng có trong danh sách database thực tế ở trên. Tuyệt đối không bịa đặt tên phòng, địa chỉ hoặc giá cả không có thật.
2. ĐỀ XUẤT HÀNH ĐỘNG NÚT BẤM: Khi nhắc đến hoặc gợi ý một phòng cụ thể trong danh sách, hãy chèn cú pháp: \`[ACTION_VIEW_ROOM:id_phòng:Tên ngắn gọn]\` ngay trong câu trả lời (hoặc ở cuối câu) để hệ thống tự động tạo nút "Xem phòng này" cho người dùng bấm vào xem ngay!
   Ví dụ:
   - "Bạn có thể tham khảo phòng Ký túc xá Cầu Giấy với giá chỉ 1.200.000 đ/tháng. [ACTION_VIEW_ROOM:room_1:Xem phòng Ký túc xá Cầu Giấy]"
3. GIỚI HẠN ĐỘ DÀI: Câu trả lời cần ngắn gọn, rõ ràng, định dạng bullet point súc tích, tối đa khoảng 150 - 250 từ. Tránh trả lời dài dòng gây rối giao diện chat.
4. CÂU HỎI NGOÀI PHẠM VI: Nếu câu hỏi không liên quan đến thuê trọ, phòng trọ, sinh viên, chính sách HostelHub (ví dụ lập trình, thời tiết, giải trí...), hãy lịch sự từ chối: "Tôi là trợ lý AI chuyên hỗ trợ các vấn đề thuê phòng và dịch vụ tại HostelHub. Tôi chưa hỗ trợ câu hỏi ngoài phạm vi này, bạn vui lòng liên hệ admin nếu cần thêm thông tin nhé!".
5. Luôn giữ thái độ thân thiện, nhiệt tình, xưng hô "mình" hoặc "HostelHub AI" và "bạn".`;
}

// Fallback rule-based answering engine when external AI API is unavailable
export function generateLocalFallbackReply(
  userQuery: string,
  userRole: string | null,
  userName?: string
): { reply: string; actions: RoomAction[] } {
  const query = userQuery.toLowerCase().trim();
  const db = readDb();
  const rooms = db.rooms || [];
  const actions: RoomAction[] = [];

  // 1. Phí đặt cọc / Giữ chỗ / Hoàn cọc
  if (
    query.includes('đặt cọc') ||
    query.includes('hoàn cọc') ||
    query.includes('tiền cọc') ||
    query.includes('phí giữ chỗ') ||
    query.includes('giữ chỗ')
  ) {
    return {
      reply: `📌 **Chính sách Đặt cọc & Hoàn cọc tại HostelHub:**\n\n` +
        `• **Số tiền cọc chuẩn:** Mặc định **500.000 VNĐ** cho một yêu cầu giữ chỗ (thời hạn 48 giờ).\n` +
        `• **Bảo đảm an toàn:** Tiền cọc được giữ trong ví ký quỹ của HostelHub, chưa chuyển cho chủ trọ cho đến khi bạn xác nhận.\n` +
        `• **Hoàn cọc 100%:** Nếu chủ trọ từ chối hoặc hủy yêu cầu, bạn được hoàn lại **100% tiền cọc (500.000 VNĐ)** về ví tài khoản ngay lập tức!\n\n` +
        (userRole === 'SinhVien'
          ? `👉 Bạn có thể vào chi tiết phòng muốn thuê và bấm **"Đặt cọc giữ chỗ"** nhé!`
          : userRole === 'ChuTro'
          ? `👉 Với vai trò Chủ trọ, bạn có thể xem và xác nhận yêu cầu cọc của sinh viên trong mục **"Quản lý lịch hẹn & cọc"**.`
          : `👉 Bạn cần đăng nhập tài khoản Sinh viên để tiến hành đặt cọc giữ chỗ.`),
      actions: [],
    };
  }

  // 2. Đặt lịch hẹn xem phòng
  if (query.includes('lịch hẹn') || query.includes('xem phòng') || query.includes('hẹn gặp')) {
    return {
      reply: `📅 **Quy trình Đặt lịch hẹn xem phòng:**\n\n` +
        `1. Vào trang chi tiết phòng bạn ưng ý.\n` +
        `2. Bấm nút **"Đặt lịch xem phòng"**.\n` +
        `3. Chọn ngày & giờ hẹn (Lưu ý: Không được chọn thời gian trong quá khứ).\n` +
        `4. Chủ trọ sẽ nhận được thông báo để xác nhận lịch hẹn kèm SĐT liên hệ trực tiếp.\n\n` +
        `💡 Tính năng này hoàn toàn **miễn phí** giúp bạn trực tiếp kiểm tra phòng trước khi quyết định!`,
      actions: [],
    };
  }

  // 3. Đăng tin phòng trọ (Chủ trọ)
  if (query.includes('đăng tin') || query.includes('cho thuê') || query.includes('chủ trọ')) {
    if (userRole === 'SinhVien') {
      return {
        reply: `⚠️ **Lưu ý:** Tài khoản của bạn hiện là **Sinh viên**, chức năng đăng tin cho thuê phòng chỉ dành riêng cho **Chủ trọ**.\n\n` +
          `Nếu bạn có nhu cầu đăng tin cho thuê, bạn vui lòng đăng ký một tài khoản mới với vai trò là **Chủ trọ (ChuTro)** nhé!`,
        actions: [],
      };
    }
    return {
      reply: `🏠 **Hướng dẫn Đăng tin cho thuê phòng (Dành cho Chủ trọ):**\n\n` +
        `1. Nhấn vào mục **"Đăng tin mới"** trên thanh điều hướng.\n` +
        `2. Điền đầy đủ thông tin: Tiêu đề, địa chỉ, quận huyện, giá thuê, giá điện nước, diện tích và tiện ích.\n` +
        `3. Thêm hình ảnh thực tế phòng trọ rõ nét.\n` +
        `4. Bấm **"Gửi duyệt"** — Ban quản trị Admin sẽ duyệt tin trong vòng 24h để đảm bảo an toàn cho cộng đồng sinh viên!`,
      actions: [],
    };
  }

  // 4. Tìm phòng theo giá dưới 2 triệu / giá rẻ / tìm phòng
  const priceMatches = query.match(/dưới\s*([0-9.,]+)\s*(triệu|tr|k)?/i) || query.match(/([0-9.,]+)\s*(triệu|tr)/i);
  let maxPriceBudget = 0;
  if (query.includes('dưới 2') || query.includes('2 triệu') || query.includes('2tr')) {
    maxPriceBudget = 2000000;
  } else if (query.includes('dưới 3') || query.includes('3 triệu') || query.includes('3tr')) {
    maxPriceBudget = 3000000;
  } else if (query.includes('dưới 4') || query.includes('4 triệu') || query.includes('4tr')) {
    maxPriceBudget = 4000000;
  } else if (query.includes('giá rẻ')) {
    maxPriceBudget = 2500000;
  }

  // District filter
  let districtFilter = '';
  if (query.includes('cầu giấy')) districtFilter = 'Cầu Giấy';
  else if (query.includes('từ liêm')) districtFilter = 'Từ Liêm';
  else if (query.includes('đống đa')) districtFilter = 'Đống Đa';
  else if (query.includes('thủ đức')) districtFilter = 'Thủ Đức';
  else if (query.includes('quận 10')) districtFilter = 'Quận 10';

  // Amenity filter
  let hasAc = query.includes('điều hòa') || query.includes('máy lạnh');
  let hasWm = query.includes('máy giặt');

  const isRoomSearch =
    maxPriceBudget > 0 ||
    Boolean(districtFilter) ||
    hasAc ||
    hasWm ||
    query.includes('phòng') ||
    query.includes('trọ') ||
    query.includes('thuê') ||
    query.includes('tìm') ||
    query.includes('giá');

  if (isRoomSearch) {
    let matchingRooms = rooms.filter((r) => {
      if (r.TrangThai !== 'Còn phòng' && r.TrangThai !== 'Công khai') return false;
      if (maxPriceBudget > 0 && r.GiaThue > maxPriceBudget) return false;
      if (districtFilter && !r.QuanHuyen.toLowerCase().includes(districtFilter.toLowerCase())) return false;
      if (hasAc && !(r.TienIch || []).some((t) => t.toLowerCase().includes('điều hòa') || t.toLowerCase().includes('máy lạnh'))) return false;
      if (hasWm && !(r.TienIch || []).some((t) => t.toLowerCase().includes('máy giặt'))) return false;
      return true;
    });

    if (matchingRooms.length > 0) {
      const topRooms = matchingRooms.slice(0, 3);
      let replyText = `🎉 HostelHub tìm thấy **${matchingRooms.length} phòng** phù hợp với yêu cầu của bạn:\n\n`;
      topRooms.forEach((r, idx) => {
        replyText += `**${idx + 1}. ${r.TieuDe}**\n` +
          `• 📍 Khu vực: ${r.DiaChi}, ${r.QuanHuyen}\n` +
          `• 💵 Giá thuê: **${r.GiaThue.toLocaleString('vi-VN')} đ/tháng** (${r.DienTich} m²)\n` +
          `• 🌟 Tiện ích: ${(r.TienIch || []).slice(0, 4).join(', ')}\n\n`;
        actions.push({
          type: 'view_room',
          roomId: r.Id,
          label: `Xem phòng: ${r.TieuDe.length > 30 ? r.TieuDe.substring(0, 30) + '...' : r.TieuDe}`,
        });
      });
      replyText += `Bạn có thể bấm vào nút bên dưới để xem chi tiết phòng và đặt lịch hẹn xem trực tiếp nhé!`;
      return { reply: replyText, actions };
    } else {
      // If filtered but no exact match, show lowest priced rooms
      const available = rooms.filter((r) => r.TrangThai === 'Còn phòng' || r.TrangThai === 'Công khai');
      available.sort((a, b) => a.GiaThue - b.GiaThue);
      const top2 = available.slice(0, 2);
      let replyText = `Hiện tại chưa có phòng chính xác 100% theo tiêu chí trên, nhưng mình gợi ý bạn 2 phòng giá tốt nhất đang còn trống:\n\n`;
      top2.forEach((r, idx) => {
        replyText += `**${idx + 1}. ${r.TieuDe}** - ${r.GiaThue.toLocaleString('vi-VN')} đ/tháng (${r.QuanHuyen})\n`;
        actions.push({
          type: 'view_room',
          roomId: r.Id,
          label: `Xem: ${r.TieuDe.substring(0, 28)}...`,
        });
      });
      return { reply: replyText, actions };
    }
  }

  // 5. Greeting / General inquiry
  const isGreeting =
    query.includes('chào') ||
    query.includes('hello') ||
    query.includes('hi') ||
    query === '' ||
    query.includes('bạn là ai') ||
    query.includes('giới thiệu') ||
    query.includes('trợ lý');

  if (isGreeting) {
    return {
      reply: `Xin chào ${userName || 'bạn'}! 👋 Tôi là Trợ lý AI của HostelHub.\n\n` +
        `Tôi có thể hỗ trợ bạn:\n` +
        `• Tìm phòng trọ theo ngân sách (vd: *"Tìm phòng dưới 2 triệu"*)\n` +
        `• Tìm phòng theo khu vực hoặc tiện ích (vd: *"Phòng ở Cầu Giấy có điều hòa"*)\n` +
        `• Giải đáp quy trình Đặt cọc 500k & Chính sách hoàn tiền 100%\n` +
        `• Hướng dẫn đặt lịch xem phòng trực tiếp\n` +
        `• Hướng dẫn chủ trọ đăng tin cho thuê phòng\n\n` +
        `Bạn cần hỗ trợ điều gì ngay bây giờ?`,
      actions: [],
    };
  }

  // 6. Out of scope / Unsupported question
  return {
    reply: `Xin lỗi bạn, mình là Trợ lý AI chuyên hỗ trợ các vấn đề về thuê phòng trọ, quy trình đặt cọc và chính sách tại HostelHub. 🤖\n\n` +
      `Câu hỏi này hiện nằm ngoài phạm vi hỗ trợ của nền tảng. Nếu bạn cần hỗ trợ thêm thông tin khác, bạn vui lòng liên hệ Ban Quản Trị hoặc chủ trọ qua thông tin liên hệ được cung cấp nhé!`,
    actions: [],
  };
}

// Extract actions from AI generated text (e.g., [ACTION_VIEW_ROOM:room_1:Xem phòng])
export function extractActionsAndCleanText(rawText: string): { cleanText: string; actions: RoomAction[] } {
  const actions: RoomAction[] = [];
  const actionRegex = /\[ACTION_VIEW_ROOM:([^:]+):([^\]]+)\]/g;
  
  let match;
  while ((match = actionRegex.exec(rawText)) !== null) {
    const roomId = match[1].trim();
    const label = match[2].trim();
    if (!actions.some((a) => a.roomId === roomId)) {
      actions.push({
        type: 'view_room',
        roomId,
        label,
      });
    }
  }

  // Also match fallback tag format like [ROOM:room_1:Xem phòng]
  const roomTagRegex = /\[ROOM:([^:]+):([^\]]+)\]/g;
  while ((match = roomTagRegex.exec(rawText)) !== null) {
    const roomId = match[1].trim();
    const label = match[2].trim();
    if (!actions.some((a) => a.roomId === roomId)) {
      actions.push({
        type: 'view_room',
        roomId,
        label,
      });
    }
  }

  // Remove the action tags from display text so user sees clean Markdown
  const cleanText = rawText
    .replace(/\[ACTION_VIEW_ROOM:[^:]+:[^\]]+\]/g, '')
    .replace(/\[ROOM:[^:]+:[^\]]+\]/g, '')
    .trim();

  return { cleanText, actions };
}

// Primary Chat Completion Handler
export async function handleChatMessage(
  messages: ChatMessage[],
  userRole: string | null,
  userName?: string
): Promise<ChatResponse> {
  const systemPrompt = buildSystemPrompt(userRole, userName);
  const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user')?.content || '';

  // 1. Check if ANTHROPIC_API_KEY is available (Claude support)
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const anthropicMessages = messages
        .filter((m) => m.role === 'user' || m.role === 'assistant')
        .map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        }));

      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-3-7-sonnet-20250219',
          max_tokens: 800,
          system: systemPrompt,
          messages: anthropicMessages,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const textBlock = data.content?.find((c: any) => c.type === 'text');
        if (textBlock && textBlock.text) {
          const { cleanText, actions } = extractActionsAndCleanText(textBlock.text);
          return { success: true, reply: cleanText, actions };
        }
      }
    } catch (anthropicErr) {
      console.warn('Anthropic API attempt failed, trying Gemini:', anthropicErr);
    }
  }

  // 2. Try Gemini API via @google/genai with robust timeout & model fallback
  if (process.env.GEMINI_API_KEY) {
    try {
      const ai = new GoogleGenAI();
      // Format chat history for Gemini contents
      const contents = messages
        .filter((m) => m.role === 'user' || m.role === 'assistant')
        .map((m) => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }],
        }));

      if (contents.length === 0) {
        contents.push({ role: 'user', parts: [{ text: 'Xin chào' }] });
      }

      // Fast, high-throughput model with fallback
      const modelsToTry = ['gemini-3.1-flash-lite', 'gemini-3.8-flash'];
      for (const modelName of modelsToTry) {
        let timerId: NodeJS.Timeout | undefined;
        try {
          const timeoutPromise = new Promise<never>((_, reject) => {
            timerId = setTimeout(() => reject(new Error('Generation timeout')), 12000);
          });

          const generatePromise = ai.models.generateContent({
            model: modelName,
            contents,
            config: {
              systemInstruction: systemPrompt,
              maxOutputTokens: 700,
              temperature: 0.3,
            },
          });

          const response = await Promise.race([generatePromise, timeoutPromise]);
          clearTimeout(timerId);

          const replyText = response.text || '';
          if (replyText.trim()) {
            const { cleanText, actions } = extractActionsAndCleanText(replyText);
            return { success: true, reply: cleanText, actions };
          }
        } catch {
          if (timerId) clearTimeout(timerId);
          // Continue to next model if available
        }
      }
    } catch {
      // Fall through to local fallback engine
    }
  }

  // 3. Robust local rule & factual database fallback
  try {
    const localResult = generateLocalFallbackReply(lastUserMessage, userRole, userName);
    return {
      success: true,
      reply: localResult.reply,
      actions: localResult.actions,
    };
  } catch (err: any) {
    console.error('All chat pipelines failed:', err);
    return {
      success: false,
      reply: 'Xin lỗi, trợ lý đang gặp sự cố, vui lòng thử lại sau.',
      error: err?.message,
    };
  }
}
