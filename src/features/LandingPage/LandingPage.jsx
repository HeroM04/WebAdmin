import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import './LandingPage.css';

// ─── Data (Không icon) ───────────────────────────────────────
const INTRO_ITEMS = [
  {
    num: '01',
    label: 'Quỹ Hàng Phong Phú',
    title: 'Quỹ hàng đa dạng, cập nhật liên tục',
    desc: 'Hàng nghìn sản phẩm bất động sản từ căn hộ cao tầng, biệt thự đến nhà phố thương mại được cập nhật theo thời gian thực. Môi giới có ngay bức tranh toàn cảnh thị trường chỉ trong vài giây.',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80'
  },
  {
    num: '02',
    label: 'Tích Hợp Công Nghệ',
    title: 'Công nghệ PropTech tiên tiến bậc nhất',
    desc: 'Nền tảng tích hợp so sánh căn hộ theo Ma trận, tìm kiếm thông minh và bộ lọc nâng cao giúp thu hẹp hàng trăm lựa chọn xuống còn vài sản phẩm phù hợp nhất với nhu cầu khách hàng.',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80'
  },
  {
    num: '03',
    label: 'Giao Diện Thông Minh',
    title: 'Trải nghiệm mượt mà trên mọi thiết bị',
    desc: 'Tối ưu 100% cho Mobile — màn hình hiển thị sắc nét, thao tác vuốt mượt mà, nút bấm đủ lớn. Cầm điện thoại đến gặp khách hàng và demo trực tiếp ngay tại bàn ký hợp đồng.',
    image: 'https://images.unsplash.com/photo-1512428559087-560fa5ceab42?w=800&q=80'
  },
  {
    num: '04',
    label: 'Hỗ Trợ Chuyên Sâu',
    title: 'Đội ngũ hỗ trợ luôn đồng hành',
    desc: 'Hotline hỗ trợ kỹ thuật 24/7, tài liệu đào tạo video chuyên sâu và cộng đồng môi giới hàng ngàn thành viên. Không bao giờ bạn phải một mình đối mặt với khó khăn.',
    image: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&q=80'
  },
  {
    num: '05',
    label: 'Hoa Hồng Minh Bạch',
    title: 'Chính sách hoa hồng rõ ràng, công bằng',
    desc: 'Toàn bộ chính sách hoa hồng được công bố minh bạch trên hệ thống. Theo dõi tiến độ giao dịch, nhận thanh toán đúng hạn và không bao giờ phải lo bị "chia thấp hơn thỏa thuận".',
    image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&q=80'
  },
];

const BENEFIT_CARDS = [
  {
    title: 'Tạo nguồn doanh thu mới',
    desc: 'Mở rộng danh mục sản phẩm kinh doanh ngay lập tức. Không cần đầu tư hạ tầng — chỉ cần đăng ký, tiếp cận hàng ngàn sản phẩm BĐS cao cấp và bắt đầu tư vấn khách hàng trong vòng 24 giờ.',
  },
  {
    title: 'Củng cố mối quan hệ khách hàng',
    desc: 'Giao diện Ma trận So Sánh giúp bạn đặt khách hàng vào ghế lái: Họ tự chọn, tự so sánh và tự quyết định. Tỷ lệ hài lòng sau giao dịch tăng đột biến, tạo nguồn khách hàng trung thành lâu dài.',
  },
  {
    title: 'Tối ưu hiệu suất đội ngũ',
    desc: 'Dashboard KPI tích hợp giúp quản lý theo dõi hiệu suất từng thành viên theo thời gian thực. Phân tích điểm yếu, khen thưởng kịp thời và xây dựng văn hóa cạnh tranh lành mạnh trong công ty.',
  },
];

const VISION_COLS = [
  {
    kw: 'Sạch hơn',
    title: 'Thị trường minh bạch',
    desc: 'Pháp lý dự án được công bố đầy đủ. Mọi thông tin giá, diện tích, tiến độ bàn giao đều hiển thị rõ ràng, loại bỏ tình trạng thông tin bất đối xứng.',
  },
  {
    kw: 'Đắt hơn',
    title: 'Mặt bằng giá mới',
    desc: 'Theo nghiên cứu thị trường, giá BĐS tại các đô thị lớn dự kiến tăng 15–25% trong giai đoạn 2025–2027. Đây là chu kỳ vàng để tích lũy tài sản.',
  },
  {
    kw: 'Chất hơn',
    title: 'BĐS xanh & thông minh',
    desc: 'Xu hướng BĐS tích hợp năng lượng mặt trời, hệ thống smarthome và không gian xanh bùng nổ mạnh mẽ. Khách hàng sẵn sàng trả thêm 20% cho sản phẩm xanh & thông minh.',
  },
];

