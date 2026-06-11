import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, InputNumber, message, Popconfirm, Space, Tag, Card } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, AppstoreOutlined } from '@ant-design/icons';
import { saleProApi } from '../api/saleProApi';
import { getStatusMeta } from '../components/saleProFormat';

const STATUS_OPTS = [
  { value: 'CON_HANG', label: 'Còn hàng' },
  { value: 'QUY_DOC_QUYEN', label: 'Quỹ Độc quyền' },
  { value: 'DA_BAN', label: 'Đã bán' },
];
const DIRECTION_OPTS = ['DONG', 'TAY', 'NAM', 'BAC', 'DONG_BAC', 'DONG_NAM', 'TAY_BAC', 'TAY_NAM'].map((v) => ({ value: v, label: v }));

export const InventoryAdmin = () => {
  const [projects, setProjects] = useState([]);
  const [projectId, setProjectId] = useState(null);
  const [buildings, setBuildings] = useState([]);
  const [building, setBuilding] = useState(null);
  const [apartments, setApartments] = useState([]);
  const [loadingApts, setLoadingApts] = useState(false);

  const [bOpen, setBOpen] = useState(false);
  const [bEditing, setBEditing] = useState(null);
  const [bForm] = Form.useForm();

  const [aOpen, setAOpen] = useState(false);
  const [aEditing, setAEditing] = useState(null);
  const [aForm] = Form.useForm();

  useEffect(() => { saleProApi.getAllProjects().then((d) => setProjects(d || [])).catch(() => {}); }, []);

  const loadBuildings = async (pid) => {
    try { setBuildings((await saleProApi.getBuildingsByProjectId(pid)) || []); } catch { setBuildings([]); }
  };
  useEffect(() => { if (projectId) { loadBuildings(projectId); setBuilding(null); setApartments([]); } }, [projectId]);

  const loadApartments = async (bid) => {
    setLoadingApts(true);
    try { setApartments((await saleProApi.getApartmentsByBuildingId(bid)) || []); }
    catch { setApartments([]); }
    finally { setLoadingApts(false); }
  };
  useEffect(() => { if (building) loadApartments(building.id); }, [building]);

  // ---- Building CRUD ----
  const openBuilding = (rec) => {
    setBEditing(rec || null);
    bForm.resetFields();
    if (rec) bForm.setFieldsValue(rec);
    setBOpen(true);
  };
  const submitBuilding = async () => {
    try {
      const v = await bForm.validateFields();
      const body = { ...v, projectId };
      if (bEditing) await saleProApi.updateBuilding(bEditing.id, body);
      else await saleProApi.createBuilding(body);
      message.success('Đã lưu tòa nhà.'); setBOpen(false); loadBuildings(projectId);
    } catch (e) { if (!e?.errorFields) message.error(e?.message || 'Lỗi.'); }
  };
  const deleteBuilding = async (id) => { try { await saleProApi.deleteBuilding(id); message.success('Đã xóa.'); loadBuildings(projectId); } catch (e) { message.error(e?.message || 'Xóa thất bại (còn căn hộ?).'); } };

  // ---- Apartment CRUD ----
  const openApartment = (rec) => {
    setAEditing(rec || null);
    aForm.resetFields();
    if (rec) aForm.setFieldsValue(rec);
    setAOpen(true);
  };
  const submitApartment = async () => {
    try {
      const v = await aForm.validateFields();
      const body = { ...v, buildingId: building.id };
      if (aEditing) await saleProApi.updateApartment(aEditing.id, body);
      else await saleProApi.createApartment(body);
      message.success('Đã lưu căn hộ.'); setAOpen(false); loadApartments(building.id);
    } catch (e) { if (!e?.errorFields) message.error(e?.message || 'Lỗi.'); }
  };
  const deleteApartment = async (id) => { try { await saleProApi.deleteApartment(id); message.success('Đã xóa.'); loadApartments(building.id); } catch (e) { message.error(e?.message || 'Xóa thất bại.'); } };

  const buildingCols = [
    { title: 'Tòa', dataIndex: 'buildingName' },
    { title: 'Phân khu', dataIndex: 'subdivisionName' },
    { title: 'Số tầng', dataIndex: 'totalFloors' },
    { title: 'Số căn (thực tế)', dataIndex: 'apartmentCount' },
    { title: 'Tiến độ %', dataIndex: 'constructionProgress' },
    {
      title: 'Thao tác', width: 200, render: (_, r) => (
        <Space wrap>
          <Button size="small" type={building?.id === r.id ? 'primary' : 'default'} icon={<AppstoreOutlined />} onClick={() => setBuilding(r)}>Quỹ căn</Button>
          <Button size="small" icon={<EditOutlined />} onClick={() => openBuilding(r)} />
          <Popconfirm title="Xóa tòa?" onConfirm={() => deleteBuilding(r.id)}><Button size="small" danger icon={<DeleteOutlined />} /></Popconfirm>
        </Space>
      ),
    },
  ];

  const apartmentCols = [
    { title: 'Mã căn', dataIndex: 'apartmentCode' },
    { title: 'Loại', dataIndex: 'apartmentType' },
    { title: 'Hướng', dataIndex: 'direction' },
    { title: 'Tầng', dataIndex: 'floor' },
    { title: 'Giá NY (tỷ)', dataIndex: 'listedPrice' },
    { title: 'Trạng thái', dataIndex: 'status', render: (s) => { const m = getStatusMeta(s); return <Tag style={{ color: m.color, background: m.bg, borderColor: m.border }}>{m.label}</Tag>; } },
    { title: '', width: 90, render: (_, r) => <Space><Button size="small" icon={<EditOutlined />} onClick={() => openApartment(r)} /><Popconfirm title="Xóa căn?" onConfirm={() => deleteApartment(r.id)}><Button size="small" danger icon={<DeleteOutlined />} /></Popconfirm></Space> },
  ];

  const numItem = (name, label) => <Form.Item name={name} label={label} style={{ flex: 1, minWidth: 150 }}><InputNumber style={{ width: '100%' }} /></Form.Item>;
  const txtItem = (name, label, req) => <Form.Item name={name} label={label} rules={req ? [{ required: true }] : []} style={{ flex: 1, minWidth: 150 }}><Input /></Form.Item>;

  return (
    <div>
      <h2 style={{ marginTop: 0 }}>Quản lý Tòa nhà & Quỹ căn</h2>
      <Select style={{ width: 360, marginBottom: 16 }} placeholder="Chọn dự án" value={projectId} onChange={setProjectId}
        options={projects.map((p) => ({ value: p.id, label: `${p.name} (${p.projectType})` }))} />

      {projectId && (
        <Card size="small" title="Tòa nhà / Phân khu" extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => openBuilding(null)}>Thêm tòa</Button>} style={{ marginBottom: 16 }}>
          <Table rowKey="id" size="small" columns={buildingCols} dataSource={buildings} pagination={false} />
        </Card>
      )}

      {building && (
        <Card size="small" title={`Quỹ căn — Tòa ${building.buildingName}`} extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => openApartment(null)}>Thêm căn</Button>}>
          <Table rowKey="id" size="small" columns={apartmentCols} dataSource={apartments} loading={loadingApts} scroll={{ x: 800 }} />
        </Card>
      )}

      {/* Modal tòa nhà */}
      <Modal open={bOpen} onCancel={() => setBOpen(false)} onOk={submitBuilding} width={760} title={bEditing ? 'Sửa tòa nhà' : 'Thêm tòa nhà'} okText="Lưu" cancelText="Hủy" destroyOnHidden>
        <Form form={bForm} layout="vertical">
          <Space wrap align="start">
            {txtItem('buildingName', 'Tên tòa', true)}
            {txtItem('subdivisionName', 'Phân khu')}
            {numItem('totalFloors', 'Số tầng')}
          </Space>
          <Space wrap align="start">
            {txtItem('ownershipType', 'Hình thức sở hữu')}
            {txtItem('buildingHandoverStandard', 'Tiêu chuẩn bàn giao')}
            {numItem('totalApartments', 'Số căn (công bố)')}
          </Space>
          <Space wrap align="start">
            {numItem('totalArea', 'Tổng diện tích')}
            {numItem('elevatorCount', 'Số thang máy')}
            {numItem('constructionProgress', 'Tiến độ %')}
          </Space>
          <Space wrap align="start">
            {numItem('markerLat', 'Marker Lat')}
            {numItem('markerLng', 'Marker Lng')}
          </Space>
          <Form.Item name="imageUrl" label="Link ảnh tòa"><Input /></Form.Item>
          <Form.Item name="description" label="Mô tả tòa"><Input.TextArea rows={2} /></Form.Item>
          <Form.Item name="salesPolicy" label="Chính sách bán hàng (tòa)"><Input.TextArea rows={2} /></Form.Item>
        </Form>
      </Modal>

      {/* Modal căn hộ */}
      <Modal open={aOpen} onCancel={() => setAOpen(false)} onOk={submitApartment} width={820} title={aEditing ? 'Sửa căn hộ' : 'Thêm căn hộ'} okText="Lưu" cancelText="Hủy" destroyOnHidden>
        <Form form={aForm} layout="vertical">
          <Space wrap align="start">
            {txtItem('apartmentCode', 'Mã căn', true)}
            {txtItem('apartmentType', 'Loại hình (vd 2BR)')}
            <Form.Item name="direction" label="Hướng" style={{ flex: 1, minWidth: 150 }}><Select allowClear options={DIRECTION_OPTS} /></Form.Item>
          </Space>
          <Space wrap align="start">
            {txtItem('floor', 'Tầng')}
            {txtItem('axis', 'Trục')}
            <Form.Item name="status" label="Trạng thái" style={{ flex: 1, minWidth: 150 }}><Select options={STATUS_OPTS} /></Form.Item>
          </Space>
          <Space wrap align="start">
            {numItem('listedPrice', 'Giá NY (tỷ)')}
            {numItem('loanPrice', 'Giá vay (tỷ)')}
            {numItem('earlyPaymentPrice', 'Giá TTS (tỷ)')}
            {numItem('progressPaymentPrice', 'Giá TTTĐ (tỷ)')}
          </Space>
          <Space wrap align="start">
            {numItem('clearanceArea', 'DT thông thủy')}
            {numItem('builtUpArea', 'DT tim tường')}
            {numItem('landArea', 'DT đất')}
            {numItem('constructionArea', 'DT xây dựng')}
          </Space>
          <Space wrap align="start">
            {txtItem('supportedBanks', 'Ngân hàng hỗ trợ')}
            {txtItem('handoverStandard', 'Tiêu chuẩn bàn giao')}
            {txtItem('fundType', 'Quỹ căn (vd Sơ cấp)')}
          </Space>
          <Space wrap align="start">
            {txtItem('salesPolicyApplied', 'CSBH áp dụng (text)')}
            {txtItem('salesPolicyDate', 'CSBH ngày (YYYY-MM-DD)')}
          </Space>
          <Form.Item name="giftsPromotions" label="Quà tặng"><Input /></Form.Item>
          <Form.Item name="viewDescription" label="View / mô tả"><Input /></Form.Item>
          <Form.Item name="thumbnailUrl" label="Link ảnh layout căn"><Input /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default InventoryAdmin;
