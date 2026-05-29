// Seed data for the KPI BĐS Web Admin

export const DEPARTMENTS = [
  { id: 'dept-kd1', name: 'Phòng Kinh doanh 1', manager: 'Nguyễn Văn A' },
  { id: 'dept-kd2', name: 'Phòng Kinh doanh 2', manager: 'Trần Minh Quân' },
  { id: 'dept-mkt', name: 'Phòng Marketing', manager: 'Lê Thảo Vy' },
  { id: 'dept-pl', name: 'Phòng Pháp lý', manager: 'Phạm Minh Đức' }
];

export const INITIAL_USERS = [
  {
    id: 'user-01',
    name: 'Nguyễn Văn A',
    email: 'vana@bdsantigravity.vn',
    role: 'Manager',
    deptId: 'dept-kd1',
    phone: '0901234567',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    status: 'Active'
  },
  {
    id: 'user-02',
    name: 'Trần Thị B',
    email: 'thib@bdsantigravity.vn',
    role: 'Nhân viên',
    deptId: 'dept-kd1',
    phone: '0912345678',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    status: 'Active'
  },
  {
    id: 'user-03',
    name: 'Phạm Văn C',
    email: 'vanc@bdsantigravity.vn',
    role: 'Nhân viên',
    deptId: 'dept-kd2',
    phone: '0923456789',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    status: 'Active'
  },
  {
    id: 'user-04',
    name: 'Lê Thảo Vy',
    email: 'thaovy@bdsantigravity.vn',
    role: 'Manager',
    deptId: 'dept-mkt',
    phone: '0934567890',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
    status: 'Active'
  },
  {
    id: 'user-05',
    name: 'Đặng Hoàng Nam',
    email: 'hoangnam@bdsantigravity.vn',
    role: 'HR',
    deptId: 'dept-mkt',
    phone: '0945678901',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    status: 'Active'
  }
];

export const INITIAL_KPI_SCORES = [
  // User 02 (Trần Thị B)
  { id: 'kpi-01', userId: 'user-02', month: '2026-04', attendance: 90, meeting: 80, post: 75, deal: 120, total: 365 },
  { id: 'kpi-02', userId: 'user-02', month: '2026-05', attendance: 85, meeting: 90, post: 80, deal: 200, total: 455 },
  
  // User 03 (Phạm Văn C)
  { id: 'kpi-03', userId: 'user-03', month: '2026-04', attendance: 95, meeting: 70, post: 85, deal: 0, total: 250 },
  { id: 'kpi-04', userId: 'user-03', month: '2026-05', attendance: 90, meeting: 75, post: 90, deal: 100, total: 355 },

  // User 01 (Nguyễn Văn A)
  { id: 'kpi-05', userId: 'user-01', month: '2026-05', attendance: 100, meeting: 50, post: 30, deal: 0, total: 180 },
  // User 04 (Lê Thảo Vy)
  { id: 'kpi-06', userId: 'user-04', month: '2026-05', attendance: 98, meeting: 40, post: 100, deal: 0, total: 238 }
];

export const INITIAL_DEALS = [
  {
    id: 'deal-01',
    userId: 'user-02',
    projectName: 'Vinhomes Grand Park - Phân khu Beverly',
    price: 4500000000,
    commission: 135000000,
    customerName: 'Nguyễn Tiến Dũng',
    customerPhone: '0987654321',
    status: 'APPROVED',
    submittedAt: '2026-05-18T10:30:00Z',
    approvedAt: '2026-05-18T14:00:00Z',
    approvedBy: 'Đặng Hoàng Nam',
    kpiTriggered: 100
  },
  {
    id: 'deal-02',
    userId: 'user-03',
    projectName: 'Masterise Centre Point - Căn 2PN',
    price: 5200000000,
    commission: 156000000,
    customerName: 'Phạm Minh Tú',
    customerPhone: '0977112233',
    status: 'APPROVED',
    submittedAt: '2026-05-19T09:15:00Z',
    approvedAt: '2026-05-19T11:30:00Z',
    approvedBy: 'Đặng Hoàng Nam',
    kpiTriggered: 100
  },
  {
    id: 'deal-03',
    userId: 'user-02',
    projectName: 'Aqua City - Nhà phố Shophouse',
    price: 8500000000,
    commission: 255000000,
    customerName: 'Hoàng Kim Chi',
    customerPhone: '0966554433',
    status: 'PENDING',
    submittedAt: '2026-05-21T03:45:00Z',
    kpiTriggered: 150
  }
];

