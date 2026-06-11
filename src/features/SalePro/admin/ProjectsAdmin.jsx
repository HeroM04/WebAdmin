import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, message, Popconfirm, Space, Tag, InputNumber, Tabs, Alert } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { saleProApi } from '../api/saleProApi';

const { TextArea } = Input;

const PROJECT_TYPES = [
  { value: 'CAO_TANG', label: 'Cao tầng (có Tòa nhà)' },
  { value: 'THAP_TANG', label: 'Thấp tầng (không có Tòa nhà)' },
];
const STATUSES = [
  { value: 'SAP_MO_BAN', label: 'Sắp mở bán' },
  { value: 'DANG_BAN', label: 'Đang bán' },
  { value: 'DA_HET_HANG', label: 'Đã hết hàng' },
];

const splitLines = (s) => (s ? s.split('\n').map((x) => x.trim()).filter(Boolean) : []);

export const ProjectsAdmin = () => {
  const [data, setData] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();

  const load = async () => {
    setLoading(true);
    try {
      const [projects, ag] = await Promise.all([saleProApi.getAllProjects(), saleProApi.listAgents().catch(() => [])]);
      setData(projects || []);
      setAgents(ag || []);
    } catch (e) { message.error('Không tải được dự án.'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const openModal = (record) => {
    setEditing(record || null);
    form.resetFields();
    if (record) {
      const d = record.details || {};
      form.setFieldsValue({
        name: record.name,
        projectType: record.projectType,
        status: record.status,
        managingAgentId: record.managingAgent?.id,
        // Tổng quan
        overview: d.overview, developer: d.developer, address: d.address,
        totalProjectArea: d.totalProjectArea, scaleDescription: d.scaleDescription,
        constructionDensity: d.constructionDensity, apartmentTypes: d.apartmentTypes,
        scale: d.scale, capital: d.capital, residents: d.residents,
        overviewBulletsText: (d.overviewBullets || []).join('\n'),
        bannerImageUrl: d.bannerImageUrl, overviewImageUrl: d.overviewImageUrl,
        // Vị trí
        locationDescription: d.locationDescription, locationMap: d.locationMap,
        mapImageUrl: d.mapImageUrl, mapEmbedUrl: d.mapEmbedUrl,
        latitude: d.latitude, longitude: d.longitude,
        connectionPoints: d.connectionPoints || [],
        // Đào tạo
        trainingVideoUrl: d.trainingVideoUrl, trainingThumbnail: d.trainingThumbnail,
        trainingMaterialsText: (d.trainingMaterials || []).join('\n'),
        // Mặt bằng
        masterplanImageUrl: d.masterplanImageUrl,
        // 360
        images360Text: (d.images360 || []).join('\n'),
        // CSBH
        salesPolicy: d.salesPolicy,
        // Trang Tổng quan (landing)
        heroImagesText: (d.heroImages || []).join('\n'),
        productCount: d.productCount, ownership: d.ownership,
        featureTitle: d.featureTitle, featureDescription: d.featureDescription,
        featureVideoUrl: d.featureVideoUrl, featureImage: d.featureImage,
        products: (d.products || []).map((p) => ({ name: p.name, areaRange: p.areaRange, imagesText: (p.images || []).join('\n') })),
        amenities: d.amenities || [],
      });
    }
    setOpen(true);
  };

  const onSubmit = async () => {
    try {
      const v = await form.validateFields();
      const details = {
        ...(editing?.details || {}),
        overview: v.overview || null,
        developer: v.developer, address: v.address, totalProjectArea: v.totalProjectArea,
        scaleDescription: v.scaleDescription, constructionDensity: v.constructionDensity, apartmentTypes: v.apartmentTypes,
        scale: v.scale, capital: v.capital, residents: v.residents,
        overviewBullets: splitLines(v.overviewBulletsText),
        bannerImageUrl: v.bannerImageUrl, overviewImageUrl: v.overviewImageUrl,
        locationDescription: v.locationDescription, locationMap: v.locationMap,
        mapImageUrl: v.mapImageUrl, mapEmbedUrl: v.mapEmbedUrl,
        latitude: v.latitude ?? null, longitude: v.longitude ?? null,
        connectionPoints: (v.connectionPoints || []).filter((c) => c && (c.time || c.label)),
        trainingVideoUrl: v.trainingVideoUrl, trainingThumbnail: v.trainingThumbnail,
        trainingMaterials: splitLines(v.trainingMaterialsText),
        masterplanImageUrl: v.masterplanImageUrl,
        images360: splitLines(v.images360Text),
        salesPolicy: v.salesPolicy,
        // Trang Tổng quan (landing)
        heroImages: splitLines(v.heroImagesText),
        productCount: v.productCount, ownership: v.ownership,
        featureTitle: v.featureTitle, featureDescription: v.featureDescription,
        featureVideoUrl: v.featureVideoUrl, featureImage: v.featureImage,
        products: (v.products || []).filter(Boolean).map((p) => ({ name: p.name, areaRange: p.areaRange, images: splitLines(p.imagesText) })),
        amenities: (v.amenities || []).filter((a) => a && (a.label || a.image)),
      };
      const body = { name: v.name, projectType: v.projectType, status: v.status, managingAgentId: v.managingAgentId, details };
      if (editing) await saleProApi.updateProject(editing.id, body);
      else await saleProApi.createProject(body);
      message.success('Đã lưu dự án.');
      setOpen(false);
      load();
    } catch (e) {
      if (e?.errorFields) { message.warning('Vui lòng kiểm tra các trường bắt buộc (tab Cơ bản).'); return; }
      message.error(e?.message || 'Lưu thất bại.');
    }
  };

  const onDelete = async (id) => {
    try { await saleProApi.deleteProject(id); message.success('Đã xóa.'); load(); }
    catch (e) { message.error(e?.message || 'Xóa thất bại (kiểm tra ràng buộc tòa/căn).'); }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 60 },
    { title: 'Tên dự án', dataIndex: 'name' },
    { title: 'Loại', dataIndex: 'projectType', render: (v) => <Tag color={v === 'CAO_TANG' ? 'blue' : 'green'}>{v}</Tag> },
    { title: 'Trạng thái', dataIndex: 'status' },
    { title: 'Chuyên viên', render: (_, r) => r.managingAgent?.fullName || '—' },
    {
      title: 'Thao tác', width: 160, render: (_, r) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openModal(r)}>Quản lý</Button>
          <Popconfirm title="Xóa dự án này?" onConfirm={() => onDelete(r.id)} okText="Xóa" cancelText="Hủy">
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const img = (name, label) => <Form.Item name={name} label={label}><Input placeholder="https://..." /></Form.Item>;

  const tabItems = [
    {
      key: 'basic', label: 'Cơ bản',
      children: (
        <>
          <Form.Item name="name" label="Tên dự án" rules={[{ required: true, message: 'Nhập tên dự án' }]}><Input /></Form.Item>
          <Space wrap align="start">
            <Form.Item name="projectType" label="Loại hình" rules={[{ required: true }]} style={{ minWidth: 240 }}><Select options={PROJECT_TYPES} /></Form.Item>
            <Form.Item name="status" label="Trạng thái" style={{ minWidth: 200 }}><Select options={STATUSES} /></Form.Item>
            <Form.Item name="managingAgentId" label="Chuyên viên quản lý" style={{ minWidth: 240 }}>
              <Select allowClear placeholder="Chọn chuyên viên" options={agents.map((a) => ({ value: a.id, label: `${a.fullName}${a.title ? ` (${a.title})` : ''}` }))} />
            </Form.Item>
          </Space>
        </>
      ),
    },
    {
      key: 'overview', label: 'Tổng quan',
      children: (
        <>
          <Form.Item name="heroImagesText" label="Ảnh Hero (carousel đầu trang — mỗi dòng 1 URL)"><TextArea rows={3} /></Form.Item>
          <Space wrap align="start">
            <Form.Item name="productCount" label='Thẻ "Sản phẩm" (vd 4500 căn)' style={{ minWidth: 200 }}><Input /></Form.Item>
            <Form.Item name="ownership" label='Thẻ "Sở hữu" (vd Lâu dài)' style={{ minWidth: 200 }}><Input /></Form.Item>
          </Space>
          <Space wrap align="start">
            <Form.Item name="developer" label="Nhà phát triển" style={{ minWidth: 220 }}><Input /></Form.Item>
            <Form.Item name="address" label="Vị trí (ngắn)" style={{ minWidth: 260 }}><Input /></Form.Item>
          </Space>
          <Space wrap align="start">
            <Form.Item name="scale" label="Quy mô (vd 1080 ha)" style={{ minWidth: 180 }}><Input /></Form.Item>
            <Form.Item name="capital" label="Vốn" style={{ minWidth: 180 }}><Input /></Form.Item>
            <Form.Item name="residents" label="Cư dân" style={{ minWidth: 180 }}><Input /></Form.Item>
          </Space>
          <Space wrap align="start">
            <Form.Item name="totalProjectArea" label="Tổng diện tích (vd 82.820 m²)" style={{ minWidth: 220 }}><Input /></Form.Item>
            <Form.Item name="scaleDescription" label="Quy mô mô tả (vd 10 tòa | 35-46 tầng)" style={{ minWidth: 240 }}><Input /></Form.Item>
            <Form.Item name="constructionDensity" label="Mật độ XD (vd 28.8%)" style={{ minWidth: 160 }}><Input /></Form.Item>
          </Space>
          <Form.Item name="apartmentTypes" label="Loại hình căn hộ (vd Studio, 1BR, 2BR, Duplex...)"><Input /></Form.Item>
          <Form.Item name="overviewBulletsText" label="Gạch đầu dòng tổng quan (mỗi dòng 1 ý)"><TextArea rows={5} /></Form.Item>
          <Form.Item name="overview" label="Mô tả tổng quan (đoạn văn)"><TextArea rows={3} /></Form.Item>
          {img('bannerImageUrl', 'Ảnh banner')}
          {img('overviewImageUrl', 'Ảnh minh hoạ tổng quan')}
        </>
      ),
    },
    {
      key: 'location', label: 'Vị trí',
      children: (
        <>
          <Form.Item name="locationDescription" label="Mô tả vị trí"><TextArea rows={4} /></Form.Item>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>Điểm kết nối (Thời gian + Địa điểm)</div>
          <Form.List name="connectionPoints">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...rest }) => (
                  <Space key={key} align="baseline" style={{ display: 'flex', marginBottom: 4 }}>
                    <Form.Item {...rest} name={[name, 'time']} style={{ marginBottom: 0 }}><Input placeholder="01" style={{ width: 80 }} /></Form.Item>
                    <Form.Item {...rest} name={[name, 'label']} style={{ marginBottom: 0 }}><Input placeholder="Ga Cát Linh - Thượng Đình" style={{ width: 360 }} /></Form.Item>
                    <MinusCircleOutlined onClick={() => remove(name)} />
                  </Space>
                ))}
                <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />} block style={{ marginTop: 8 }}>Thêm điểm kết nối</Button>
              </>
            )}
          </Form.List>
          <div style={{ marginTop: 16 }}>
            {img('mapEmbedUrl', 'Link nhúng Google Maps (iframe src)')}
            {img('mapImageUrl', 'Ảnh bản đồ (nếu không nhúng)')}
            <Space wrap align="start">
              <Form.Item name="latitude" label="Vĩ độ (lat)"><InputNumber style={{ width: 160 }} /></Form.Item>
              <Form.Item name="longitude" label="Kinh độ (lng)"><InputNumber style={{ width: 160 }} /></Form.Item>
              <Form.Item name="locationMap" label="Mô tả map (cũ)" style={{ minWidth: 240 }}><Input /></Form.Item>
            </Space>
          </div>
        </>
      ),
    },
    {
      key: 'training', label: 'Đào tạo',
      children: (
        <>
          {img('trainingVideoUrl', 'Link video đào tạo (embed)')}
          {img('trainingThumbnail', 'Ảnh thumbnail video')}
          <Form.Item name="trainingMaterialsText" label="Tài liệu đào tạo (mỗi dòng 1 link)"><TextArea rows={4} /></Form.Item>
        </>
      ),
    },
    {
      key: 'masterplan', label: 'Mặt bằng',
      children: <>{img('masterplanImageUrl', 'Ảnh mặt bằng tổng (masterplan)')}</>,
    },
    {
      key: '360', label: 'Ảnh 360º',
      children: <Form.Item name="images360Text" label="Ảnh 360 / panorama (mỗi dòng 1 link)"><TextArea rows={5} /></Form.Item>,
    },
    {
      key: 'policy', label: 'CSBH',
      children: <Form.Item name="salesPolicy" label="Chính sách bán hàng (HTML/đoạn văn)"><TextArea rows={6} /></Form.Item>,
    },
    {
      key: 'landing', label: 'Sản phẩm & Tiện ích',
      children: (
        <>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>Sản phẩm (loại căn hộ)</div>
          <Form.List name="products">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...rest }) => (
                  <div key={key} style={{ border: '1px solid #eee', borderRadius: 8, padding: 12, marginBottom: 8 }}>
                    <Space wrap align="start">
                      <Form.Item {...rest} name={[name, 'name']} label="Tên loại căn" style={{ minWidth: 220 }}><Input placeholder="Căn hộ 1BR/1BR+1" /></Form.Item>
                      <Form.Item {...rest} name={[name, 'areaRange']} label="Diện tích" style={{ minWidth: 160 }}><Input placeholder="50 - 102 m²" /></Form.Item>
                      <MinusCircleOutlined onClick={() => remove(name)} style={{ marginTop: 38 }} />
                    </Space>
                    <Form.Item {...rest} name={[name, 'imagesText']} label="Ảnh layout (mỗi dòng 1 URL)"><TextArea rows={2} /></Form.Item>
                  </div>
                ))}
                <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />} block>Thêm loại căn</Button>
              </>
            )}
          </Form.List>

          <div style={{ fontWeight: 600, margin: '20px 0 8px' }}>Tiện ích</div>
          <Form.List name="amenities">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...rest }) => (
                  <Space key={key} align="baseline" style={{ display: 'flex', marginBottom: 4 }}>
                    <Form.Item {...rest} name={[name, 'label']} style={{ marginBottom: 0 }}><Input placeholder="Thư viện" style={{ width: 200 }} /></Form.Item>
                    <Form.Item {...rest} name={[name, 'image']} style={{ marginBottom: 0 }}><Input placeholder="https://... (ảnh)" style={{ width: 360 }} /></Form.Item>
                    <MinusCircleOutlined onClick={() => remove(name)} />
                  </Space>
                ))}
                <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />} block style={{ marginTop: 8 }}>Thêm tiện ích</Button>
              </>
            )}
          </Form.List>

          <div style={{ fontWeight: 600, margin: '20px 0 8px' }}>Banner video đặc trưng</div>
          <Form.Item name="featureTitle" label="Tiêu đề"><Input /></Form.Item>
          <Form.Item name="featureDescription" label="Mô tả"><TextArea rows={3} /></Form.Item>
          {img('featureVideoUrl', 'Link video')}
          {img('featureImage', 'Ảnh poster')}
        </>
      ),
    },
    {
      key: 'progress', label: 'Tiến độ',
      children: editing
        ? <ProgressManager projectId={editing.id} />
        : <Alert type="info" showIcon message="Lưu dự án trước, sau đó mở lại để quản lý Tiến độ." />,
    },
    {
      key: 'documents', label: 'Tài liệu',
      children: editing
        ? <DocumentsManager projectId={editing.id} />
        : <Alert type="info" message="Lưu dự án trước, sau đó mở lại để quản lý Tài liệu." />,
    },
    {
      key: 'others', label: 'Tòa nhà / Quỹ căn / Tin tức',
      children: (
        <Alert type="info" showIcon message="Quản lý ở mục riêng" description={
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            <li><b>Tòa nhà, Bảng hàng, Quỹ căn</b>: vào menu <b>"Tòa nhà & Quỹ căn"</b> (chọn dự án này).</li>
            <li><b>Tin tức dự án</b>: vào menu <b>"Quản lý Tin tức"</b>, tạo bài và gắn dự án này.</li>
          </ul>
        } />
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>Quản lý Dự án</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal(null)}>Thêm dự án</Button>
      </div>
      <Table rowKey="id" columns={columns} dataSource={data} loading={loading} bordered scroll={{ x: 900 }} />

      <Modal open={open} onCancel={() => setOpen(false)} onOk={onSubmit} width={940} style={{ top: 24 }}
        title={editing ? `Quản lý dự án — ${editing.name}` : 'Thêm dự án'} okText="Lưu" cancelText="Hủy" destroyOnHidden>
        <Form form={form} layout="vertical">
          <Tabs items={tabItems} />
        </Form>
      </Modal>
    </div>
  );
};