const CORE_VALUES = [
  { big: 'Uy Tín', desc: 'Cam kết thông tin trung thực, minh bạch từ giá cả đến pháp lý. Mỗi sản phẩm đưa ra thị trường đều đã qua kiểm duyệt nghiêm ngặt.', image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80' },
  { big: 'Tận Tâm', desc: 'Đội ngũ luôn đặt lợi ích khách hàng và đối tác lên hàng đầu. Không bán sản phẩm, chúng tôi xây dựng mối quan hệ lâu dài.', image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&q=80' },
  { big: 'Chuyên Nghiệp', desc: 'Quy trình làm việc được chuẩn hóa, công cụ hỗ trợ hiện đại và đội ngũ được đào tạo bài bản để mang lại dịch vụ tầm đẳng cấp.', image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80' },
];

const PARTNERS = [
  'Vinhomes', 'Masteri', 'Sun Group', 'CapitaLand',
  'Novaland', 'Nam Long', 'Gamuda Land', 'Hưng Thịnh',
  'Phú Mỹ Hưng', 'BIM Group', 'Ecopark', 'Đất Xanh',
];

// ─── Component (Không có Nav riêng, không có Footer riêng) ───
export const LandingPage = () => {
  const doubled = [...PARTNERS, ...PARTNERS];

  useEffect(() => {
    const reveals = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, { threshold: 0.1 });
    
    reveals.forEach(r => observer.observe(r));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <Helmet>
        <title>Trí Long Land – Nền tảng BĐS hàng đầu Việt Nam</title>
        <meta name="description" content="Trí Long Land – Cổng thông tin PropTech kết nối môi giới với sản phẩm bất động sản giá trị thực qua công nghệ hiện đại." />
      </Helmet>

      <div className="lp-body">
        {/* ── HERO SECTION ── */}
        <section className="lp-hero" id="home">
          <div className="lp-hero-grid"></div>
          
          {/* Glowing Orbs */}
          <div className="lp-orb lp-orb-1"></div>
          <div className="lp-orb lp-orb-2"></div>
          <div className="lp-orb lp-orb-3"></div>
          
          {/* Watermark */}
          <div className="lp-watermark">SALEPRO.COM</div>

          <div className="lp-hero-inner animate-fade-in-up">
            <div className="lp-hero-badge">
              <span className="lp-hero-badge-dot"></span>
              Nền tảng PropTech hàng đầu Việt Nam 2026
            </div>
            
            <h1 className="lp-hero-h1">
              Kiến tạo chuẩn mực mới trong giao dịch <span className="gold-word">Bất động sản</span>
            </h1>
            
            <p className="lp-hero-sub">
              Nơi hội tụ của những siêu dự án đẳng cấp. Chúng tôi kết nối nhà đầu tư tinh hoa với những giá trị thực bền vững thông qua nền tảng công nghệ ưu việt.
            </p>

            <div className="lp-hero-cta">
              <Link to="/projects" className="lp-btn-primary">
                Xem danh mục đầu tư <span style={{ fontSize: '18px', lineHeight: 1 }}>→</span>
              </Link>
              <Link to="/compare" className="lp-btn-outline">
                Nhận tư vấn chuyên sâu
              </Link>
            </div>
            
            <div className="lp-hero-stats">
              <div className="lp-stat">
                <div className="lp-stat-num">500+</div>
                <div className="lp-stat-label">Sản phẩm BĐS</div>
              </div>
              <div className="lp-stat">
                <div className="lp-stat-num">1,200+</div>
                <div className="lp-stat-label">Môi giới tin dùng</div>
              </div>
              <div className="lp-stat">
                <div className="lp-stat-num">10+</div>
                <div className="lp-stat-label">Chủ đầu tư uy tín</div>
              </div>
              <div className="lp-stat">
                <div className="lp-stat-num">98%</div>
                <div className="lp-stat-label">Khách hàng hài lòng</div>
              </div>
            </div>
          </div>
        </section>

        {/* ── INTRO / ABOUT ── */}
        <section className="lp-section lp-section-alt" id="intro">
          <div className="lp-container">
            <div className="reveal" style={{ textAlign: 'center', marginBottom: 64 }}>
              <div className="lp-section-badge">Về Trí Long Land</div>
              <h2 className="lp-h2">5 điểm khác biệt tạo nên <span>lợi thế cạnh tranh</span></h2>
            </div>

            {INTRO_ITEMS.map((item, i) => (
              <div key={i} className={`lp-intro-item reveal ${i % 2 !== 0 ? 'reverse' : ''}`}>
                <div className="lp-intro-image-wrap">
                  <img src={item.image} alt={item.label} />
                  <div className="lp-intro-image-overlay">
                    <div className="lp-intro-img-label">{item.label}</div>
                  </div>
                </div>
                <div className="lp-intro-content">
                  <div className="lp-intro-num">{item.num}</div>
                  <div className="lp-intro-title">{item.title}</div>
                  <div className="lp-intro-desc">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── BENEFIT CARDS ── */}
        <section className="lp-section" id="benefits">
          <div className="lp-container">
            <div className="reveal" style={{ textAlign: 'center', marginBottom: 56 }}>
              <div className="lp-section-badge">Lợi ích cộng hưởng</div>
              <h2 className="lp-h2">Ba lợi thế <span>thay đổi cuộc chơi</span></h2>
              <p className="lp-lead" style={{ margin: '0 auto' }}>Không chỉ là công cụ — SalePro là người đồng hành chiến lược giúp bạn bứt phá doanh số và xây dựng đế chế BĐS bền vững.</p>
            </div>
            <div className="lp-cards-grid reveal">
              {BENEFIT_CARDS.map((card, i) => (
                <div key={i} className="lp-card">
                  <div className="lp-card-index">{String(i + 1).padStart(2, '0')}</div>
                  <h3 className="lp-card-title">{card.title}</h3>
                  <p className="lp-card-desc">{card.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── VISION 2026 ── */}
        <section className="lp-section lp-section-navy" id="vision">
          <div className="lp-container">
            <div className="lp-vision-header reveal">
              <div className="lp-section-badge-white">Tầm nhìn 2026</div>
              <h2 className="lp-h2 lp-h2-white">Khởi đầu của chu kỳ <span>tăng trưởng bền vững</span></h2>
              <p className="lp-lead lp-lead-white" style={{ margin: '0 auto' }}>Thị trường bất động sản Việt Nam đang bước vào một giai đoạn chuyển mình lịch sử. Đây là thời điểm để định vị vượt trội.</p>
            </div>
            <div className="lp-vision-grid reveal">
              {VISION_COLS.map((col, i) => (
                <div key={i} className="lp-vision-col">
                  <div className="lp-vision-kw">{col.kw}</div>
                  <div className="lp-vision-title">{col.title}</div>
                  <div className="lp-vision-desc">{col.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CORE VALUES ── */}
        <section className="lp-section lp-section-alt">
          <div className="lp-container">
            <div className="lp-values-header reveal">
              <div className="lp-section-badge">Giá trị cốt lõi</div>
              <h2 className="lp-h2">Ba <span>giá trị nền tảng</span> chúng tôi cam kết</h2>
            </div>
            <div className="lp-values-grid reveal">
              {CORE_VALUES.map((v, i) => (
                <div key={i} className="lp-value-card">
                  <img src={v.image} alt={v.big} className="lp-value-img" />
                  <div className="lp-value-content">
                    <span className="lp-value-big">{v.big}</span>
                    <div className="lp-value-desc">{v.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PARTNERS MARQUEE ── */}
        <section className="lp-marquee-section reveal" id="partners">
          <div className="lp-marquee-label">Đối tác chiến lược & Chủ đầu tư uy tín</div>
          <div style={{ overflow: 'hidden' }}>
            <div className="lp-marquee-track">
              {doubled.map((name, i) => (
                <div key={i} className="lp-partner-chip">{name}</div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  );
};
