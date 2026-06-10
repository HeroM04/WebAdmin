import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Breadcrumb, Button } from 'antd';
import { ShareAltOutlined, CalendarOutlined, UserOutlined } from '@ant-design/icons';
import { NewsSidebar, MOCK_NEWS } from './NewsList';
import '../../SaleWeb.css';

export const NewsDetail = () => {
  const { id } = useParams();

  // Find the exact news if possible, otherwise mock it
  const newsItem = MOCK_NEWS.find(n => n.id === parseInt(id)) || MOCK_NEWS[0];

  return (
    <div className="saleweb-container" style={{ padding: '24px 0' }}>
      <div style={{ marginBottom: '24px' }}>
        <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px' }}>
          Trang chủ / <Link to="/news" style={{ color: '#64748b' }}>Danh sách tin tức</Link> / Chi tiết
        </div>
      </div>

      <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start' }}>
        {/* Main Content */}
        <div style={{ flex: 1, paddingRight: '16px' }}>
          <div style={{ marginBottom: '32px' }}>
            <h1 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#0f172a', lineHeight: 1.3, marginBottom: '24px', textTransform: 'uppercase' }}>
              {newsItem.title || 'GIẢI MÃ SỨC HÚT CỦA VINHOMES SÀI GÒN PARK: "TÀI SẢN LỖI" ĐƯỢC TRỢ LỰC TỪ TIẾN ĐỘ THẦN TỐC'}
            </h1>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: '#64748b', fontSize: '0.9rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CalendarOutlined /> <span>{newsItem.date || '09 tháng 6, 2026'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <UserOutlined /> <span>Mayhomes</span>
                </div>
              </div>
              <Button type="primary" icon={<ShareAltOutlined />} style={{ background: '#3b82f6', borderRadius: '4px' }}>
                Chia sẻ
              </Button>
            </div>
          </div>

          <div style={{ fontSize: '1.05rem', lineHeight: 1.8, color: '#1e293b' }}>
            <p style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '32px', color: '#0f172a' }}>
              Dòng tiền đầu tư trên thị trường bất động sản đang có sự dịch chuyển vô cùng mạnh mẽ. Thay vì phân tán dàn trải hay tham gia vào các phân khúc lướt sóng đầy rủi ro, người mua đang tập trung mạnh dòng vốn vào nhóm tài sản lỗi. Sức hút mãnh liệt của đại đô thị Vinhomes Sài Gòn Park chính là minh chứng rõ nét nhất cho xu hướng này khi dự án vừa ghi nhận tới 7.778 lượt đăng ký nguyện vọng giữ chỗ chỉ sau 3 phiên phát sóng trực tiếp.
            </p>

            <img 
              src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=1200" 
              alt="News detail 1" 
              style={{ width: '100%', marginBottom: '24px' }} 
            />

            <p style={{ marginBottom: '24px' }}>
              Trong bối cảnh thị trường đang có nhiều biến động, nhà đầu tư ngày càng trở nên thận trọng và khắt khe hơn trong việc lựa chọn sản phẩm. Những dự án mang tính "biểu tượng" với tiến độ xây dựng thần tốc, pháp lý minh bạch và được bảo chứng bởi các chủ đầu tư uy tín như Vinhomes đang trở thành điểm sáng thu hút dòng tiền.
            </p>

            <h3 style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#0f172a', marginTop: '32px', marginBottom: '16px' }}>
              Tiến độ thần tốc - Bảo chứng vàng cho niềm tin
            </h3>

            <p style={{ marginBottom: '24px' }}>
              Một trong những yếu tố quyết định tạo nên sức hút của Vinhomes Sài Gòn Park chính là tiến độ thi công vượt trội. Bất chấp những khó khăn chung của toàn thị trường, công trường dự án vẫn luôn nhộn nhịp ngày đêm. Việc cất nóc các tòa tháp đúng hoặc vượt tiến độ cam kết không chỉ khẳng định tiềm lực tài chính vững mạnh của chủ đầu tư mà còn là liều thuốc an thần hiệu quả nhất dành cho khách hàng.
            </p>

            <img 
              src="https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=1200" 
              alt="News detail 2" 
              style={{ width: '100%', marginBottom: '24px' }} 
            />

            <p style={{ marginBottom: '24px' }}>
              Nhiều chuyên gia nhận định, trong chu kỳ bất động sản hiện tại, "tài sản lỗi" (ám chỉ những dự án có giá trị thực, đáp ứng nhu cầu ở thực hoặc khai thác cho thuê ngay) đang được săn đón ráo riết. Vinhomes Sài Gòn Park hội tụ đầy đủ các yếu tố của một "tài sản lỗi": vị trí đắc địa, hệ sinh thái tiện ích all-in-one hoàn thiện, chất lượng bàn giao cao cấp và cộng đồng cư dân tinh hoa.
            </p>

            <p style={{ marginBottom: '24px' }}>
              Sự kiện mở bán thành công rực rỡ của Vinhomes Sài Gòn Park được kỳ vọng sẽ tạo ra hiệu ứng lan tỏa, góp phần hâm nóng và thúc đẩy sự phục hồi mạnh mẽ của toàn thị trường bất động sản phía Nam trong những tháng cuối năm 2026.
            </p>
          </div>
        </div>

        {/* Sidebar imported from NewsList */}
        <NewsSidebar />
      </div>
    </div>
  );
};
