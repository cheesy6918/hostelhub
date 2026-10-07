import React, { useState } from 'react';
import { MapPin, Navigation, School, Building, ExternalLink, Sparkles, Filter } from 'lucide-react';

interface MapViewProps {
  onSelectRoomDetail?: (roomId: string) => void;
}

export const MapView: React.FC<MapViewProps> = ({ onSelectRoomDetail }) => {
  // Danh sách các cụm trường đại học lớn tại Hà Nội
  const universityClusters = [
    {
      id: 'cluster_caugiay',
      name: 'Cụm Cầu Giấy - Xuân Thủy',
      schools: 'ĐH Quốc Gia, ĐH Sư Phạm, Học viện Báo chí & Tuyên truyền',
      count: 142,
      mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14895.962451556094!2d105.77668615!3d21.0330616!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x313454b56a31c4f9%3A0x6b44a7f0e63de602!2zWHXDom4gVGjhu6d5LCBD4bqndSBHaeG6pXksIEjDoCBO4buZaQ!5e0!3m2!1svi!2s!4v1700000000000!5m2!1svi!2s'
    },
    {
      id: 'cluster_bachthe',
      name: 'Cụm Bách - Kinh - Xây (Hai Bà Trưng)',
      schools: 'ĐH Bách Khoa, ĐH Kinh tế Quốc dân, ĐH Xây Dựng',
      count: 98,
      mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14899.43261623838!2d105.8368142!3d21.0028247!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ac76ccab6dd7%3A0x55e92a5b07aab96d!2zVHLGsOG7nW5nIMSQ4bqhaSBI4buNYyBCw6FjaCBLaG9hIEjDoCBO4buZaQ!5e0!3m2!1svi!2s!4v1700000000000!5m2!1svi!2s'
    },
    {
      id: 'cluster_thanhxuan',
      name: 'Cụm Thanh Xuân - Hà Đông',
      schools: 'ĐH Hà Nội, ĐH KHXH&NV, Học viện Công nghệ Bưu chính Viễn thông',
      count: 115,
      mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14902.502941193306!2d105.787889!3d20.980641!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135accdd8a1d323%3A0xa1434234032d887a!2zSOG7jWMgdmnhu4duIEPDtG5nIG5naOG7hyBCxrB1IGNow61uaCBWaeG7hW4gdGjDtG5n!5e0!3m2!1svi!2s!4v1700000000000!5m2!1svi!2s'
    }
  ];

  const [selectedCluster, setSelectedCluster] = useState(universityClusters[0]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-300">
      {/* Banner */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white mb-8 shadow-sm">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-lg text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Bản đồ số định vị phòng trọ</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Bản đồ phòng trọ quanh các trường Đại học
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
            Tra cứu bán kính di chuyển, trạm xe buýt và các khu nhà trọ sinh viên tập trung nhiều nhất gần trường bạn học.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Cột trái: Danh sách cụm trường & Bộ lọc */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <School className="w-4 h-4 text-blue-600" />
                Chọn khu vực trường ĐH
              </span>
              <span className="text-[11px] text-slate-400">3 cụm trọng điểm</span>
            </div>

            <div className="space-y-2.5">
              {universityClusters.map((cluster) => {
                const isSelected = selectedCluster.id === cluster.id;
                return (
                  <button
                    key={cluster.id}
                    type="button"
                    onClick={() => setSelectedCluster(cluster)}
                    className={`w-full text-left p-3.5 rounded-2xl transition-all border cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50/80 border-blue-300 ring-2 ring-blue-500/20 shadow-xs'
                        : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold ${isSelected ? 'text-blue-900' : 'text-slate-800'}`}>
                        {cluster.name}
                      </span>
                      <span className="px-2 py-0.5 bg-white rounded-md text-[10px] font-bold text-blue-700 border border-blue-100">
                        {cluster.count} phòng
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1.5 line-clamp-2">
                      {cluster.schools}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-4 text-xs text-emerald-900 space-y-1">
            <p className="font-bold flex items-center gap-1.5">
              <Navigation className="w-3.5 h-3.5 text-emerald-600" />
              Mẹo tìm phòng bằng bản đồ:
            </p>
            <p className="text-slate-600 leading-relaxed">
              Nên ưu tiên các tuyến đường có xe buýt chạy thẳng đến cổng trường (dưới 15 phút đi lại) để tiết kiệm 20% - 30% giá thuê so với phòng ngay sát cổng trường.
            </p>
          </div>
        </div>

        {/* Cột phải: Khung hiển thị Google Map tương tác */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 p-2 sm:p-3 shadow-xs flex flex-col h-[520px]">
          <div className="px-3 py-2 flex items-center justify-between border-b border-slate-100 mb-2">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-rose-500" />
              <span className="text-xs font-bold text-slate-800">
                Đang xem: {selectedCluster.name}
              </span>
            </div>
            <span className="text-[11px] text-slate-400 hidden sm:inline">
              Có thể phóng to/thu nhỏ và kéo bản đồ trực tiếp
            </span>
          </div>

          <div className="flex-1 w-full rounded-2xl overflow-hidden bg-slate-100 relative border border-slate-200">
            <iframe
              title="Google Map"
              src={selectedCluster.mapEmbedUrl}
              className="w-full h-full border-0"
              loading="lazy"
              allowFullScreen
            />
          </div>
        </div>
      </div>
    </div>
  );
};