/**
 * Cho phép bấm vào một dòng của bảng để mở chi tiết, thay cho nút "Chi tiết"
 * riêng ở cột Hành động. Dùng chung cho mọi trang danh sách để thao tác ở đâu
 * cũng giống nhau.
 *
 *   <Table onRow={rowClick(openDetail)} ... />
 *
 * Cột chứa các nút thao tác (Sửa, Duyệt, Xóa...) phải khai báo thêm
 * {@code className: 'no-row-click'} để bấm vào nút không mở luôn ô chi tiết.
 */
export const rowClick = (onOpen) => (record) => ({
  className: 'clickable-row',
  tabIndex: 0,
  onClick: (event) => {
    // Bỏ qua khi bấm trúng ô thao tác, liên kết, ô nhập hay ô tick chọn
    if (event.target.closest('.no-row-click, a, input, button, .ant-checkbox-wrapper')) return;
    onOpen(record);
  },
  onKeyDown: (event) => {
    if (event.key === 'Enter' && event.target === event.currentTarget) onOpen(record);
  },
});
