import React, { createContext, useState, useEffect } from 'react';
import { apiClient } from '../utils/apiClient';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { notification } from 'antd';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [departments, setDepartments] = useState(() => {
    const saved = localStorage.getItem('kpi_departments');
    return saved ? JSON.parse(saved) : [];
  });

  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem('kpi_users');
    return saved ? JSON.parse(saved) : [];
  });

  const [kpiScores, setKpiScores] = useState(() => {
    const saved = localStorage.getItem('kpi_scores');
    return saved ? JSON.parse(saved) : [];
  });

  const [deals, setDeals] = useState(() => {
    const saved = localStorage.getItem('kpi_deals');
    return saved ? JSON.parse(saved) : [];
  });

  const [attendance, setAttendance] = useState(() => {
    const saved = localStorage.getItem('kpi_attendance');
    return saved ? JSON.parse(saved) : [];
  });

  const [posts, setPosts] = useState(() => {
    const saved = localStorage.getItem('kpi_posts');
    return saved ? JSON.parse(saved) : [];
  });

  const [meetings, setMeetings] = useState(() => {
    const saved = localStorage.getItem('kpi_meetings');
    return saved ? JSON.parse(saved) : [];
  });

  const [feedbacks, setFeedbacks] = useState(() => {
    const saved = localStorage.getItem('kpi_feedback_v2');
    return saved ? JSON.parse(saved) : [];
  });

  const [trainingSessions, setTrainingSessions] = useState(() => {
    const saved = localStorage.getItem('kpi_training_sessions');
    return saved ? JSON.parse(saved) : [];
  });

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('kpi_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('kpi_is_auth') === 'true';
  });

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('kpi_theme') || 'dark';
  });

  // Sync state to localStorage on changes
  useEffect(() => {
    localStorage.setItem('kpi_departments', JSON.stringify(departments));
  }, [departments]);

  useEffect(() => {
    localStorage.setItem('kpi_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('kpi_scores', JSON.stringify(kpiScores));
  }, [kpiScores]);

  useEffect(() => {
    localStorage.setItem('kpi_deals', JSON.stringify(deals));
  }, [deals]);

  useEffect(() => {
    localStorage.setItem('kpi_attendance', JSON.stringify(attendance));
  }, [attendance]);

  useEffect(() => {
    localStorage.setItem('kpi_posts', JSON.stringify(posts));
  }, [posts]);

  useEffect(() => {
    localStorage.setItem('kpi_meetings', JSON.stringify(meetings));
  }, [meetings]);

  useEffect(() => {
    localStorage.setItem('kpi_feedback_v2', JSON.stringify(feedbacks));
  }, [feedbacks]);

  useEffect(() => {
    localStorage.setItem('kpi_training_sessions', JSON.stringify(trainingSessions));
  }, [trainingSessions]);

  useEffect(() => {
    localStorage.setItem('kpi_current_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('kpi_is_auth', isAuthenticated);
    let client = null;
    
    if (isAuthenticated && localStorage.getItem('kpi_access_token')) {
      fetchInitialData();
      
      const token = localStorage.getItem('kpi_access_token');
      
      // Lấy URL từ biến môi trường, fallback về link Render Production (dùng HTTPS cho SockJS)
      let wsUrl = import.meta.env.VITE_WS_URL || 'https://kpi-backend-4xex.onrender.com/ws';

      // Tự động nâng cấp ws:// thành wss:// và http:// thành https:// nếu frontend chạy trên HTTPS
      if (window.location.protocol === 'https:') {
        wsUrl = wsUrl.replace('ws://', 'wss://').replace('http://', 'https://');
      }

      client = new Client({
        webSocketFactory: () => new SockJS(wsUrl),
        connectHeaders: { Authorization: `Bearer ${token}` },
        reconnectDelay: 5000,
        onConnect: (frame) => {
          console.log('✅ [STOMP] Connected to WebSocket successfully:', frame);
          client.subscribe('/topic/admin/requests', (msg) => {
            if (msg.body) {
              try {
                const data = JSON.parse(msg.body);
                if (data.message) {
                  notification.info({
                    message: 'Có cập nhật mới',
                    description: data.message,
                    placement: 'bottomRight',
                    duration: 5
                  });
                }
              } catch (e) {
                // If it's a string like "NEW_REQUEST"
                notification.info({
                  message: 'Có cập nhật mới',
                  description: 'Hệ thống vừa nhận được dữ liệu mới!',
                  placement: 'bottomRight',
                  duration: 5
                });
              }
            }
            // Tự động kéo lại data mới nhất từ Backend sau 500ms (đảm bảo DB transaction đã commit xong)
            setTimeout(() => {
              fetchInitialData();
            }, 500);
          });

          // Lắng nghe riêng kênh Thực chiến để cập nhật State trực tiếp mượt mà theo yêu cầu
          client.subscribe('/topic/thuc-chien/admin', (msg) => {
            if (msg.body) {
              try {
                const newData = JSON.parse(msg.body);
                console.log('Nhận được dữ liệu thực chiến mới:', newData);
                // Functional state update: Đẩy data mới lên đầu bảng mà không cần fetch lại
                setMeetings(prevData => {
                  const exists = prevData.some(item => item.id === newData.id);
                  return exists ? prevData : [newData, ...prevData];
                });
                notification.success({
                  message: '🔔 Thực chiến mới',
                  description: 'Hệ thống vừa cập nhật trực tiếp dữ liệu vào bảng!',
                  placement: 'bottomRight',
                  duration: 3
                });
              } catch (e) {
                console.error('Lỗi khi parse dữ liệu thực chiến:', e);
              }
            }
          });
        },
        onStompError: (frame) => {
          console.error('❌ [STOMP] Broker reported error:', frame.headers['message']);
          console.error('❌ [STOMP] Additional details:', frame.body);
        },
        onWebSocketError: (event) => {
          console.error('❌ [STOMP] WebSocket connection error:', event);
        },
        onDisconnect: () => {
          console.log('⚠️ [STOMP] Disconnected from WebSocket');
        }
      });
      client.activate();
    }
    
    return () => {
      if (client) {
        client.deactivate();
      }
    };
  }, [isAuthenticated]);

  const fetchInitialData = async () => {
    try {
      const [
        departmentsData,
        usersData,
        dealsData,
        attendanceData,
        postsData,
        meetingsData,
        feedbacksData,
        trainingData,
        kpiScoresData
      ] = await Promise.all([
        apiClient.get('/departments').catch(() => []),
        apiClient.get('/users').catch(() => []),
        apiClient.get('/deals').catch(() => []),
        apiClient.get('/attendance').catch(() => []),
        apiClient.get('/social-posts').catch(() => []),
        apiClient.get('/field-battle').catch(() => []),
        apiClient.get('/feedbacks').catch(() => []),
        apiClient.get('/training-sessions').catch(() => []),
        apiClient.get('/kpi-scores').catch(() => [])
      ]);

      const sortByDateDesc = (arr) => {
        if (!Array.isArray(arr)) return arr;
        return [...arr].sort((a, b) => {
          const dateA = new Date(a.checkinTime || a.createdAt || a.time || a.date || 0).getTime();
          const dateB = new Date(b.checkinTime || b.createdAt || b.time || b.date || 0).getTime();
          return dateB - dateA;
        });
      };
      
      if (usersData?.length > 0) {
        setUsers(usersData.map(u => ({
          ...u,
          name: u.fullName,
          phone: u.phoneNumber,
          avatar: u.avatarUrl,
          deptId: u.department?.id || null
        })));
      }
      if (departmentsData !== undefined) {
        setDepartments(departmentsData.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })));
      }
      if (dealsData !== undefined) setDeals(sortByDateDesc(dealsData));
      if (attendanceData !== undefined) setAttendance(sortByDateDesc(attendanceData));
      if (postsData !== undefined) setPosts(sortByDateDesc(postsData));
      if (meetingsData !== undefined) setMeetings(sortByDateDesc(meetingsData));
      if (feedbacksData !== undefined) setFeedbacks(sortByDateDesc(feedbacksData));
      if (trainingData !== undefined) setTrainingSessions(sortByDateDesc(trainingData));
      if (kpiScoresData !== undefined) setKpiScores(kpiScoresData);
    } catch (err) {
      console.error('Error fetching initial data:', err);
    }
  };

  useEffect(() => {
    localStorage.setItem('kpi_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Helper to trigger KPI calculation updates
  const updateKpiPoints = (userId, type, points, month = '2026-05') => {
    setKpiScores(prevScores => {
      const existingRecordIndex = prevScores.findIndex(
        score => score.userId === userId && score.month === month
      );

      if (existingRecordIndex > -1) {
        const updatedScores = [...prevScores];
        const record = { ...updatedScores[existingRecordIndex] };
        
        // Add points to the specific category
        const newCategoryValue = (record[type] || 0) + points;
        record[type] = newCategoryValue;
        
        // Recalculate total
        record.total = 
          (record.attendance || 0) + 
          (record.meeting || 0) + 
          (record.post || 0) + 
          (record.deal || 0);
          
        updatedScores[existingRecordIndex] = record;
        return updatedScores;
      } else {
        // Create new record for the user and month
        const newRecord = {
          id: `kpi-${Date.now()}`,
          userId,
          month,
          attendance: 0,
          meeting: 0,
          post: 0,
          deal: 0,
          total: 0
        };
        newRecord[type] = points;
        newRecord.total = points;
        return [...prevScores, newRecord];
      }
    });
  };

  // --- Authentication ---
  const login = async (username, password) => {
    try {
      // Backend LoginRequestDTO expects phoneNumber
      const res = await apiClient.post('/auth/login', { phoneNumber: username, password });
      
      localStorage.setItem('kpi_access_token', res.accessToken);
      localStorage.setItem('kpi_is_auth', 'true');
      
      const userRes = await apiClient.get('/auth/me'); // Giả định backend có API lấy profile hiện tại
      const userProfile = userRes || { id: username, name: username, role: username === 'admin' ? 'ADMIN' : 'VAN_PHONG', avatar: '' };
      
      // Chỉ cho phép ADMIN và VAN_PHONG truy cập WebAdmin
      if (userProfile.role !== 'ADMIN' && userProfile.role !== 'VAN_PHONG') {
        localStorage.removeItem('kpi_access_token');
        localStorage.removeItem('kpi_is_auth');
        throw new Error('Bạn không có quyền truy cập vào trang Quản trị này!');
      }

      setCurrentUser(userProfile);
      setIsAuthenticated(true);
      return true;
    } catch (err) {
      // Fallback mock nếu API lỗi connection
      if (username === 'admin' && password === 'admin123') {
        setCurrentUser({ id: 'admin', name: 'Quản trị viên (Offline)', role: 'Admin', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80' });
        setIsAuthenticated(true);
        localStorage.setItem('kpi_is_auth', 'true');
        return true;
      } else if (username === 'hr' && password === '123456') {
        setCurrentUser({ id: 'hr', name: 'Nhân sự (Offline)', role: 'HR', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80' });
        setIsAuthenticated(true);
        localStorage.setItem('kpi_is_auth', 'true');
        return true;
      }
      throw err;
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    localStorage.removeItem('kpi_is_auth');
    localStorage.removeItem('kpi_access_token');
    localStorage.removeItem('kpi_current_user');
  };

  // --- KPI Management ---
  const flagKpiRecord = (userId, month) => {
    setKpiScores(prev => {
      const idx = prev.findIndex(s => s.userId === userId && s.month === month);
      if (idx > -1) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], isFlagged: !updated[idx].isFlagged };
        return updated;
      }
      return prev;
    });
  };

  // --- CRUD Departments ---
  const addDepartment = async (deptData) => {
    try { 
      await apiClient.post('/departments', deptData); 
      await fetchInitialData(); 
    } catch (e) { throw e; }
  };

  const updateDepartment = async (updatedDept) => {
    try { 
      await apiClient.put(`/departments/${updatedDept.id}`, updatedDept); 
      await fetchInitialData(); 
    } catch (e) { throw e; }
  };

  const deleteDepartment = async (deptId) => {
    try { 
      await apiClient.delete(`/departments/${deptId}`); 
      await fetchInitialData(); 
    } catch (e) { throw e; }
  };

  const assignUserToDepartment = async (userId, deptId) => {
    try { 
      await apiClient.put(`/users/${userId}`, { departmentId: deptId }); 
      await fetchInitialData(); 
    } catch (e) { 
      console.error('assignUserToDepartment error:', e); throw e; 
    }
  };

  const removeUserFromDepartment = async (userId) => {
    try { 
      await apiClient.put(`/users/${userId}`, { departmentId: null }); 
      await fetchInitialData(); 
    } catch (e) { 
      console.error('removeUserFromDepartment error:', e); throw e; 
    }
  };

  // --- CRUD Users ---
  const addUser = async (userData) => {
    try {
      const dto = {
        fullName: userData.name,
        phoneNumber: userData.phone,
        password: userData.password || '123456',
        role: userData.role,
        departmentId: userData.deptId,
        avatarUrl: userData.avatarUrl,
        basicSalary: userData.basicSalary || 10000000
      };
      await apiClient.post('/users', dto); 
      await fetchInitialData(); 
    } catch (e) { throw e; }
  };

  const updateUser = async (updatedUser) => {
    try { 
      const dto = {
        fullName: updatedUser.name,
        role: updatedUser.role,
        status: updatedUser.status,
        departmentId: updatedUser.deptId,
        basicSalary: updatedUser.basicSalary,
        avatarUrl: updatedUser.avatarUrl,
        password: updatedUser.password
      };
      await apiClient.put(`/users/${updatedUser.id}`, dto); 
      await fetchInitialData(); 
    } catch (e) { throw e; }
  };

  const deleteUser = async (userId) => {
    try { 
      await apiClient.delete(`/users/${userId}`); 
      await fetchInitialData(); 
    } catch (e) { throw e; }
  };

  // --- Approvals Workflows ---
  const approveDeal = async (dealId, approvedBy) => {
    try { await apiClient.put(`/deals/${dealId}/approve`, {}); await fetchInitialData(); } catch (e) { throw e; }
  };

  const rejectDeal = async (dealId, approvedBy) => {
    try { await apiClient.put(`/deals/${dealId}/reject`, {}); await fetchInitialData(); } catch (e) { throw e; }
  };

  const deleteDeal = async (dealId) => {
    try { await apiClient.delete(`/deals/${dealId}`); await fetchInitialData(); } catch (e) { throw e; }
  };

  const updateDeal = async (updatedDeal) => {
    try { await apiClient.put(`/deals/${updatedDeal.id}`, updatedDeal); await fetchInitialData(); } catch (e) { throw e; }
  };

  const addDeal = async (dealData) => {
    try { await apiClient.post('/deals', dealData); await fetchInitialData(); } catch (e) { throw e; }
  };


  // 2. Chấm Công (Attendance)
  const approveAttendance = async (attId, approvedBy) => {
    try { await apiClient.put(`/attendance/${attId}/status?status=APPROVED`); await fetchInitialData(); } catch (e) { throw e; }
  };

  const rejectAttendance = async (attId, approvedBy) => {
    try { await apiClient.put(`/attendance/${attId}/status?status=REJECTED`); await fetchInitialData(); } catch (e) { throw e; }
  };

  const deleteAttendance = async (attId) => {
    try { await apiClient.delete(`/attendance/${attId}`); await fetchInitialData(); } catch (e) { throw e; }
  };

  const updateAttendance = async (updatedAtt) => {
    try { await apiClient.put(`/attendance/${updatedAtt.id}/status?status=${updatedAtt.status}`); await fetchInitialData(); } catch (e) { throw e; }
  };


  // 3. Bài Post (Social Posts)
  const approvePost = async (postId, approvedBy) => {
    try { await apiClient.put(`/social-posts/${postId}/approve`, {}); await fetchInitialData(); } catch (e) { throw e; }
  };

  const rejectPost = async (postId, approvedBy) => {
    try { await apiClient.put(`/social-posts/${postId}/reject`, {}); await fetchInitialData(); } catch (e) { throw e; }
  };

  const deletePost = async (postId) => {
    try { await apiClient.delete(`/social-posts/${postId}`); await fetchInitialData(); } catch (e) { throw e; }
  };

  const updatePost = async (updatedPost) => {
    try { await apiClient.put(`/social-posts/${updatedPost.id}`, updatedPost); await fetchInitialData(); } catch (e) { throw e; }
  };


  // 4. Thực Chiến (Meetings)
  const approveMeeting = async (meetId, approvedBy) => {
    try { await apiClient.put(`/field-battle/${meetId}/approve`, {}); await fetchInitialData(); } catch (e) { throw e; }
  };

  const rejectMeeting = async (meetId, approvedBy) => {
    try { await apiClient.put(`/field-battle/${meetId}/reject`, {}); await fetchInitialData(); } catch (e) { throw e; }
  };

  const deleteMeeting = async (meetId) => {
    try { await apiClient.delete(`/field-battle/${meetId}`); await fetchInitialData(); } catch (e) { throw e; }
  };

  const updateMeeting = async (updatedMeeting) => {
    try { await apiClient.put(`/field-battle/${updatedMeeting.id}`, updatedMeeting); await fetchInitialData(); } catch (e) { throw e; }
  };


  // --- Training Sessions CRUD ---
  const addTrainingSession = async (sessionData) => {
    try { await apiClient.post('/training-sessions', sessionData); await fetchInitialData(); } catch (e) { throw e; }
  };

  const updateTrainingSession = async (sessionId, updates) => {
    try { await apiClient.put(`/training-sessions/${sessionId}`, updates); await fetchInitialData(); } catch (e) { throw e; }
  };

  const deleteTrainingSession = async (sessionId) => {
    try { await apiClient.delete(`/training-sessions/${sessionId}`); await fetchInitialData(); } catch (e) { throw e; }
  };

  const addAttendeeToSession = async (sessionId, userId) => {
    try { await apiClient.post('/training-sessions/attend', { sessionId, userId }); await fetchInitialData(); } catch (e) { throw e; }
  };

  const removeAttendeeFromSession = async (sessionId, userId) => {
    try { await apiClient.delete(`/training-sessions/${sessionId}/attendees/${userId}`); await fetchInitialData(); } catch (e) { throw e; }
  };

  // --- Feedback (Employee Feedback) ---
  const addFeedback = async (feedbackData) => {
    try { await apiClient.post('/feedbacks', feedbackData); await fetchInitialData(); } catch (e) { throw e; }
  };

  const replyToFeedback = async (fbId, replyText, resolvedBy) => {
    try { await apiClient.put(`/feedbacks/${fbId}/reply`, { replyText }); await fetchInitialData(); } catch (e) { throw e; }
  };

  const deleteFeedback = async (fbId) => {
    try { await apiClient.delete(`/feedbacks/${fbId}`); await fetchInitialData(); } catch (e) { throw e; }
  };

  const resetAllData = () => {
    localStorage.removeItem('kpi_departments');
    localStorage.removeItem('kpi_users');
    localStorage.removeItem('kpi_scores');
    localStorage.removeItem('kpi_deals');
    localStorage.removeItem('kpi_attendance');
    localStorage.removeItem('kpi_posts');
    localStorage.removeItem('kpi_meetings');
    localStorage.removeItem('kpi_feedback');
    localStorage.removeItem('kpi_feedback_v2');
    localStorage.removeItem('kpi_training_sessions');
    
    setDepartments(DEPARTMENTS);
    setUsers(INITIAL_USERS);
    setKpiScores(INITIAL_KPI_SCORES);
    setDeals(INITIAL_DEALS);
    setAttendance(INITIAL_ATTENDANCE);
    setPosts(INITIAL_POSTS);
    setMeetings(INITIAL_MEETINGS);
    setFeedbacks(INITIAL_FEEDBACK);
    setTrainingSessions(INITIAL_TRAINING_SESSIONS);
  };

  return (
    <AppContext.Provider
      value={{
        departments,
        users,
        kpiScores,
        deals,
        attendance,
        posts,
        meetings,
        feedbacks,
        trainingSessions,
        currentUser,
        setCurrentUser,
        isAuthenticated,
        login,
        logout,
        theme,
        setTheme,
        addDepartment,
        updateDepartment,
        deleteDepartment,
        assignUserToDepartment,
        removeUserFromDepartment,
        addUser,
        updateUser,
        deleteUser,
        approveDeal,
        rejectDeal,
        deleteDeal,
        updateDeal,
        approveAttendance,
        rejectAttendance,
        deleteAttendance,
        updateAttendance,
        approvePost,
        rejectPost,
        deletePost,
        updatePost,
        approveMeeting,
        rejectMeeting,
        deleteMeeting,
        updateMeeting,
        addTrainingSession,
        updateTrainingSession,
        deleteTrainingSession,
        addAttendeeToSession,
        removeAttendeeFromSession,
        addFeedback,
        replyToFeedback,
        deleteFeedback,
        resetAllData,
        updateKpiPoints,
        flagKpiRecord,
        // Add new records
        addAttendance: async (record) => { try { await apiClient.post('/attendance/checkin', record); fetchInitialData(); } catch (e) { console.error(e); } },
        addMeeting: async (record) => { try { await apiClient.post('/field-battle/submit', record); fetchInitialData(); } catch (e) { console.error(e); } },
        addPost: async (record) => { try { await apiClient.post('/social-posts/submit', record); fetchInitialData(); } catch (e) { console.error(e); } },
        addDeal: async (record) => { try { await apiClient.post('/deals/submit', record); fetchInitialData(); } catch (e) { console.error(e); } },
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
