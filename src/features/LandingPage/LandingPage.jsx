import React, { useState, useEffect } from 'react';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import './LandingPage.css';

// ─── Data ────────────────────────────────────────────────────
const INTRO_ITEMS = [
  {
    icon: '🏗️',
    label: 'Quỹ Hàng Phong Phú',
    title: 'Quỹ hàng đa dạng, cập nhật liên tục',
    desc: 'Hàng nghìn sản phẩm bất động sản từ căn hộ cao tầng, biệt thự đến nhà phố thương mại được cập nhật theo thời gian thực. Môi giới có ngay bức tranh toàn cảnh thị trường chỉ trong vài giây.',
  },
  {
    icon: '⚡',
    label: 'Tích Hợp Công Nghệ',
    title: 'Công nghệ PropTech tiên tiến bậc nhất',
    desc: 'Nền tảng tích hợp so sánh căn hộ theo Ma trận, tìm kiếm thông minh và bộ lọc nâng cao giúp thu hẹp hàng trăm lựa chọn xuống còn vài sản phẩm phù hợp nhất với nhu cầu khách hàng.',
  },
  {
    icon: '📱',
    label: 'Giao Diện Thông Minh',
    title: 'Trải nghiệm mượt mà trên mọi thiết bị',
    desc: 'Tối ưu 100% cho Mobile — màn hình hiển thị sắc nét, thao tác vuốt mượt mà, nút bấm đủ lớn. Cầm điện thoại đến gặp khách hàng và demo trực tiếp ngay tại bàn ký hợp đồng.',
  },
  {
    icon: '🎯',
    label: 'Hỗ Trợ Chuyên Sâu',
    title: 'Đội ngũ hỗ trợ luôn đồng hành',
    desc: 'Hotline hỗ trợ kỹ thuật 24/7, tài liệu đào tạo video chuyên sâu và cộng đồng môi giới hàng ngàn thành viên. Không bao giờ bạn phải một mình đối mặt với khó khăn.',
  },
  {
    icon: '💰',
    label: 'Hoa Hồng Minh Bạch',
    title: 'Chính sách hoa hồng rõ ràng, công bằng',
    desc: 'Toàn bộ chính sách hoa hồng được công bố minh bạch trên hệ thống. Theo dõi tiến độ giao dịch, nhận thanh toán đúng hạn và không bao giờ phải lo bị "chia thấp hơn thỏa thuận".',
  },
];

const BENEFIT_CARDS = [
  {
    icon: '💎',
    title: 'Tạo nguồn doanh thu mới',
    desc: 'Mở rộng danh mục sản phẩm kinh doanh ngay lập tức. Không cần đầu tư hạ tầng — chỉ cần đăng ký, tiếp cận hàng ngàn sản phẩm BĐS cao cấp và bắt đầu tư vấn khách hàng trong vòng 24 giờ.',
  },
  {
    icon: '🤝',
    title: 'Củng cố mối quan hệ khách hàng',
    desc: 'Giao diện Ma trận So Sánh giúp bạn đặt khách hàng vào ghế lái: Họ tự chọn, tự so sánh và tự quyết định. Tỷ lệ hài lòng sau giao dịch tăng đột biến, tạo nguồn khách hàng trung thành lâu dài.',
  },
  {
    icon: '🚀',
    title: 'Tối ưu hiệu suất đội ngũ',
    desc: 'Dashboard KPI tích hợp giúp quản lý theo dõi hiệu suất từng thành viên theo thời gian thực. Phân tích điểm yếu, khen thưởng kịp thời và xây dựng văn hóa cạnh tranh lành mạnh trong công ty.',
  },
];

const VISION_COLS = [
  {
    icon: '🧹',
    kw: 'Sạch hơn',
    title: 'Thị trường minh bạch',
    desc: 'Pháp lý dự án được công bố đầy đủ. Mọi thông tin giá, diện tích, tiến độ bàn giao đều hiển thị rõ ràng, loại bỏ tình trạng thông tin bất đối xứng.',
  },
  {
    icon: '📈',
    kw: 'Đắt hơn',
    title: 'Mặt bằng giá mới',
    desc: 'Theo nghiên cứu thị trường, giá BĐS tại các đô thị lớn dự kiến tăng 15–25% trong giai đoạn 2025–2027. Đây là chu kỳ vàng để tích lũy tài sản.',
  },
  {
    icon: '🌿',
    kw: 'Chất hơn',
    title: 'BĐS xanh & thông minh',
    desc: 'Xu hướng BĐS tích hợp năng lượng mặt trời, hệ thống smarthome và không gian xanh bùng nổ mạnh mẽ. Khách hàng sẵn sàng trả thêm 20% cho sản phẩm "xanh & thông minh".',
  },
];