export const INITIAL_ATTENDANCE = [
  {
    id: 'att-01',
    userId: 'user-02',
    checkinTime: '2026-05-21T08:02:15Z',
    photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80',
    gpsLocation: '10.7769, 106.7009 (Văn phòng Quận 1)',
    status: 'PENDING',
    note: 'Chấm công ngoại tuyến khi đi gặp khách hàng sớm tại Q1'
  },
  {
    id: 'att-02',
    userId: 'user-03',
    checkinTime: '2026-05-21T07:55:00Z',
    photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&auto=format&fit=crop&q=80',
    gpsLocation: '10.8494, 106.7725 (Văn phòng Quận 9)',
    status: 'APPROVED',
    approvedAt: '2026-05-21T08:15:00Z',
    approvedBy: 'Đặng Hoàng Nam',
    note: 'Check-in đúng giờ'
  },
  {
    id: 'att-03',
    userId: 'user-01',
    checkinTime: '2026-05-20T08:10:00Z',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    gpsLocation: '10.7757, 106.7004 (Văn phòng Chính)',
    status: 'APPROVED',
    approvedAt: '2026-05-20T08:30:00Z',
    approvedBy: 'Đặng Hoàng Nam',
    note: 'Check-in văn phòng chính'
  }
];

export const INITIAL_POSTS = [
  {
    id: 'post-01',
    userId: 'user-02',
    platform: 'Facebook',
    link: 'https://facebook.com/tranthib/posts/1029384756',
    caption: 'Chính chủ cần chuyển nhượng căn hộ 2 phòng ngủ Vinhomes Grand Park view hồ bơi cực đẹp, chiết khấu lên đến 5% cho khách chốt nhanh trong tuần. Có sổ hồng riêng hỗ trợ vay ngân hàng 70%. Liên hệ ngay!',
    status: 'PENDING',
    submittedAt: '2026-05-21T04:20:00Z'
  },
  {
    id: 'post-02',
    userId: 'user-03',
    platform: 'Zalo',
    link: 'https://zalo.me/g/phamvanc/post123',
    caption: 'Đất nền sổ đỏ thổ cư ngay trung tâm TP Thủ Đức, diện tích 80m2 thích hợp xây dựng tự do. Giá đầu tư cực tốt chỉ từ 3.2 tỷ.',
    status: 'APPROVED',
    approvedAt: '2026-05-20T17:00:00Z',
    approvedBy: 'Đặng Hoàng Nam',
    submittedAt: '2026-05-20T16:00:00Z'
  },
  {
    id: 'post-03',
    userId: 'user-02',
    platform: 'TikTok',
    link: 'https://tiktok.com/@thib_bds/video/123456',
    caption: 'Hôm nay đi ăn trưa cùng gia đình tại một nhà hàng rất ngon ở quận 2. Mọi người nên thử nhé!',
    status: 'PENDING',
    submittedAt: '2026-05-21T06:10:00Z'
  }
];

export const INITIAL_MEETINGS = [
  {
    id: 'meet-01',
    userId: 'user-02',
    clientName: 'Anh Trần Minh Hùng',
    clientPhone: '0908889999',
    dateTime: '2026-05-21T09:00:00Z',
    location: 'Cà phê Highland - Vinhomes Central Park',
    summary: 'Tư vấn dự án Vinhomes Grand Park, khách hàng quan tâm đến chính sách vay ngân hàng và tiến độ bàn giao. Khách đã đồng ý đi xem thực tế dự án vào cuối tuần.',
    status: 'PENDING',
    submittedAt: '2026-05-21T10:15:00Z'
  },
  {
    id: 'meet-02',
    userId: 'user-03',
    clientName: 'Chị Lê Kim Anh',
    clientPhone: '0919992222',
    dateTime: '2026-05-20T14:30:00Z',
    location: 'Văn phòng Masterise Quận 2',
    summary: 'Đã dẫn chị Kim Anh đi xem nhà mẫu dự án Masterise. Chị rất thích căn góc 3PN nhưng còn phân vân về hướng ban công. Sẽ tiếp tục theo sát.',
    status: 'APPROVED',
    approvedAt: '2026-05-20T16:30:00Z',
    approvedBy: 'Nguyễn Văn A',
    submittedAt: '2026-05-20T15:30:00Z'
  }
];