// ===== Tiến độ (inline) =====
const ProgressManager = ({ projectId }) => {
  const [list, setList] = useState([]);
  const [form] = Form.useForm();
  const [editing, setEditing] = useState(null);

  const load = async () => { try { setList((await saleProApi.getProjectProgress(projectId)) || []); } catch { /* ignore */ } };
  useEffect(() => { load(); }, [projectId]); // eslint-disable-line

  const submit = async () => {
    try {
      const v = await form.validateFields();
      const body = { projectId, title: v.title, progressDate: v.progressDate || null, externalUrl: v.externalUrl, images: splitLines(v.imagesCsv), sortOrder: v.sortOrder };
      if (editing) await saleProApi.updateProgress(editing.id, body); else await saleProApi.createProgress(body);
      message.success('Đã lưu mốc tiến độ.'); form.resetFields(); setEditing(null); load();
    } catch (e) { if (!e?.errorFields) message.error(e?.message || 'Lỗi.'); }
  };
  const edit = (r) => { setEditing(r); form.setFieldsValue({ title: r.title, progressDate: r.progressDate, externalUrl: r.externalUrl, imagesCsv: (r.images || []).join('\n'), sortOrder: r.sortOrder }); };
  const remove = async (id) => { try { await saleProApi.deleteProgress(id); load(); } catch (e) { message.error(e?.message); } };

  return (
    <div>
      <Table rowKey="id" size="small" dataSource={list} pagination={false} style={{ marginBottom: 16 }}
        columns={[
          { title: 'Mốc', dataIndex: 'title' }, { title: 'Ngày', dataIndex: 'progressDate' },
          { title: 'Ảnh', dataIndex: 'images', render: (v) => (v || []).length },
          { title: 'Link', dataIndex: 'externalUrl', render: (v) => v ? <a href={v} target="_blank" rel="noreferrer">mở</a> : '—' },
          { title: '', width: 80, render: (_, r) => <Space><Button size="small" icon={<EditOutlined />} onClick={() => edit(r)} /><Popconfirm title="Xóa?" onConfirm={() => remove(r.id)}><Button size="small" danger icon={<DeleteOutlined />} /></Popconfirm></Space> },
        ]} />
      <Form form={form} layout="vertical">
        <Space align="start" wrap>
          <Form.Item name="title" label="Tên mốc (vd Tháng 6/2026)" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="progressDate" label="Ngày (YYYY-MM-DD)"><Input placeholder="2026-06-01" /></Form.Item>
          <Form.Item name="sortOrder" label="Thứ tự"><InputNumber min={0} /></Form.Item>
        </Space>
        <Form.Item name="externalUrl" label="Link ngoài (Drive)"><Input /></Form.Item>
        <Form.Item name="imagesCsv" label="Ảnh (mỗi dòng 1 URL)"><TextArea rows={3} /></Form.Item>
        <Button type="primary" onClick={submit}>{editing ? 'Cập nhật mốc' : 'Thêm mốc'}</Button>
        {editing && <Button style={{ marginLeft: 8 }} onClick={() => { setEditing(null); form.resetFields(); }}>Hủy sửa</Button>}
      </Form>
    </div>
  );
};