const CORE_VALUES = [
  { big: 'Uy tín', name: 'Uy Tín', desc: 'Cam kết thông tin trung thực, minh bạch từ giá cả đến pháp lý. Mỗi sản phẩm đưa ra thị trường đều đã qua kiểm duyệt nghiêm ngặt.' },
  { big: 'Tận tâm', name: 'Tận Tâm', desc: 'Đội ngũ luôn đặt lợi ích khách hàng và đối tác lên hàng đầu. Không bán sản phẩm, chúng tôi xây dựng mối quan hệ lâu dài.' },
  { big: 'Chuyên nghiệp', name: 'Chuyên Nghiệp', desc: 'Quy trình làm việc được chuẩn hóa, công cụ hỗ trợ hiện đại và đội ngũ được đào tạo bài bản để mang lại dịch vụ tầm đẳng cấp.' },
];

const PARTNERS = [
  { emoji: '🏙️', name: 'Vinhomes' },
  { emoji: '🏢', name: 'Masteri' },
  { emoji: '☀️', name: 'Sun Group' },
  { emoji: '🌏', name: 'CapitaLand' },
  { emoji: '🏗️', name: 'Novaland' },
  { emoji: '🌊', name: 'Nam Long' },
  { emoji: '💫', name: 'Gamuda Land' },
  { emoji: '🌆', name: 'Hưng Thịnh' },
  { emoji: '🏘️', name: 'Phú Mỹ Hưng' },
  { emoji: '🌴', name: 'BIM Group' },
];

