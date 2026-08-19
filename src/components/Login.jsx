import React, { useContext, useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { UserOutlined, LockOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { AppContext } from '../context/AppContext';

/**
 * Trang đăng nhập WebAdmin.
 *
 * Chia hai cột: cột trái là bảng thương hiệu màu xanh navy của Trí Long Land,
 * cột phải là biểu mẫu đặt trên nền theo giao diện sáng/tối người dùng đang chọn.
 * Dưới 900px thì xếp dọc, bảng thương hiệu thu lại thành dải đầu trang.
 */
export const Login = () => {
  const { login } = useContext(AppContext);
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await login(values.username, values.password);
      message.success('Đăng nhập thành công!');
    } catch (err) {
      message.error(typeof err === 'string' ? err : (err.message || 'Sai tên đăng nhập hoặc mật khẩu!'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tl-login">
      <style>{`
        .tl-login{
          --navy:#0F2C59;
          --navy-deep:#081A36;
          --navy-lift:#153A70;
          --gold:#D4AF37;
          --gold-deep:#B4901F;

          min-height:100vh;
          display:grid;
          grid-template-columns:1.05fr 1fr;
          background:var(--bg-primary);
        }
        @media (max-width:900px){
          .tl-login{grid-template-columns:1fr;}
        }

        /* ---------- Cột thương hiệu ---------- */
        .tl-brand{
          position:relative;
          overflow:hidden;
          padding:56px 60px;
          display:flex;
          flex-direction:column;
          justify-content:space-between;
          background:
            radial-gradient(120% 90% at 15% 0%, var(--navy-lift) 0%, rgba(21,58,112,0) 60%),
            linear-gradient(165deg, var(--navy) 0%, var(--navy-deep) 100%);
          color:#fff;
        }
        /* Hoạ tiết mặt đứng toà nhà: các đường ngang mảnh gợi tầng lầu */
        .tl-brand::before{
          content:"";
          position:absolute; inset:0;
          background:repeating-linear-gradient(
            to bottom,
            rgba(212,175,55,.09) 0px,
            rgba(212,175,55,.09) 1px,
            transparent 1px,
            transparent 46px
          );
          mask-image:linear-gradient(to bottom, transparent 0%, #000 35%, #000 70%, transparent 100%);
          -webkit-mask-image:linear-gradient(to bottom, transparent 0%, #000 35%, #000 70%, transparent 100%);
          pointer-events:none;
        }
        .tl-brand::after{
          content:"";
          position:absolute;
          right:-140px; bottom:-160px;
          width:460px; height:460px; border-radius:50%;
          background:radial-gradient(circle, rgba(212,175,55,.16) 0%, rgba(212,175,55,0) 68%);
          pointer-events:none;
        }
        .tl-brand > *{position:relative; z-index:1;}
        @media (max-width:900px){
          .tl-brand{padding:36px 28px 30px; gap:22px;}
        }

        .tl-mark{display:flex; align-items:center; gap:16px;}
        .tl-mark img{
          width:56px; height:56px; border-radius:14px; display:block;
          box-shadow:0 10px 26px rgba(0,0,0,.34);
        }
        .tl-wordmark{
          font-family:'Outfit','Roboto',sans-serif;
          font-size:23px; font-weight:800; letter-spacing:.055em;
          line-height:1.15; text-transform:uppercase; margin:0;
        }
        .tl-wordmark span{color:var(--gold);}
        .tl-sub{
          font-size:11.5px; letter-spacing:.19em; text-transform:uppercase;
          color:rgba(255,255,255,.5); margin-top:5px;
        }

        .tl-pitch h2{
          font-family:'Outfit','Roboto',sans-serif;
          font-size:clamp(26px,2.7vw,36px); font-weight:700;
          line-height:1.2; letter-spacing:-.018em; margin:0 0 14px;
          text-wrap:balance; max-width:15ch;
        }
        .tl-rule{width:52px; height:3px; background:var(--gold); border-radius:2px; margin-bottom:20px;}
        .tl-points{list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:11px;}
        .tl-points li{
          display:flex; gap:11px; align-items:flex-start;
          font-size:14.5px; line-height:1.5; color:rgba(255,255,255,.76);
        }
        .tl-points li::before{
          content:""; flex:none; width:5px; height:5px; margin-top:8px;
          border-radius:50%; background:var(--gold);
        }
        @media (max-width:900px){ .tl-points{display:none;} }

        .tl-brand-foot{
          font-size:12px; color:rgba(255,255,255,.38); letter-spacing:.02em;
        }
        @media (max-width:900px){ .tl-brand-foot{display:none;} }

        /* ---------- Cột biểu mẫu ---------- */
        .tl-form-col{
          display:flex; align-items:center; justify-content:center;
          padding:56px 40px;
        }
        @media (max-width:900px){ .tl-form-col{padding:40px 24px 56px;} }
        .tl-form{width:100%; max-width:376px;}

        .tl-form h1{
          font-family:'Outfit','Roboto',sans-serif;
          font-size:27px; font-weight:700; letter-spacing:-.015em;
          color:var(--text-primary); margin:0 0 7px;
        }
        .tl-form .tl-hint{
          font-size:14px; color:var(--text-secondary); margin:0 0 30px;
        }

        .tl-label{
          display:block; font-size:12px; font-weight:600;
          letter-spacing:.055em; text-transform:uppercase;
          color:var(--text-secondary); margin-bottom:7px;
        }

        .tl-form .ant-input-affix-wrapper{
          background:var(--bg-secondary);
          border:1px solid var(--border-color);
          border-radius:10px;
          padding:11px 14px;
          transition:border-color .15s ease, box-shadow .15s ease;
        }
        .tl-form .ant-input-affix-wrapper:hover{border-color:var(--gold-deep);}
        .tl-form .ant-input-affix-wrapper-focused,
        .tl-form .ant-input-affix-wrapper:focus-within{
          border-color:var(--gold);
          box-shadow:0 0 0 3px rgba(212,175,55,.16);
        }
        .tl-form .ant-input{
          background:transparent;
          color:var(--text-primary);
          font-size:15px;
        }
        .tl-form .ant-input::placeholder{color:var(--text-secondary); opacity:.65;}
        .tl-form .anticon{color:var(--text-secondary);}
        /* Chrome tự điền làm nền vàng, đè lại cho khớp giao diện */
        .tl-form input:-webkit-autofill,
        .tl-form input:-webkit-autofill:focus{
          -webkit-text-fill-color:var(--text-primary);
          -webkit-box-shadow:0 0 0 1000px var(--bg-secondary) inset;
          caret-color:var(--text-primary);
        }

        .tl-submit.ant-btn{
          width:100%; height:48px;
          border:none; border-radius:10px;
          background:var(--navy);
          color:#fff;
          font-size:15.5px; font-weight:600;
          letter-spacing:.01em;
          display:inline-flex; align-items:center; justify-content:center; gap:9px;
          box-shadow:0 6px 18px rgba(15,44,89,.26);
          transition:background .15s ease, transform .12s ease, box-shadow .15s ease;
        }
        .tl-submit.ant-btn:hover:not(:disabled){
          background:var(--navy-lift) !important;
          color:#fff !important;
          transform:translateY(-1px);
        }
        .tl-submit.ant-btn:active:not(:disabled){transform:translateY(0);}
        .tl-submit.ant-btn:focus-visible{
          outline:2px solid var(--gold); outline-offset:2px;
        }
        /* Nền tối: navy chìm vào nền nên đổi sang vàng chữ navy */
        :root[data-theme='dark'] .tl-submit.ant-btn{
          background:var(--gold); color:var(--navy);
          box-shadow:0 6px 18px rgba(212,175,55,.2);
        }
        :root[data-theme='dark'] .tl-submit.ant-btn:hover:not(:disabled){
          background:#E4C255 !important; color:var(--navy) !important;
        }

        .tl-form-foot{
          margin-top:26px; padding-top:18px;
          border-top:1px solid var(--border-color);
          font-size:12.5px; color:var(--text-secondary); line-height:1.55;
        }

        @media (prefers-reduced-motion: reduce){
          .tl-login *{transition:none !important; transform:none !important;}
        }
      `}</style>

      {/* Cột trái — thương hiệu */}
      <aside className="tl-brand">
        <div className="tl-mark">
          <img src="/logo.svg" alt="" />
          <div>
            <p className="tl-wordmark">KPI <span>Trí Long</span></p>
            <div className="tl-sub">Kiến tạo sự bền vững</div>
          </div>
        </div>

        <div className="tl-pitch">
          <h2>Quản trị nhân sự và KPI</h2>
          <div className="tl-rule" />
          <ul className="tl-points">
            <li>Chấm công bằng định vị và nhận diện khuôn mặt</li>
            <li>Chấm điểm theo tuần, tổng kết và xếp loại theo tháng</li>
            <li>Duyệt thực chiến, bài lan tỏa, đào tạo và chốt căn</li>
            <li>Xuất báo cáo Excel cho từng nhân sự và toàn công ty</li>
          </ul>
        </div>

        <div className="tl-brand-foot">
          Trí Long Land © {new Date().getFullYear()}
        </div>
      </aside>

      {/* Cột phải — biểu mẫu */}
      <main className="tl-form-col">
        <div className="tl-form">
          <h1>Đăng nhập</h1>
          <p className="tl-hint">Dành cho quản trị viên và trưởng phòng.</p>

          <Form name="login_form" onFinish={onFinish} layout="vertical" size="large" requiredMark={false}>
            <Form.Item
              name="username"
              label={<span className="tl-label">Tên đăng nhập</span>}
              rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập' }]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="Nhập tên đăng nhập"
                autoComplete="username"
                autoFocus
              />
            </Form.Item>

            <Form.Item
              name="password"
              label={<span className="tl-label">Mật khẩu</span>}
              rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Nhập mật khẩu"
                autoComplete="current-password"
              />
            </Form.Item>

            <Form.Item style={{ marginTop: 26, marginBottom: 0 }}>
              <Button className="tl-submit" type="primary" htmlType="submit" loading={loading}>
                Đăng nhập <ArrowRightOutlined style={{ fontSize: 13 }} />
              </Button>
            </Form.Item>
          </Form>

          <div className="tl-form-foot">
            Quên mật khẩu hoặc chưa có tài khoản? Liên hệ bộ phận nhân sự để được cấp lại.
          </div>
        </div>
      </main>
    </div>
  );
};
