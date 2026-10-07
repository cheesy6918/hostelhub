import React, { useState } from 'react';
import { Users, Search, MapPin, Clock, Phone, Sparkles } from 'lucide-react';

export const RoommateView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGender, setFilterGender] = useState('all');

  const roommates = [
    {
      id: 'rm_1',
      author: 'Nguyễn Thảo Ly',
      school: 'ĐH Ngoại Thương (FTU)',
      gender: 'Nữ',
      targetPrice: '1.400.000 đ/tháng/người',
      location: 'Khu vực Chùa Láng, Đống Đa',
      timeHabit: 'Giờ giấc tự do, ngủ trước 23h30',
      note: 'Phòng đã có sẵn điều hòa, tủ lạnh, máy giặt. Cần tìm 1 bạn nữ sạch sẽ, gọn gàng, không hút thuốc.',
      phone: '0912.345.892',
      badge: 'Cần tìm 1 nữ'
    },
    {
      id: 'rm_2',
      author: 'Trần Hoàng Nam',
      school: 'ĐH Bách Khoa Hà Nội (HUST)',
      gender: 'Nam',
      targetPrice: '1.600.000 đ/tháng/người',
      location: 'Tạ Quang Bửu - Trần Đại Nghĩa, Hai Bà Trưng',
      timeHabit: 'Thức khuya học bài, không ồn ào',
      note: 'Phòng khép kín tầng 3, ban công rộng, có bếp nấu riêng. Tìm bạn nam chia tiền phòng và điện nước hàng tháng.',
      phone: '0988.765.341',
      badge: 'Cần tìm 1 nam'
    },
    {
      id: 'rm_3',
      author: 'Lê Minh Anh',
      school: 'ĐH Quốc Gia Hà Nội (VNU)',
      gender: 'Nữ',
      targetPrice: '1.200.000 đ/tháng/người',
      location: 'Ngõ 336 Nguyễn Trãi, Thanh Xuân',
      timeHabit: 'Yên tĩnh, ngăn nắp',
      note: 'Chung cư mini mới xây, khóa vân tay, gần trạm xe buýt và ga tàu điện. Tìm bạn ở ghép tính tình vui vẻ, hòa đồng.',
      phone: '0971.234.620',
      badge: 'Cần tìm 1 nữ'
    }
  ];

  const filteredRoommates = roommates.filter(r => {
    const matchSearch = r.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        r.school.toLowerCase().includes(searchQuery.toLowerCase());
    const matchGender = filterGender === 'all' || r.gender === filterGender;
    return matchSearch && matchGender;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-300">
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white mb-8 shadow-sm">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Cộng đồng kết nối</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Tìm bạn ở ghép cùng phòng</h1>
        <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
          Không gian dành riêng cho sinh viên tìm kiếm người ở chung phù hợp thói quen sinh hoạt, chia sẻ chi phí thuê phòng.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs mb-6">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo khu vực, trường ĐH..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-500 font-medium">Giới tính:</span>
          <select
            value={filterGender}
            onChange={(e) => setFilterGender(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
          >
            <option value="all">Tất cả</option>
            <option value="Nữ">Tìm bạn Nữ</option>
            <option value="Nam">Tìm bạn Nam</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredRoommates.map((item) => (
          <div key={item.id} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-[11px] font-bold">
                  {item.badge}
                </span>
                <span className="text-xs font-bold text-emerald-600">{item.targetPrice}</span>
              </div>
              <h3 className="font-bold text-slate-900 text-sm">{item.author}</h3>
              <p className="text-[11px] text-blue-600 font-semibold">{item.school}</p>

              <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="line-clamp-1">{item.location}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{item.timeHabit}</span>
                </div>
              </div>

              <p className="text-xs text-slate-500 bg-slate-50 p-3 rounded-2xl border border-slate-100 mt-3 line-clamp-3 leading-relaxed">
                "{item.note}"
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">Liên hệ:</span>
              <a
                href={`tel:${item.phone.replace(/[^0-9]/g, '')}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs"
              >
                <Phone className="w-3 h-3" />
                <span>{item.phone}</span>
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};