// ─── Component ───────────────────────────────────────────────
export const LandingPage = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const doubled = [...PARTNERS, ...PARTNERS]; // for infinite marquee

  return (
    <HelmetProvider>
      <Helmet>
        <title>Trí Long Land – Nền tảng BĐS hàng đầu Việt Nam | SalePro</title>
        <meta name="description" content="Trí Long Land – Cổng thông tin công nghệ bất động sản (PropTech) giúp môi giới tra cứu quỹ hàng, so sánh căn hộ và chốt deal nhanh hơn. Khám phá dự án ngay hôm nay!" />
        <meta name="keywords" content="bất động sản, môi giới, quỹ hàng, so sánh căn hộ, PropTech, Trí Long Land, SalePro" />
        <meta property="og:title" content="Trí Long Land – Nền tảng BĐS hàng đầu Việt Nam" />
        <meta property="og:description" content="Cổng thông tin PropTech kết nối môi giới với sản phẩm giá trị thực qua công nghệ hiện đại." />
        <meta property="og:type" content="website" />
      </Helmet>

      <div className="lp-body">
        {/* ── NAV ── */}
        <nav className="lp-nav">
          <div className="lp-nav-inner">
            <a href="#hero" className="lp-logo">
              <div className="lp-logo-text">
                <div className="lp-logo-name">TRÍ LONG LAND</div>
                <div className="lp-logo-tag">KIẾN TẠO SỰ BỀN VỮNG</div>
              </div>
            </a>
            <div className="lp-nav-links">
              <a href="#intro">Về chúng tôi</a>
              <a href="#benefits">Lợi ích</a>
              <a href="#vision">Tầm nhìn 2026</a>
              <a href="#partners">Đối tác</a>
              <button className="lp-btn-nav" onClick={() => navigate('/projects')}>Khám phá ngay</button>
            </div>
          </div>
        </nav>

        {/* ── HERO ── */}
        <section className="lp-hero" id="hero">
          <div className="lp-hero-grid" />
          <div className="lp-hero-inner">
            <div className="lp-hero-badge">
              <div className="lp-hero-badge-dot" />
              🏆 Nền tảng PropTech #1 Việt Nam 2026
            </div>
            <h1 className="lp-hero-h1">
              Nền tảng công nghệ hỗ trợ<br />
              kinh doanh <span className="gold-word">Bất động sản</span><br />
              hàng đầu Việt Nam
            </h1>
            <p className="lp-hero-sub">
              Kết nối khách hàng với sản phẩm giá trị thực thông qua công nghệ hiện đại. 
              Tra cứu, so sánh và chốt deal nhanh hơn bao giờ hết.
            </p>
            <div className="lp-hero-cta">
              <a href="#intro" className="lp-btn-primary">🏗️ Khám phá dự án</a>
              <button className="lp-btn-outline" onClick={() => navigate('/')}>Đăng nhập →</button>
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
            <div style={{ textAlign: 'center', marginBottom: 64 }}>
              <div className="lp-section-badge">Về Trí Long Land</div>
              <h2 className="lp-h2">5 điểm khác biệt tạo nên <span>lợi thế cạnh tranh</span></h2>
            </div>

            {INTRO_ITEMS.map((item, i) => (
              <div key={i} className={`lp-intro-item ${i % 2 !== 0 ? 'reverse' : ''}`}>
                <div className="lp-intro-icon-wrap">
                  <div className="lp-intro-icon">{item.icon}</div>
                  <div className="lp-intro-img-label">{item.label}</div>
                </div>
                <div className="lp-intro-content">
                  <div className="lp-intro-num">0{i + 1}</div>
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
            <div style={{ textAlign: 'center', marginBottom: 56 }}>
              <div className="lp-section-badge">Lợi ích cộng hưởng</div>
              <h2 className="lp-h2">Ba lợi thế <span>thay đổi cuộc chơi</span></h2>
              <p className="lp-lead" style={{ margin: '0 auto' }}>Không chỉ là công cụ — SalePro là người đồng hành chiến lược giúp bạn bứt phá doanh số và xây dựng đế chế BĐS bền vững.</p>
            </div>
            <div className="lp-cards-grid">
              {BENEFIT_CARDS.map((card, i) => (
                <div key={i} className="lp-card">
                  <span className="lp-card-icon">{card.icon}</span>
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
            <div className="lp-vision-header">
              <div className="lp-section-badge-white">Tầm nhìn 2026</div>
              <h2 className="lp-h2 lp-h2-white">Khởi đầu của chu kỳ <span>tăng trưởng bền vững</span></h2>
              <p className="lp-lead lp-lead-white" style={{ margin: '0 auto' }}>Thị trường bất động sản Việt Nam đang bước vào một giai đoạn chuyển mình lịch sử. Đây là thời điểm để định vị vượt trội.</p>
            </div>
            <div className="lp-vision-grid">
              {VISION_COLS.map((col, i) => (
                <div key={i} className="lp-vision-col">
                  <div className="lp-vision-icon">{col.icon}</div>
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
            <div className="lp-values-header">
              <div className="lp-section-badge">Giá trị cốt lõi</div>
              <h2 className="lp-h2">Ba <span>giá trị nền tảng</span> chúng tôi cam kết</h2>
            </div>
            <div className="lp-values-grid">
              {CORE_VALUES.map((v, i) => (
                <div key={i} className="lp-value-card">
                  <span className="lp-value-big">{v.big}</span>
                  <div className="lp-value-name">{v.name}</div>
                  <div className="lp-value-desc">{v.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PARTNERS MARQUEE ── */}
        <section className="lp-marquee-section" id="partners">
          <div className="lp-marquee-label">Đối tác chiến lược & Chủ đầu tư uy tín</div>
          <div style={{ overflow: 'hidden' }}>
            <div className="lp-marquee-track">
              {doubled.map((p, i) => (
                <div key={i} className="lp-partner-chip">
                  <span className="lp-partner-emoji">{p.emoji}</span>
                  {p.name}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer className="lp-footer">
          <div className="lp-footer-grid">
            <div>
              <div className="lp-footer-brand-name">TRÍ LONG LAND</div>
              <div className="lp-footer-brand-tag">Kiến tạo sự bền vững</div>
              <p className="lp-footer-desc">
                Nền tảng công nghệ PropTech kết nối môi giới với hàng ngàn sản phẩm bất động sản giá trị thực, 
                minh bạch và cập nhật theo thời gian thực.
              </p>
              <div className="lp-footer-contacts">
                <div className="lp-footer-contact"><strong>📧 Email</strong><span>contact@trilongland.vn</span></div>
                <div className="lp-footer-contact"><strong>📞 Hotline</strong><span>1900 xxxx</span></div>
                <div className="lp-footer-contact"><strong>📍 Địa chỉ</strong><span>Tầng X, Tòa nhà ABC, Hà Nội</span></div>
              </div>
            </div>

            <div>
              <div className="lp-footer-col-title">Về Chúng Tôi</div>
              <div className="lp-footer-links">
                <a href="#intro">Giới thiệu</a>
                <a href="#benefits">Lợi ích</a>
                <a href="#vision">Tầm nhìn 2026</a>
                <a href="#partners">Đối tác</a>
              </div>
            </div>

            <div>
              <div className="lp-footer-col-title">Hướng Dẫn</div>
              <div className="lp-footer-links">
                <a href="#">Bắt đầu nhanh</a>
                <a href="#">Video hướng dẫn</a>
                <a href="#">FAQ</a>
                <a href="#">Liên hệ hỗ trợ</a>
              </div>
            </div>

            <div>
              <div className="lp-footer-col-title">Pháp Lý</div>
              <div className="lp-footer-links">
                <a href="#">Điều khoản sử dụng</a>
                <a href="#">Chính sách bảo mật</a>
                <a href="#">Quy định hoa hồng</a>
                <a href="#">Giải quyết tranh chấp</a>
              </div>
            </div>
          </div>

          <div className="lp-footer-bottom">
            <div className="lp-footer-copy">© 2026 Trí Long Land. Tất cả quyền được bảo lưu.</div>
            <div className="lp-footer-legal">
              <a href="#">Điều khoản</a>
              <a href="#">Bảo mật</a>
              <a href="#">Cookie</a>
            </div>
          </div>
        </footer>
      </div>
    </HelmetProvider>
  );
};
