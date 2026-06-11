import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, message, Popconfirm, Space, Tag, InputNumber } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, FieldTimeOutlined, FileTextOutlined } from '@ant-design/icons';
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

export const ProjectsAdmin = () => {
  const [data, setData] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();

  // sub-modal tiến độ / tài liệu
  const [subProject, setSubProject] = useState(null);
  const [subType, setSubType] = useState(null); // 'progress' | 'documents'

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
      form.setFieldsValue({
        name: record.name,
        projectType: record.projectType,
        status: record.status,
        managingAgentId: record.managingAgent?.id,
        detailsJson: record.details ? JSON.stringify(record.details, null, 2) : '',
      });
    }
    setOpen(true);
  };

  const onSubmit = async () => {
    try {
      const v = await form.validateFields();
      let details = null;
      if (v.detailsJson && v.detailsJson.trim()) {
        try { details = JSON.parse(v.detailsJson); }
        catch { message.error('Trường "Chi tiết (JSON)" không hợp lệ.'); return; }
      }
      const body = { name: v.name, projectType: v.projectType, status: v.status, managingAgentId: v.managingAgentId, details };
      if (editing) await saleProApi.updateProject(editing.id, body);
      else await saleProApi.createProject(body);
      message.success('Đã lưu dự án.');
      setOpen(false);
      load();
    } catch (e) {
      if (e?.errorFields) return;
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
      title: 'Thao tác', width: 260, render: (_, r) => (
        <Space wrap>
          <Button size="small" icon={<EditOutlined />} onClick={() => openModal(r)}>Sửa</Button>
          <Button size="small" icon={<FieldTimeOutlined />} onClick={() => { setSubProject(r); setSubType('progress'); }}>Tiến độ</Button>
          <Button size="small" icon={<FileTextOutlined />} onClick={() => { setSubProject(r); setSubType('documents'); }}>Tài liệu</Button>
          <Popconfirm title="Xóa dự án này?" onConfirm={() => onDelete(r.id)} okText="Xóa" cancelText="Hủy">
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
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

      <Modal open={open} onCancel={() => setOpen(false)} onOk={onSubmit} width={720} title={editing ? 'Sửa dự án' : 'Thêm dự án'} okText="Lưu" cancelText="Hủy" destroyOnHidden>
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Tên dự án" rules={[{ required: true, message: 'Nhập tên dự án' }]}><Input /></Form.Item>
          <Space style={{ display: 'flex' }} align="start">
            <Form.Item name="projectType" label="Loại hình" rules={[{ required: true }]} style={{ flex: 1, minWidth: 220 }}>
              <Select options={PROJECT_TYPES} placeholder="Chọn loại" />
            </Form.Item>
            <Form.Item name="status" label="Trạng thái" style={{ flex: 1, minWidth: 200 }}>
              <Select options={STATUSES} placeholder="Chọn trạng thái" />
            </Form.Item>
            <Form.Item name="managingAgentId" label="Chuyên viên quản lý" style={{ flex: 1, minWidth: 220 }}>
              <Select allowClear placeholder="Chọn chuyên viên" options={agents.map((a) => ({ value: a.id, label: `${a.fullName}${a.title ? ` (${a.title})` : ''}` }))} />
            </Form.Item>
          </Space>
          <Form.Item name="detailsJson" label="Chi tiết (JSON) — Tổng quan/Vị trí/360/CSBH/Đào tạo/Mặt bằng..."
            extra="Cấu trúc linh hoạt. Vd: developer, address, totalProjectArea, scaleDescription, constructionDensity, apartmentTypes, overviewBullets[], bannerImageUrl, locationDescription, connectionPoints[], mapEmbedUrl, masterplanImageUrl, images360[], trainingVideoUrl, salesPolicy...">
            <TextArea rows={10} placeholder='{"developer":"Masterise Homes","address":"Nguyễn Trãi, Hà Nội",...}' />
          </Form.Item>
        </Form>
      </Modal>

      {subType === 'progress' && (
        <ProgressManager project={subProject} onClose={() => setSubType(null)} />
      )}
      {subType === 'documents' && (
        <DocumentsManager project={subProject} onClose={() => setSubType(null)} />
      )}
    </div>
  );
};

// ===== Quản lý Tiến độ của 1 dự án =====
const ProgressManager = ({ project, onClose }) => {
  const [list, setList] = useState([]);
  const [form] = Form.useForm();
  const [editing, setEditing] = useState(null);

  const load = async () => { try { setList((await saleProApi.getProjectProgress(project.id)) || []); } catch { /* ignore */ } };
  useEffect(() => { load(); }, [project.id]); // eslint-disable-line

  const submit = async () => {
    try {
      const v = await form.validateFields();
      const body = {
        projectId: project.id,
        title: v.title,
        progressDate: v.progressDate || null,
        externalUrl: v.externalUrl,
        images: v.imagesCsv ? v.imagesCsv.split('\n').map((s) => s.trim()).filter(Boolean) : [],
        sortOrder: v.sortOrder,
      };
      if (editing) await saleProApi.updateProgress(editing.id, body);
      else await saleProApi.createProgress(body);
      message.success('Đã lưu mốc tiến độ.');
      form.resetFields(); setEditing(null); load();
    } catch (e) { if (!e?.errorFields) message.error(e?.message || 'Lỗi.'); }
  };

  const edit = (r) => {
    setEditing(r);
    form.setFieldsValue({ title: r.title, progressDate: r.progressDate, externalUrl: r.externalUrl, imagesCsv: (r.images || []).join('\n'), sortOrder: r.sortOrder });
  };

  const remove = async (id) => { try { await saleProApi.deleteProgress(id); load(); } catch (e) { message.error(e?.message); } };

  return (
    <Modal open onCancel={onClose} footer={null} width={760} title={`Tiến độ — ${project.name}`}>
      <Table rowKey="id" size="small" dataSource={list} pagination={false} style={{ marginBottom: 16 }}
        columns={[
          { title: 'Mốc', dataIndex: 'title' },
          { title: 'Ngày', dataIndex: 'progressDate' },
          { title: 'Ảnh', dataIndex: 'images', render: (v) => (v || []).length },
          { title: 'Link', dataIndex: 'externalUrl', render: (v) => v ? <a href={v} target="_blank" rel="noreferrer">mở</a> : '—' },
          { title: '', width: 90, render: (_, r) => <Space><Button size="small" icon={<EditOutlined />} onClick={() => edit(r)} /><Popconfirm title="Xóa?" onConfirm={() => remove(r.id)}><Button size="small" danger icon={<DeleteOutlined />} /></Popconfirm></Space> },
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
    </Modal>
  );
};

// ===== Quản lý Tài liệu (link Drive) của 1 dự án =====
const DocumentsManager = ({ project, onClose }) => {
  const [list, setList] = useState([]);
  const [form] = Form.useForm();
  const [editing, setEditing] = useState(null);

  const load = async () => { try { setList((await saleProApi.getProjectDocuments(project.id)) || []); } catch { /* ignore */ } };
  useEffect(() => { load(); }, [project.id]); // eslint-disable-line

  const submit = async () => {
    try {
      const v = await form.validateFields();
      const body = { projectId: project.id, label: v.label, driveUrl: v.driveUrl, docType: v.docType, sortOrder: v.sortOrder };
      if (editing) await saleProApi.updateDocument(editing.id, body);
      else await saleProApi.createDocument(body);
      message.success('Đã lưu tài liệu.');
      form.resetFields(); setEditing(null); load();
    } catch (e) { if (!e?.errorFields) message.error(e?.message || 'Lỗi.'); }
  };

  const edit = (r) => { setEditing(r); form.setFieldsValue(r); };
  const remove = async (id) => { try { await saleProApi.deleteDocument(id); load(); } catch (e) { message.error(e?.message); } };

  return (
    <Modal open onCancel={onClose} footer={null} width={760} title={`Tài liệu — ${project.name}`}>
      <Table rowKey="id" size="small" dataSource={list} pagination={false} style={{ marginBottom: 16 }}
        columns={[
          { title: 'Nhãn', dataIndex: 'label' },
          { title: 'Loại', dataIndex: 'docType' },
          { title: 'Link Drive', dataIndex: 'driveUrl', render: (v) => v ? <a href={v} target="_blank" rel="noreferrer">mở</a> : '—' },
          { title: '', width: 90, render: (_, r) => <Space><Button size="small" icon={<EditOutlined />} onClick={() => edit(r)} /><Popconfirm title="Xóa?" onConfirm={() => remove(r.id)}><Button size="small" danger icon={<DeleteOutlined />} /></Popconfirm></Space> },
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
    </Modal>
  );
};

export default ProjectsAdmin;
