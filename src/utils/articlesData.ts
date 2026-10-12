import { Article } from '../views/GuideDetailView';

export const ARTICLES_DATA: Article[] = [
  // =========================================================================
  // 1. KINH NGHIỆM THUÊ PHÒNG
  // =========================================================================
  {
    Id: 'art_1',
    TieuDe: '10 Kinh Nghiệm Thuê Phòng Trọ Hay Không Nên Bỏ Qua Cho Tân Sinh Viên',
    Tag: 'Kinh nghiệm thuê phòng',
    MoTaNgan: 'Tại các đô thị lớn như Hà Nội, nhu cầu thuê trọ luôn ở mức rất cao. Việc tìm thuê phòng trọ đối với sinh viên cần đặc biệt lưu ý kiểm tra vị trí, giá cả và tính pháp lý.',
    TacGia: 'Ban Quản trị HostelHub',
    ThoiGianDoc: '5 phút đọc',
    NgayDang: '03/10/2026',
    HinhAnh: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80',
    HinhAnhPhu: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1000&q=80',
    NoiDung1: `Việc tìm một phòng trọ ưng ý chưa bao giờ là điều dễ dàng, nhất là đối với các bạn sinh viên lần đầu xa nhà lên thành phố lớn. Một quyết định vội vàng có thể dẫn đến việc phải sống trong một không gian ẩm mốc, thiếu an toàn hoặc chịu những chi phí dịch vụ trên trời.

Đầu tiên, bạn cần xác định ngân sách hàng tháng cho tiền trọ chỉ nên chiếm tối đa 30% tổng chi phí sinh hoạt. Khoảng cách lý tưởng từ phòng trọ đến trường đại học nên nằm trong bán kính 3km hoặc thuận tiện gần các tuyến xe buýt nhanh, đường sắt trên cao để tiết kiệm thời gian di chuyển.`,
    NoiDung2: `Thứ hai, hãy luôn đi khảo sát thực tế phòng trọ vào hai khung thời gian khác nhau: ban ngày (để kiểm tra độ thông thoáng, ánh sáng tự nhiên, tường có ẩm mốc hay không) và buổi tối (để nắm bắt tình hình an ninh trật tự xung quanh, tiếng ồn từ các hộ dân lân cận).

Cuối cùng, trước khi đặt bút ký hợp đồng hoặc chuyển tiền đặt cọc, bắt buộc phải chụp ảnh lưu lại chỉ số công tơ điện, đồng hồ nước và kiểm tra căn cước công dân chính chủ của bên cho thuê để đảm bảo quyền lợi pháp lý.`
  },
  {
    Id: 'art_2',
    TieuDe: 'Checklist Khảo Sát Phòng Trọ & Kiểm Tra Cơ Sở Vật Chất Ngày Đầu',
    Tag: 'Kinh nghiệm thuê phòng',
    MoTaNgan: 'Quy trình kiểm tra áp lực nước, kiểm tra cục nóng điều hòa, chống thấm tường và đo kiểm đường truyền internet trước khi dọn vào.',
    TacGia: 'Cố vấn HostelHub',
    ThoiGianDoc: '5 phút đọc',
    NgayDang: '25/09/2026',
    HinhAnh: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    HinhAnhPhu: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1000&q=80',
    NoiDung1: `Rất nhiều bạn sinh viên khi xem phòng chỉ nhìn qua loa tổng thể mà quên kiểm tra các chi tiết kỹ thuật cốt lõi. Hãy dành ít nhất 20 phút để kiểm tra áp lực nước xả ở bồn cầu và vòi hoa sen, đồng thời bật thử bình nóng lạnh để kiểm tra rơ-le ngắt điện.`,
    NoiDung2: `Đối với điều hòa nhiệt độ, bật máy ở chế độ làm lạnh và nghe xem quạt gió cục nóng có gây tiếng ồn rung tường hay không. Mọi vết ố tường do ngấm ẩm hay chốt khóa cửa lỏng lẻo đều cần yêu cầu chủ nhà sửa chữa trước khi nhận bàn giao.`
  },
  {
    Id: 'art_3',
    TieuDe: 'Kinh Nghiệm Thuê Trọ Mùa Mưa Hà Nội: Tránh Ngập Úng & Ẩm Mốc',
    Tag: 'Kinh nghiệm thuê phòng',
    MoTaNgan: 'Cách tra cứu tuyến đường trũng ngập lụt, kiểm tra độ cao nền nhà xe và hệ thống thoát nước quanh khu vực Cầu Giấy, Đống Đa, Hà Đông.',
    TacGia: 'Ban Quản trị HostelHub',
    ThoiGianDoc: '5 phút đọc',
    NgayDang: '12/08/2026',
    HinhAnh: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=1200&q=80',
    HinhAnhPhu: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1000&q=80',
    NoiDung1: `Hà Nội vào mùa mưa bão thường xuyên xảy ra tình trạng ngập úng diện rộng. Việc thuê phải phòng ở tầng thấp hoặc trong các con ngõ trũng sẽ khiến việc đi học, dắt xe và sinh hoạt trở thành nỗi ám ảnh lớn.`,
    NoiDung2: `Trước khi cọc, bạn nên hỏi thăm các quán nước đầu ngõ xem khi mưa lớn nước có tràn vào sân hay không. Đối với các căn phòng tầng 1, hãy chọn nhà có gác xép hoặc sàn nâng cao hơn mặt ngõ tối thiểu 20cm.`
  },

  // =========================================================================
  // 2. KINH NGHIỆM CHO THUÊ
  // =========================================================================
  {
    Id: 'art_4',
    TieuDe: 'Bí Quyết Quản Lý Nhà Trọ Sinh Viên Văn Minh & Kín Phòng Nhanh',
    Tag: 'Kinh nghiệm cho thuê',
    MoTaNgan: 'Cách quản lý giờ giấc, chọn lọc khách thuê trọ có ý thức văn minh và hạn chế tối đa tình trạng nợ tiền phòng kéo dài.',
    TacGia: 'Ban Quản trị HostelHub',
    ThoiGianDoc: '6 phút đọc',
    NgayDang: '08/10/2026',
    HinhAnh: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80',
    HinhAnhPhu: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1000&q=80',
    NoiDung1: `Quản lý nhà trọ sinh viên đòi hỏi sự dung hòa giữa đảm bảo an ninh trật tự và tạo môi trường thoải mái cho người thuê. Việc lắp đặt khóa cửa vân tay hoặc thẻ từ thông minh tại cổng chung giúp chủ nhà không phải thức khuya mở cửa mà vẫn kiểm soát được người ra vào.`,
    NoiDung2: `Hãy thiết lập ngày thu tiền cố định (từ ngày 1 đến ngày 5 hàng tháng) và áp dụng quy chế thưởng trừ rõ ràng. Khi khách thuê cảm thấy được tôn trọng và môi trường sống yên tĩnh, tỷ lệ trả phòng đột ngột sẽ giảm đáng kể.`
  },
  {
    Id: 'art_5',
    TieuDe: 'Kỹ Năng Chụp Ảnh Phòng & Soạn Bài Đăng Hút Khách Trên Nền Tảng Online',
    Tag: 'Kinh nghiệm cho thuê',
    MoTaNgan: 'Hướng dẫn lựa chọn góc chụp đón ánh sáng tự nhiên, quay video thực tế và niêm yết rõ ràng biểu phí dịch vụ sinh hoạt.',
    TacGia: 'Cố vấn HostelHub',
    ThoiGianDoc: '4 phút đọc',
    NgayDang: '02/10/2026',
    HinhAnh: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
    HinhAnhPhu: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1000&q=80',
    NoiDung1: `Hình ảnh thực tế, sáng sủa và không qua chỉnh sửa bóp méo là yếu tố quyết định người thuê có nhấc máy liên hệ hay không. Bạn nên dọn phòng gọn gàng, mở hết rèm cửa đón ánh sáng tự nhiên và chụp từ góc thấp chéo phòng để lấy trọn không gian.`,
    NoiDung2: `Trong bài đăng, hãy ghi chi tiết các khoản chi phí: giá điện (theo số hoặc bậc), nước, phí mạng, gửi xe và tình trạng trang thiết bị sẵn có. Tính minh bạch sẽ xây dựng niềm tin lớn ngay từ lần đọc tin đầu tiên.`
  },
  {
    Id: 'art_6',
    TieuDe: 'Quy Trình Khai Báo Tạm Trú Cho Khách Thuê & Tránh Bị Xử Phạt Hành Chính',
    Tag: 'Kinh nghiệm cho thuê',
    MoTaNgan: 'Hướng dẫn chủ trọ thực hiện đăng ký thông tin lưu trú trực tuyến qua Cổng Dịch vụ công Quản lý cư trú và ứng dụng VNeID.',
    TacGia: 'Luật sư cộng tác',
    ThoiGianDoc: '5 phút đọc',
    NgayDang: '22/09/2026',
    HinhAnh: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=80',
    HinhAnhPhu: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=1000&q=80',
    NoiDung1: `Chủ nhà cho thuê trọ có trách nhiệm hướng dẫn hoặc trực tiếp đăng ký tạm trú cho khách thuê trong vòng 30 ngày kể từ ngày chuyển đến. Việc chậm trễ khai báo có thể bị xử phạt hành chính theo Nghị định hiện hành.`,
    NoiDung2: `Hiện nay, chủ nhà có thể tạo hồ sơ cơ sở cho thuê trên Cổng dịch vụ công của Bộ Công an, giúp khách thuê tự nộp hồ sơ trực tuyến rất thuận tiện mà không cần phải photo giấy tờ ra trụ sở công an phường.`
  },

  // =========================================================================
  // 3. CẢNH BÁO LỪA ĐẢO ĐẶT CỌC
  // =========================================================================
  {
    Id: 'art_7',
    TieuDe: 'Cảnh Giác Các Thủ Đoạn Lừa Cọc Phòng Trọ Sinh Viên Đầu Năm Học',
    Tag: 'Cảnh báo lừa đảo đặt cọc',
    MoTaNgan: 'Tổng hợp các chiêu trò giả danh chủ nhà trọ yêu cầu chuyển cọc giữ chỗ qua mạng xã hội khi chưa ký hợp đồng và các biện pháp tự bảo vệ.',
    TacGia: 'Cố vấn HostelHub',
    ThoiGianDoc: '5 phút đọc',
    NgayDang: '28/09/2026',
    HinhAnh: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80',
    HinhAnhPhu: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1000&q=80',
    NoiDung1: `Thời điểm đầu các kỳ nhập học luôn là giai đoạn nở rộ của các chiêu trò lừa đảo đặt cọc phòng trọ hướng tới các bạn tân sinh viên chưa có nhiều kinh nghiệm xã hội.

Chiêu thức phổ biến nhất là đăng tin phòng đẹp lung linh tại các quận trung tâm nhưng giá chỉ từ 1 đến 1.5 triệu đồng. Sau khi sinh viên nhắn tin, kẻ gian sẽ dựng lên kịch bản: "Đang có nhiều người chuẩn bị qua đặt tiền, em muốn giữ phòng thì chuyển khoản cọc trước 500k - 1 triệu". Ngay khi nhận được tiền, số điện thoại và tin nhắn sẽ bị chặn toàn bộ.`,
    NoiDung2: `Một thủ đoạn tinh vi khác là kẻ lừa đảo chỉ thuê phòng ngắn hạn theo ngày, sau đó giả mạo làm chủ nhà chính chủ để dẫn nhiều người đến xem và thu tiền cọc cùng lúc rồi biến mất.

Quy tắc bất di bất dịch: Tuyệt đối không chuyển bất kỳ khoản cọc nào qua tài khoản cá nhân khi chưa trực tiếp gặp mặt kiểm tra căn cước công dân và xác minh quyền sở hữu của người cho thuê.`
  },
  {
    Id: 'art_8',
    TieuDe: 'Cảnh Báo Bẫy "Phí Dịch Vụ Mập Mờ" Và Chiêu Trò Ép Giá Sau Khi Ở',
    Tag: 'Cảnh báo lừa đảo đặt cọc',
    MoTaNgan: 'Giá phòng rẻ nhưng tiền vệ sinh, thang máy, máy giặt, rác thải cộng dồn lên cả triệu đồng mỗi tháng - chiêu trò tăng giá trá hình của chủ trọ kém uy tín.',
    TacGia: 'Cố vấn HostelHub',
    ThoiGianDoc: '4 phút đọc',
    NgayDang: '20/08/2026',
    HinhAnh: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&q=80',
    HinhAnhPhu: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=1000&q=80',
    NoiDung1: `Nhiều sinh viên mừng rỡ vì tìm được phòng trọ 2 triệu đồng/tháng, nhưng đến kỳ thanh toán đầu tiên ngã ngửa khi hóa đơn lên tới hơn 3.5 triệu đồng vì các chi phí dịch vụ phát sinh vô lý.`,
    NoiDung2: `Các khoản phí thường bị mập mờ bao gồm: phí dọn vệ sinh chung tính theo đầu người thay vì theo phòng, phí thang máy tính theo lượt, phí gửi xe máy thứ hai và tiền điện chiếu sáng hành lang. Hãy yêu cầu phụ lục hợp đồng ghi rõ cam kết không phát sinh phụ phí.`
  },
  {
    Id: 'art_9',
    TieuDe: 'Top 5 Thủ Đoạn Lừa Đảo Qua Group Mạng Xã Hội Sinh Viên Cần Tránh',
    Tag: 'Cảnh báo lừa đảo đặt cọc',
    MoTaNgan: 'Nick ảo đăng phòng studio giá hời, giả danh người thuê chuyển nhượng cọc, link khảo sát chứa mã độc chiếm đoạt tài khoản.',
    TacGia: 'Cố vấn HostelHub',
    ThoiGianDoc: '5 phút đọc',
    NgayDang: '08/08/2026',
    HinhAnh: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80',
    HinhAnhPhu: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1000&q=80',
    NoiDung1: `Các hội nhóm mạng xã hội là địa bàn hoạt động mạnh nhất của các đối tượng lừa đảo. Thủ đoạn mới xuất hiện là tạo tin đăng nhượng lại phòng đẹp giá rẻ vì "phải về quê gấp", yêu cầu chuyển khoản tiền cọc hợp đồng cho người thuê cũ mà không cần gặp mặt chủ nhà.`,
    NoiDung2: `Nguy hiểm hơn, kẻ gian còn gửi link giả mạo cổng thông tin phòng trọ nhằm đánh cắp mã OTP ngân hàng. Hãy cảnh giác với mọi đường link lạ yêu cầu đăng nhập thông tin cá nhân.`
  },

  // =========================================================================
  // 4. MẸO TIẾT KIỆM & DECOR PHÒNG
  // =========================================================================
  {
    Id: 'art_10',
    TieuDe: 'Bí Quyết Decor Phòng Trọ Nhỏ Đẹp Tiết Kiệm Dưới 500k Cho Sinh Viên',
    Tag: 'Mẹo tiết kiệm & Decor phòng',
    MoTaNgan: 'Gợi ý sắm kệ treo đồ thông minh, thảm nỉ, đèn led decor ấm cúng và cách tối ưu diện tích sàn phòng trọ 15-20m2.',
    TacGia: 'Đội Decor HostelHub',
    ThoiGianDoc: '5 phút đọc',
    NgayDang: '10/09/2026',
    HinhAnh: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200&q=80',
    HinhAnhPhu: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1000&q=80',
    NoiDung1: `Không gian phòng trọ sinh viên thường có diện tích khiêm tốn từ 15 đến 25m2, nhưng chỉ với ngân sách dưới 500.000đ và một chút khéo léo, bạn hoàn toàn có thể biến căn phòng đơn điệu thành một không gian ấm cúng, truyền cảm hứng học tập.
Bí quyết đầu tiên là tận dụng không gian thẳng đứng: sử dụng kệ dán tường không khoan đục, giỏ treo sau cửa và hộp lưu trữ nhiều tầng dưới gầm bàn học để giải phóng tối đa diện tích mặt sàn.`,
    NoiDung2: `Bí quyết thứ hai là ánh sáng và màu sắc: một dải đèn LED vàng ấm, tấm thảm chân nỉ và tranh dán tường họa tiết tối giản sẽ làm căn phòng trông rộng rãi và thoáng đãng hơn hẳn. Hãy ưu tiên các vật dụng có tính cơ động cao để dễ dàng tháo dỡ khi chuyển trọ.`
  },
  {
    Id: 'art_11',
    TieuDe: 'Mẹo Sử Dụng Điều Hòa & Bình Nóng Lạnh Giảm Nửa Tiền Điện Hàng Tháng',
    Tag: 'Mẹo tiết kiệm & Decor phòng',
    MoTaNgan: 'Cài đặt nhiệt độ điều hòa hợp lý 26-28 độ kèm quạt nhỏ, ngắt cầu dao bình nóng lạnh sau khi bật 15 phút giúp tiết kiệm hàng trăm nghìn tiền điện.',
    TacGia: 'Cố vấn HostelHub',
    ThoiGianDoc: '4 phút đọc',
    NgayDang: '16/08/2026',
    HinhAnh: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80',
    HinhAnhPhu: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80',
    NoiDung1: `Giá điện sinh hoạt tại các khu nhà trọ thường dao động từ 3.500đ đến 4.500đ/số (kWh), khiến tiền điện trở thành một gánh nặng lớn mỗi tháng nếu không biết cách dùng khoa học.
Đối với điều hòa, bạn nên duy trì mức nhiệt từ 26 - 28 độ C kết hợp quạt gió nhỏ, vừa đủ mát sâu vừa tiết kiệm tới 30% lượng điện tiêu thụ so với việc hạ xuống 18 - 20 độ C.`,
    NoiDung2: `Đối với bình nóng lạnh, chỉ nên bật cầu dao trước khi tắm khoảng 15 - 20 phút rồi tắt hẳn cầu dao khi bước vào phòng tắm vừa tiết kiệm điện vừa đảm bảo an toàn tuyệt đối chống rò rỉ điện. Hãy tập thói quen rút phích cắm sạc laptop, ấm siêu tốc khi không sử dụng.`
  },
  {
    Id: 'art_12',
    TieuDe: 'Checklist Mua Sắm Đồ Gia Dụng Tiết Kiệm Khi Mới Chuyển Vào Trọ',
    Tag: 'Mẹo tiết kiệm & Decor phòng',
    MoTaNgan: 'Những món đồ thiết yếu cần mua ngay và những món nên mua thanh lý lại từ các anh chị khóa trên để tối ưu chi phí ban đầu.',
    TacGia: 'Ban Quản trị HostelHub',
    ThoiGianDoc: '5 phút đọc',
    NgayDang: '25/07/2026',
    HinhAnh: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
    HinhAnhPhu: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=1000&q=80',
    NoiDung1: `Những ngày đầu chuyển vào ở trọ, nhiều bạn sinh viên có tâm lý mua sắm ồ ạt dẫn đến lãng phí tiền bạc vào những món đồ ít khi dùng tới.
Hãy ưu tiên các món tối cần thiết trước: chăn ga đệm, ấm siêu tốc, nồi cơm điện nhỏ và bộ đồ vệ sinh phòng.`,
    NoiDung2: `Với các vật dụng lớn như tủ lạnh mini, giá sách, bàn học, hãy tìm trên các nhóm pass đồ cũ sinh viên cùng trường để mua lại với giá chỉ bằng 30-50% giá gốc.`
  }
];