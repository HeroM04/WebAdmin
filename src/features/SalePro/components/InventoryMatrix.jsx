import React, { useEffect, useState } from 'react';
import { Select, Spin, message, Tooltip } from 'antd';
import { saleProApi } from '../api/saleProApi';
import UnitDetailModal from './UnitDetailModal';
import { getStatusMeta } from './saleProFormat';

const { Option } = Select;

const InventoryMatrix = ({ projectId, projectName }) => {
  const [buildings, setBuildings] = useState([]);
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [apartments, setApartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedApartment, setSelectedApartment] = useState(null);

  useEffect(() => {
    if (projectId) {
      fetchBuildings();
    }
  }, [projectId]);

  const fetchBuildings = async () => {
    try {
      const data = await saleProApi.getBuildingsByProjectId(projectId);
      setBuildings(data || []);
      if (data && data.length > 0) {
        setSelectedBuilding(data[0].id);
      }
    } catch (e) {
      message.error('Lỗi tải danh sách tòa nhà');
    }
  };

  useEffect(() => {
    if (selectedBuilding) {
      fetchApartments(selectedBuilding);
    }
  }, [selectedBuilding]);

  const fetchApartments = async (buildingId) => {
    setLoading(true);
    try {
      const data = await saleProApi.getApartmentsByBuildingId(buildingId);
      setApartments(data || []);
    } catch (e) {
      message.error('Lỗi tải danh sách căn hộ');
    } finally {
      setLoading(false);
    }
  };

  // Đồng bộ ma trận + modal sau khi Admin cập nhật trạng thái căn
  const handleStatusUpdated = (updated) => {
    setApartments((prev) => prev.map((a) => (a.id === updated.id ? { ...a, ...updated } : a)));
    setSelectedApartment((prev) => (prev && prev.id === updated.id ? { ...prev, ...updated } : prev));
  };

  // Nhóm căn hộ theo tầng và trục
  // Matrix Map: { [floor]: { [axis]: apartment } }
  const matrix = {};
  const allAxes = new Set();

  apartments.forEach(apt => {
    if (!matrix[apt.floor]) matrix[apt.floor] = {};
    matrix[apt.floor][apt.axis] = apt;
    allAxes.add(apt.axis);
  });

  const sortedFloors = Object.keys(matrix).sort((a, b) => b.localeCompare(a)); // Tầng cao xếp trên
  const sortedAxes = Array.from(allAxes).sort();

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Select
          value={selectedBuilding}
          style={{ width: 200 }}
          onChange={setSelectedBuilding}
          placeholder="Chọn tòa nhà"
        >
          {buildings.map(b => (
            <Option key={b.id} value={b.id}>{b.buildingName}</Option>
          ))}
        </Select>
      </div>

      <Spin spinning={loading}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}>
            <thead>
              <tr>
                <th style={{ border: '1px solid #ddd', padding: 8, background: '#fafafa' }}>Tầng \ Trục</th>
                {sortedAxes.map(axis => (
                  <th key={axis} style={{ border: '1px solid #ddd', padding: 8, background: '#fafafa' }}>
                    {axis}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedFloors.map(floor => (
                <tr key={floor}>
                  <td style={{ border: '1px solid #ddd', padding: 8, fontWeight: 'bold' }}>Tầng {floor}</td>
                  {sortedAxes.map(axis => {
                    const apt = matrix[floor][axis];
                    let bgColor = '#fff';
                    if (apt) {
                      if (apt.status === 'CON_HANG') bgColor = '#f6ffed'; // Xanh lá
                      if (apt.status === 'DA_BAN') bgColor = '#fff1f0';   // Đỏ
                      if (apt.status === 'QUY_DOC_QUYEN') bgColor = '#fffbe6'; // Vàng
                    }

                    return (
                      <td key={axis} style={{ border: '1px solid #ddd', padding: 8, background: bgColor }}>
                        {apt ? (
                          <Tooltip title={`${apt.apartmentType} - ${apt.clearanceArea}m² — Nhấn để xem chi tiết`}>
                            <div style={{ cursor: 'pointer' }} onClick={() => setSelectedApartment(apt)}>
                              <div style={{ fontWeight: 'bold' }}>{apt.apartmentCode}</div>
                              <div style={{ fontSize: '12px', color: getStatusMeta(apt.status).color }}>
                                {getStatusMeta(apt.status).label}
                              </div>
                            </div>
                          </Tooltip>
                        ) : (
                          '-'
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Spin>

      {/* Modal chi tiết căn hộ */}
      <UnitDetailModal
        open={!!selectedApartment}
        apartment={selectedApartment}
        projectName={projectName}
        onClose={() => setSelectedApartment(null)}
        onStatusUpdated={handleStatusUpdated}
      />
    </div>
  );
};

export default InventoryMatrix;
