import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Breadcrumb } from 'antd';
import '../../SaleWeb.css';

export const NewsDetail = () => {
  const { id } = useParams();

  return (
    <div className="saleweb-container" style={{ padding: '24px 0' }}>
      <Breadcrumb style={{ marginBottom: '24px' }}>
        <Breadcrumb.Item><Link to="/">Trang chủ</Link></Breadcrumb.Item>
        <Breadcrumb.Item><Link to="/news">Danh sách tin tức</Link></Breadcrumb.Item>
        <Breadcrumb.Item>Chi tiết bài viết</Breadcrumb.Item>
      </Breadcrumb>

      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ color: '#d97706', fontWeight: 'bold', marginBottom: '12px' }}>THỊ TRƯỜNG</div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#0f172a', lineHeight: 1.2, marginBottom: '16px' }}>
            Giải mã sức hút của Vinhomes Sài Gòn Park: "Tài sản lỗi" được trả lực từ tiến độ thần tốc
          </h1>
          <div style={{ color: '#64748b', fontSize: '0.9rem' }}>Đăng ngày 09 tháng 6, 2026</div>
        </div>

        <div style={{ fontSize: '1.1rem', lineHeight: 1.8, color: '#334155' }}>
          <p style={{ fontWeight: 600, fontSize: '1.2rem', color: '#0f172a', marginBottom: '24px' }}>
            Xu hướng dòng tiền trên thị trường bất động sản đang có sự dịch chuyển mạnh mẽ vào nhóm "tài sản lỗi" có giá trị thực, minh chứng bằng kỷ lục 7.778 booking tại dự án Vinhomes Sài Gòn Park.
          </p>

          <img 
            src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=800" 
            alt="News detail 1" 
            style={{ width: '100%', borderRadius: '12px', marginBottom: '24px' }} 
          />

          <p style={{ marginBottom: '24px' }}>
            Trong bối cảnh thị trường đang có nhiều biến động, nhà đầu tư ngày càng trở nên thận trọng và khắt khe hơn trong việc lựa chọn sản phẩm. Những dự án mang tính "biểu tượng" với tiến độ xây dựng thần tốc, pháp lý minh bạch và được bảo chứng bởi các chủ đầu tư uy tín như Vinhomes đang trở thành điểm sáng thu hút dòng tiền.
          </p>

          <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#0f172a', marginTop: '32px', marginBottom: '16px' }}>
            Tiến độ thần tốc - Bảo chứng vàng cho niềm tin
          </h3>

          <p style={{ marginBottom: '24px' }}>
            Một trong những yếu tố quyết định tạo nên sức hút của Vinhomes Sài Gòn Park chính là tiến độ thi công vượt trội. Bất chấp những khó khăn chung của toàn thị trường, công trường dự án vẫn luôn nhộn nhịp ngày đêm. Việc cất nóc các tòa tháp đúng hoặc vượt tiến độ cam kết không chỉ khẳng định tiềm lực tài chính vững mạnh của chủ đầu tư mà còn là liều thuốc an thần hiệu quả nhất dành cho khách hàng.
          </p>

          <img 
            src="https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=800" 
            alt="News detail 2" 
            style={{ width: '100%', borderRadius: '12px', marginBottom: '24px' }} 
          />

          <p style={{ marginBottom: '24px' }}>
            Nhiều chuyên gia nhận định, trong chu kỳ bất động sản hiện tại, "tài sản lỗi" (ám chỉ những dự án có giá trị thực, đáp ứng nhu cầu ở thực hoặc khai thác cho thuê ngay) đang được săn đón ráo riết. Vinhomes Sài Gòn Park hội tụ đầy đủ các yếu tố của một "tài sản lỗi": vị trí đắc địa, hệ sinh thái tiện ích all-in-one hoàn thiện, chất lượng bàn giao cao cấp và cộng đồng cư dân tinh hoa.
          </p>

          <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '12px', borderLeft: '4px solid #d4af37', fontStyle: 'italic', marginBottom: '24px' }}>
            "Kỷ lục 7.778 booking không phải là con số ngẫu nhiên. Nó phản ánh chính xác nhu cầu bị dồn nén của thị trường đối với những sản phẩm chất lượng cao, an toàn về pháp lý và có tiềm năng sinh lời bền vững." - Đại diện một sàn giao dịch chia sẻ.
          </div>

          <p style={{ marginBottom: '24px' }}>
            Sự kiện mở bán thành công rực rỡ của Vinhomes Sài Gòn Park được kỳ vọng sẽ tạo ra hiệu ứng lan tỏa, góp phần hâm nóng và thúc đẩy sự phục hồi mạnh mẽ của toàn thị trường bất động sản phía Nam trong những tháng cuối năm 2026.
          </p>
        </div>
      </div>
    </div>
  );
};