// ===== Tài liệu (inline) =====
const DocumentsManager = ({ projectId }) => {
  const [list, setList] = useState([]);
  const [form] = Form.useForm();
  const [editing, setEditing] = useState(null);

  const load = async () => { try { setList((await saleProApi.getProjectDocuments(projectId)) || []); } catch { /* ignore */ } };
  useEffect(() => { load(); }, [projectId]); // eslint-disable-line

  const submit = async () => {
    try {
      const v = await form.validateFields();
      const body = { projectId, label: v.label, driveUrl: v.driveUrl, docType: v.docType, sortOrder: v.sortOrder };
      if (editing) await saleProApi.updateDocument(editing.id, body); else await saleProApi.createDocument(body);
      message.success('Đã lưu tài liệu.'); form.resetFields(); setEditing(null); load();
    } catch (e) { if (!e?.errorFields) message.error(e?.message || 'Lỗi.'); }
  };
  const edit = (r) => { setEditing(r); form.setFieldsValue(r); };
  const remove = async (id) => { try { await saleProApi.deleteDocument(id); load(); } catch (e) { message.error(e?.message); } };

  return (
    <div>
      <Table rowKey="id" size="small" dataSource={list} pagination={false} style={{ marginBottom: 16 }}
        columns={[
          { title: 'Nhãn', dataIndex: 'label' }, { title: 'Loại', dataIndex: 'docType' },
          { title: 'Link Drive', dataIndex: 'driveUrl', render: (v) => v ? <a href={v} target="_blank" rel="noreferrer">mở</a> : '—' },
          { title: '', width: 80, render: (_, r) => <Space><Button size="small" icon={<EditOutlined />} onClick={() => edit(r)} /><Popconfirm title="Xóa?" onConfirm={() => remove(r.id)}><Button size="small" danger icon={<DeleteOutlined />} /></Popconfirm></Space> },
        ]} />
      <Form form={form} layout="vertical">
        <Space align="start" wrap>
          <Form.Item name="label" label="Nhãn (vd TỔNG MẶT BẰNG)" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="docType" label="Loại (PDF/VIDEO/...)"><Input /></Form.Item>
          <Form.Item name="sortOrder" label="Thứ tự"><InputNumber min={0} /></Form.Item>
        </Space>
        <Form.Item name="driveUrl" label="Link Google Drive" rules={[{ required: true }]}><Input /></Form.Item>
        <Button type="primary" onClick={submit}>{editing ? 'Cập nhật tài liệu' : 'Thêm tài liệu'}</Button>
        {editing && <Button style={{ marginLeft: 8 }} onClick={() => { setEditing(null); form.resetFields(); }}>Hủy sửa</Button>}
      </Form>
    </div>
  );
};

export default ProjectsAdmin;