// Danh sách buổi đào tạo
export const INITIAL_TRAINING_SESSIONS = [
  {
    id: 'train-01',
    title: 'Kỹ năng Chốt deal Cao cấp',
    trainer: 'Nguyễn Văn A',
    date: '2026-05-20',
    startTime: '09:00',
    endTime: '11:30',
    location: 'Phòng họp lớn - Tầng 5',
    topic: 'Kỹ năng đàm phán, xử lý phản đối và chốt deal với khách hàng khó tính',
    attendees: ['user-02', 'user-03'],
    maxSlots: 20,
    status: 'COMPLETED'
  },
  {
    id: 'train-02',
    title: 'Marketing BĐS trên Mạng xã hội',
    trainer: 'Lê Thảo Vy',
    date: '2026-05-22',
    startTime: '14:00',
    endTime: '16:00',
    location: 'Phòng đào tạo A - Tầng 3',
    topic: 'Xây dựng nội dung Facebook, TikTok, Zalo để lan tỏa dự án BĐS hiệu quả',
    attendees: ['user-02'],
    maxSlots: 15,
    status: 'UPCOMING'
  },
  {
    id: 'train-03',
    title: 'Pháp lý Bất động sản Cơ bản',
    trainer: 'Phạm Minh Đức',
    date: '2026-05-28',
    startTime: '08:30',
    endTime: '12:00',
    location: 'Phòng họp Phòng Pháp lý',
    topic: 'Sổ hồng, sổ đỏ, quy trình công chứng và các rủi ro pháp lý phổ biến',
    attendees: [],
    maxSlots: 25,
    status: 'UPCOMING'
  }
];

// Feedback từ Nhân sự (góp ý, kiến nghị, phản hồi nội bộ)
export const INITIAL_FEEDBACK = [
  {
    id: 'fb-01',
    senderName: 'Trần Thị B',
    senderRole: 'Nhân viên',
    senderUserId: 'user-02',
    deptId: 'dept-kd1',
    category: 'Công cụ làm việc',
    rating: 3,
    message: 'Phần mềm CRM hiện tại bị lag rất nhiều khi load danh sách khách hàng lớn. Đề xuất nâng cấp hoặc chuyển sang phần mềm mới giúp tăng hiệu quả công việc.',
    status: 'PENDING',
    createdAt: '2026-05-21T02:00:00Z',
    adminReply: null
  },
  {
    id: 'fb-02',
    senderName: 'Phạm Văn C',
    senderRole: 'Nhân viên',
    senderUserId: 'user-03',
    deptId: 'dept-kd2',
    category: 'Chính sách thưởng',
    rating: 4,
    message: 'Đề nghị xem xét tăng tỷ lệ hoa hồng từ 3% lên 3.5% cho các deal từ 5 tỷ đồng trở lên. Điều này sẽ tạo động lực để nhân viên tập trung vào các giao dịch lớn hơn.',
    status: 'RESOLVED',
    createdAt: '2026-05-21T05:30:00Z',
    adminReply: 'Cảm ơn bạn đã đề xuất. Phòng HR sẽ chuyển kiến nghị này đến ban lãnh đạo để xem xét trong kỳ họp quý 2. Sẽ phản hồi kết quả trước ngày 30/5.',
    resolvedAt: '2026-05-21T09:00:00Z',
    resolvedBy: 'Đặng Hoàng Nam'
  },
  {
    id: 'fb-03',
    senderName: 'Lê Thảo Vy',
    senderRole: 'Manager',
    senderUserId: 'user-04',
    deptId: 'dept-mkt',
    category: 'Cơ sở vật chất',
    rating: 2,
    message: 'Máy in tại phòng Marketing bị hỏng đã 2 tuần chưa được sửa, ảnh hưởng đến việc in brochure và tài liệu bán hàng. Đề nghị xử lý sớm.',
    status: 'PENDING',
    createdAt: '2026-05-20T15:00:00Z',
    adminReply: null
  }
];
