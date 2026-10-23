export interface TinOGhep {
  Id: string;
  TieuDe: string;
  GiaThue: number;
  DienTich: number;
  QuanHuyen: string;
  DiaChi: string;
  MoTa: string;
  TacGia: {
    Ten: string;
    Sdt: string;
    Zalo: string;
    NgayThamGia: string;
    TrangThai: string;
  };
  DoiTuongGhep: 'Nam' | 'Nữ' | 'Tất cả';
  NgayCapNhat: string;
  NgayDang: string;
  NgayHetHan: string;
  TienNghi: string[];
  HinhAnh: string[];
  VideoUrl?: string; // 👈 THÊM DÒNG NÀY
  TrangThaiDuyet?: 'Chờ duyệt' | 'Đã duyệt' | 'Từ chối';
}

export const mockRoommates: TinOGhep[] = [
  {
    Id: 'oghep_1',
    TieuDe: 'MÌNH CẦN TÌM BẠN NỮ Ở GHÉP KHU VỰC CẦU GIẤY',
    GiaThue: 1900000,
    DienTich: 20,
    QuanHuyen: 'Cầu Giấy',
    DiaChi: 'Số 3 Đường Nguyễn Khánh Toàn, Phường Nghĩa Đô, Cầu Giấy, Hà Nội',
    MoTa: `MÌNH CẦN TÌM BẠN NỮ Ở GHÉP KHU VỰC CẦU GIẤY
Địa chỉ: Số 3 đường Nguyễn Khánh Toàn, Phường Nghĩa Đô, Cầu Giấy, Hà Nội.
Phòng đầy đủ tiện nghi, an ninh tốt, đi lại giờ giấc tự do.
Không bị ngập khi mưa lớn.
Tổng chi phí dịch vụ tiết kiệm: Điện 3.8k/số, nước 30k/khối, mạng 100k/phòng. Ưu tiên các bạn sinh viên hòa đồng, gọn gàng và có ý thức giữ gìn vệ sinh chung.`,
    TacGia: {
      Ten: 'Thùy Tiên',
      Sdt: '0977940769',
      Zalo: '0977940769',
      NgayThamGia: '05/10/2026',
      TrangThai: 'Hoạt động vài giờ trước'
    },
    DoiTuongGhep: 'Nữ',
    NgayCapNhat: '2 ngày trước',
    NgayDang: 'Thứ 5, 08/10/2026',
    NgayHetHan: 'Thứ 2, 19/10/2026',
    TienNghi: ['Đầy đủ nội thất', 'Có gác xép', 'Có máy lạnh', 'Có máy giặt', 'Có thang máy', 'Không chung chủ'],
    HinhAnh: [
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1200&q=80'
    ],
    TrangThaiDuyet: 'Chờ duyệt' // 👈 Để Chờ duyệt test duyệt tin Admin
  },
  {
    Id: 'oghep_2',
    TieuDe: 'CHO THUÊ SLOT NAM/NỮ Ở GHÉP CAO CẤP CÁCH ĐH PHENIKAA 2KM',
    GiaThue: 1400000,
    DienTich: 35,
    QuanHuyen: 'Hà Đông',
    DiaChi: 'Ngõ 68 Phùng Hưng, Phúc La, Hà Đông, Hà Nội',
    MoTa: `Dạng phòng homestay giường tầng cao cấp, có rèm che kín đáo, bàn học và ổ cắm riêng.
Miễn phí máy giặt, tủ lạnh, bếp từ nấu ăn rộng rãi. Khu vực để xe máy có bảo vệ và camera giám sát 24/7. Rất phù hợp với các bạn sinh viên thích sự tiện nghi và tiết kiệm chi phí.`,
    TacGia: {
      Ten: 'Hải Anh',
      Sdt: '0985395016',
      Zalo: '0985395016',
      NgayThamGia: '25/09/2026',
      TrangThai: 'Hoạt động 10 phút trước'
    },
    DoiTuongGhep: 'Tất cả',
    NgayCapNhat: '1 ngày trước',
    NgayDang: 'Thứ 6, 09/10/2026',
    NgayHetHan: 'Thứ 6, 23/10/2026',
    TienNghi: ['Có máy lạnh', 'Có nóng lạnh', 'Có wifi tốc độ cao', 'Có chỗ để xe', 'Camera an ninh'],
    HinhAnh: [
      'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80'
    ],
    TrangThaiDuyet: 'Chờ duyệt' // 👈 Để Chờ duyệt test duyệt tin Admin
  },
  {
    Id: 'oghep_3',
    TieuDe: 'TÌM BẠN NAM Ở GHÉP CCMN FULL NỘI THẤT NGÕ 138 TRIỀU KHÚC',
    GiaThue: 1500000,
    DienTich: 25,
    QuanHuyen: 'Thanh Xuân',
    DiaChi: 'Số 138 Triều Khúc, Thanh Xuân Nam, Thanh Xuân, Hà Nội',
    MoTa: `Tìm 1 bạn nam ở ghép phòng khép kín, có ban công phơi đồ thoáng gió.
Phòng đã có sẵn điều hòa Inverter, bình nóng lạnh Rossi, tủ quần áo 3 cánh. Giờ giấc tự do, khóa cổng vân tay. Bạn cùng phòng hiện là sinh viên năm 3 ngoan ngoãn, không hút thuốc.`,
    TacGia: {
      Ten: 'Tuấn Anh',
      Sdt: '0912345678',
      Zalo: '0912345678',
      NgayThamGia: '01/10/2026',
      TrangThai: 'Hoạt động hôm nay'
    },
    DoiTuongGhep: 'Nam',
    NgayCapNhat: 'Hôm nay',
    NgayDang: 'Thứ 7, 10/10/2026',
    NgayHetHan: 'Thứ 7, 24/10/2026',
    TienNghi: ['Có ban công', 'Có điều hòa', 'Khóa vân tay', 'Không chung chủ', 'Có nóng lạnh'],
    HinhAnh: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80'
    ],
    TrangThaiDuyet: 'Đã duyệt'
  },
  {
    Id: 'oghep_4',
    TieuDe: 'TÌM 1 BẠN NỮ Ở GHÉP PHÒNG CHUNG CƯ MINI NGÕ 165 CHÙA BỘC',
    GiaThue: 2100000,
    DienTich: 28,
    QuanHuyen: 'Đống Đa',
    DiaChi: 'Ngõ 165 Chùa Bộc, Trung Liệt, Đống Đa, Hà Nội',
    MoTa: `Mình là sinh viên năm cuối Học viện Ngân Hàng, cần tìm thêm 1 bạn nữ ở ghép để san sẻ chi phí.
Phòng tầng 4 có thang máy, ban công cực thoáng, đầy đủ điều hòa, máy giặt riêng, tủ lạnh 2 cánh, bếp nấu ăn riêng biệt. 
Giờ giấc tự do, khóa cửa vân tay, an ninh đảm bảo. Yêu cầu bạn cùng phòng hiền lành, trung thực, giữ vệ sinh chung và không dắt bạn khác giới về phòng ngủ lại.`,
    TacGia: {
      Ten: 'Khánh Linh',
      Sdt: '0968123456',
      Zalo: '0968123456',
      NgayThamGia: '02/10/2026',
      TrangThai: 'Hoạt động 30 phút trước'
    },
    DoiTuongGhep: 'Nữ',
    NgayCapNhat: 'Hôm nay',
    NgayDang: 'Chủ nhật, 11/10/2026',
    NgayHetHan: 'Chủ nhật, 25/10/2026',
    TienNghi: ['Có thang máy', 'Có máy giặt riêng', 'Có điều hòa', 'Ban công thoáng', 'Khóa vân tay'],
    HinhAnh: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80'
    ],
    TrangThaiDuyet: 'Đã duyệt'
  },
  {
    Id: 'oghep_5',
    TieuDe: 'TÌM BẠN NAM GHÉP PHÒNG TRỌ SINH VIÊN GẦN ĐH GIAO THÔNG VẬN TẢI',
    GiaThue: 1200000,
    DienTich: 22,
    QuanHuyen: 'Ba Đình',
    DiaChi: 'Ngõ 84 Ngọc Khánh, Giảng Võ, Ba Đình, Hà Nội',
    MoTa: `Cần tìm 1 bạn nam sinh viên ở ghép phòng tầng 2 tại ngõ 84 Ngọc Khánh, cách trường ĐH GTVT khoảng 800m.
Phòng khép kín sạch sẽ, có bình nóng lạnh, quạt trần, giường đôi. Điện nước giá dân chia theo đầu người rất rẻ (khoảng 150k - 200k/tháng cả điện nước mạng).
Ưu tiên sinh viên GTVT, Ngoại Thương hoặc Ngoại Giao thật thà, hòa đồng, có xe máy có thể để tầng 1 miễn phí.`,
    TacGia: {
      Ten: 'Minh Hoàng',
      Sdt: '0971239876',
      Zalo: '0971239876',
      NgayThamGia: '28/09/2026',
      TrangThai: 'Hoạt động 1 giờ trước'
    },
    DoiTuongGhep: 'Nam',
    NgayCapNhat: '1 ngày trước',
    NgayDang: 'Thứ 7, 10/10/2026',
    NgayHetHan: 'Thứ 7, 24/10/2026',
    TienNghi: ['Giá điện nước dân', 'Có nóng lạnh', 'Không chung chủ', 'Chỗ để xe miễn phí'],
    HinhAnh: [
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80'
    ],
    TrangThaiDuyet: 'Đã duyệt'
  },
  {
    Id: 'oghep_6',
    TieuDe: 'PASS SLOT Ở GHÉP HOMESTAY CAO CẤP GẦN ĐH MỎ ĐỊA CHẤT - TÀI CHÍNH',
    GiaThue: 1350000,
    DienTich: 40,
    QuanHuyen: 'Bắc Từ Liêm',
    DiaChi: 'Đường Cổ Nhuế 2, Cổ Nhuế, Bắc Từ Liêm, Hà Nội',
    MoTa: `Mô hình Sleepbox / Homestay giường tầng cao cấp dành cho sinh viên. Mỗi người sở hữu một box riêng biệt trang bị rèm che dày dặn, đệm cao su non, đèn học, tủ khóa đồ cá nhân an toàn.
Không gian sinh hoạt chung gồm có phòng bếp trang bị tủ lạnh side-by-side, lò vi sóng, bếp điện từ và khu máy giặt sấy tự động trên tầng thượng.
Giá trọn gói 1.350.000đ/tháng đã bao gồm toàn bộ tiền phòng, điện nước sinh hoạt, wifi tốc độ cao và dịch vụ dọn vệ sinh 3 lần/tuần.`,
    TacGia: {
      Ten: 'Hệ thống StayHub',
      Sdt: '0934567890',
      Zalo: '0934567890',
      NgayThamGia: '15/09/2026',
      TrangThai: 'Đang online'
    },
    DoiTuongGhep: 'Tất cả',
    NgayCapNhat: '2 ngày trước',
    NgayDang: 'Thứ 6, 09/10/2026',
    NgayHetHan: 'Thứ 6, 30/10/2026',
    TienNghi: ['Trọn gói điện nước', 'Có máy giặt sấy', 'Dọn vệ sinh hàng tuần', 'Điều hòa 24/7', 'Camera an ninh'],
    HinhAnh: [
      'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1200&q=80'
    ],
    TrangThaiDuyet: 'Đã duyệt'
  },
  {
    Id: 'oghep_7',
    TieuDe: 'TÌM BẠN NAM GHÉP CĂN STUDIO KHÉP KÍN GẦN ĐH KINH TẾ QUỐC DÂN',
    GiaThue: 2400000,
    DienTich: 32,
    QuanHuyen: 'Hai Bà Trưng',
    DiaChi: 'Ngõ 205 Trần Đại Nghĩa, Đồng Tâm, Hai Bà Trưng, Hà Nội',
    MoTa: `Phòng Studio rộng rãi 32m2 mới bàn giao, cách cổng trường ĐH KTQD chỉ 300m đi bộ. 
Nội thất cao cấp gồm Smart TV, tủ lạnh Inverter, bàn học đôi chữ L, giường 1m8x2m và tủ quần áo kịch trần. 
Tìm 1 bạn nam sinh viên hoặc mới ra trường đi làm tính tình văn minh, lịch sự, có ý thức giữ trật tự vào buổi tối. Tiền nhà mỗi người 2.4 triệu/tháng.`,
    TacGia: {
      Ten: 'Hoàng Nam',
      Sdt: '0988776655',
      Zalo: '0988776655',
      NgayThamGia: '20/09/2026',
      TrangThai: 'Hoạt động 4 giờ trước'
    },
    DoiTuongGhep: 'Nam',
    NgayCapNhat: '3 ngày trước',
    NgayDang: 'Thứ 5, 08/10/2026',
    NgayHetHan: 'Thứ 5, 22/10/2026',
    TienNghi: ['Smart TV', 'Bàn học đôi', 'Có máy giặt', 'Điều hòa Inverter', 'Đi bộ tới trường'],
    HinhAnh: [
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80'
    ],
    TrangThaiDuyet: 'Đã duyệt'
  },
  {
    Id: 'oghep_8',
    TieuDe: 'TÌM 2 BẠN NỮ Ở GHÉP CĂN HỘ 2 NGỦ TẠI DỊCH VỌNG HẬU - CẦU GIẤY',
    GiaThue: 1750000,
    DienTich: 48,
    QuanHuyen: 'Cầu Giấy',
    DiaChi: 'Số 45 Dịch Vọng Hậu, Dịch Vọng Hậu, Cầu Giấy, Hà Nội',
    MoTa: `Căn hộ 2 phòng ngủ + 1 phòng khách rộng 48m2. Hiện tại phòng lớn đã có 2 bạn nữ ở, cần tìm thêm 2 bạn nữ chia nhau phòng ngủ thứ hai.
Tiền nhà chia đều 1.750.000đ/người. Nhà có ban công trồng cây rất đẹp, bếp riêng có hút mùi không ám mùi vào phòng ngủ, máy giặt riêng để ở ban công.
Gần các trường ĐH Sư Phạm, Quốc Gia, Ngoại Ngữ và chợ Nhà Xanh.`,
    TacGia: {
      Ten: 'Phương Thảo',
      Sdt: '0904112233',
      Zalo: '0904112233',
      NgayThamGia: '03/10/2026',
      TrangThai: 'Hoạt động hôm nay'
    },
    DoiTuongGhep: 'Nữ',
    NgayCapNhat: 'Hôm nay',
    NgayDang: 'Chủ nhật, 11/10/2026',
    NgayHetHan: 'Chủ nhật, 25/10/2026',
    TienNghi: ['Căn hộ 2 phòng ngủ', 'Khu bếp riêng biệt', 'Có máy giặt', 'Ban công cây xanh', 'Gần chợ'],
    HinhAnh: [
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80'
    ],
    TrangThaiDuyet: 'Đã duyệt'
  }
];