import { useState } from 'react';
import { Alert, Button, Modal, Table, Tag, message } from 'antd';
import { MessageOutlined, ReloadOutlined } from '@ant-design/icons';
import { apiClient } from '../utils/apiClient';

/**
 * Cài đặt tự đăng nhóm Zalo: Thực chiến / Đào tạo 1-1 được duyệt thì máy chủ
 * gửi ảnh + nội dung vào nhóm Zalo qua Zalo Bot.
 *
 * Token và mã nhóm đặt ở biến môi trường máy chủ (ZALO_BOT_TOKEN,
 * ZALO_NHOM_THUC_CHIEN, ZALO_NHOM_DAO_TAO). Màn này chỉ để xem đã bật chưa,
 * lấy mã nhóm (chat_id) sau khi nhắn một câu vào nhóm có bot, và gửi thử.
 */
export const NutNhomZalo = () => {
  const [mo, setMo] = useState(false);
  const [tt, setTt] = useState(null);
  const [ds, setDs] = useState([]);
  const [dangTai, setDangTai] = useState(false);
  const [loi, setLoi] = useState('');

  const tai = async () => {
    setDangTai(true);
    setLoi('');
    try {
      const t = await apiClient.get('/zalo/trang-thai');
      setTt(t);
      if (t?.coBot) setDs((await apiClient.get('/zalo/nhom-gan-day')) || []);
    } catch (e) {
      setLoi(e?.message || 'Không tải được');
    } finally {
      setDangTai(false);
    }
  };

  const guiThu = async (chatId) => {
    try {
      await apiClient.post('/zalo/gui-thu', { chatId });
      message.success('Đã gửi tin thử — mở nhóm Zalo để xem.');
    } catch (e) {
      message.error(e?.message || 'Không gửi được');
    }
  };

  const chep = (v) => {
    navigator.clipboard?.writeText(String(v)).then(() => message.success('Đã chép mã nhóm.'), () => {});
  };

  const nhan = (bat) => (bat ? <Tag color="success">Đã bật</Tag> : <Tag>Chưa bật</Tag>);

  return (
    <>
      <Button icon={<MessageOutlined />} onClick={() => { setMo(true); tai(); }}>Nhóm Zalo</Button>
      <Modal title="Tự đăng lên nhóm Zalo" open={mo} onCancel={() => setMo(false)} footer={null} width={640}>
        <p style={{ color: 'var(--text-secondary)', marginTop: 0 }}>
          Báo cáo <b>Thực chiến</b> và <b>Đào tạo 1-1</b> được duyệt sẽ tự đăng ảnh, tên, phòng, nội dung vào nhóm Zalo.
          Không đăng số điện thoại khách. Các mục khác không đăng.
        </p>
        {loi && <Alert type="error" showIcon message={loi} style={{ marginBottom: 12 }} />}
        {tt && (
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 12 }}>
            <span>Bot: {nhan(tt.coBot)}</span>
            <span>Nhóm Thực chiến: {nhan(tt.nhomThucChien)}</span>
            <span>Nhóm Đào tạo 1-1: {nhan(tt.nhomDaoTao)}</span>
          </div>
        )}
        {tt && !tt.coBot && (
          <Alert type="info" showIcon message="Chưa có bot"
            description="Tạo bot ở Zalo Bot Manager, đặt token vào biến ZALO_BOT_TOKEN trên Render rồi deploy lại." />
        )}
        {tt?.coBot && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '4px 0 8px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>
                Tin nhắn gần đây gửi tới bot. Nhắn một câu vào nhóm có bot rồi bấm Tải lại để thấy mã nhóm.
              </span>
              <Button size="small" icon={<ReloadOutlined />} loading={dangTai} onClick={tai}>Tải lại</Button>
            </div>
            <Table size="small" rowKey={(r, i) => `${r.chatId}-${i}`} loading={dangTai} dataSource={ds}
              pagination={false} locale={{ emptyText: 'Chưa có tin nhắn nào gửi tới bot' }}
              columns={[
                { title: 'Loại', dataIndex: 'loai', width: 90, render: v => (v === 'GROUP' ? <Tag color="blue">Nhóm</Tag> : <Tag>Cá nhân</Tag>) },
                { title: 'Người nhắn', dataIndex: 'nguoiNhan', width: 130 },
                { title: 'Tin', dataIndex: 'noiDung', ellipsis: true },
                {
                  title: 'Mã nhóm', dataIndex: 'chatId', width: 170, render: (v) => (
                    <div style={{ display: 'flex', gap: 4 }}>
                      <Button size="small" onClick={() => chep(v)}>Chép mã</Button>
                      <Button size="small" onClick={() => guiThu(v)}>Gửi thử</Button>
                    </div>
                  ),
                },
              ]} />
          </>
        )}
      </Modal>
    </>
  );
};
