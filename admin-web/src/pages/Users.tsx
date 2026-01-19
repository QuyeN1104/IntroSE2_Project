// src/pages/Users.tsx
import React, { useEffect, useState } from 'react';
import { FaTrash, FaEye, FaCheckCircle, FaSync } from 'react-icons/fa';
import type { User } from '../types/types';
import { getUsers, deleteUser } from '../services/dataService';
import { useSearch } from '../context/SearchContext';
import UserTrackingModal from '../components/UserTrackingModal';

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showTrackingModal, setShowTrackingModal] = useState(false);

  const { searchTerm } = useSearch();

  const fetchData = async () => {
    setLoading(true);
    const data = await getUsers();
    setUsers(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteUser = async (user: User) => {
    const confirm = window.confirm(
      `⚠️ CẢNH BÁO: Bạn có chắc chắn muốn XÓA VĨNH VIỄN tài khoản @${user.username}?\n\nDữ liệu sẽ bị xóa khỏi hệ thống và không thể khôi phục!`
    );

    if (confirm) {
      try {
        await deleteUser(user.uid);
        // Xóa xong thì loại bỏ user đó khỏi danh sách gốc
        setUsers(prev => prev.filter(u => u.uid !== user.uid));
        alert(`Đã xóa user @${user.username} thành công!`);
      } catch (error) {
        alert("Lỗi khi xóa người dùng! Hãy kiểm tra Console.");
      }
    }
  };

  const filteredUsers = users.filter((u) => {
    // Chỉ hiện user có role là "user" hoặc không có role (mặc định là user)
    // Không hiện admin
    if (u.role === 'admin') return false;

    if (!searchTerm) return true; // Không tìm thì hiện hết (trừ admin)
    const term = searchTerm.toLowerCase().trim();

    // Tìm trong Username, Email, hoặc UID
    return (
      (u.username || "").toLowerCase().includes(term) ||
      (u.email || "").toLowerCase().includes(term) ||
      u.uid.toLowerCase().includes(term)
    );
  });

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>⏳ Đang tải danh sách người dùng...</div>;
  }

  return (
    <div style={{ padding: '24px', background: '#f8f9fa', minHeight: '100vh' }}>

      {/* Header */}
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '800', margin: 0, color: '#333' }}>Quản lý Người dùng</h2>
        <button
          onClick={fetchData}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', border: 'none', background: '#333', color: 'white', borderRadius: '6px', cursor: 'pointer' }}
        >
          <FaSync /> Làm mới
        </button>
      </div>

      {/* Hiển thị kết quả tìm kiếm nếu đang tìm */}
      {searchTerm && (
        <div style={{ marginBottom: '15px', fontStyle: 'italic', color: '#666' }}>
          🔍 Tìm thấy <b>{filteredUsers.length}</b> người dùng phù hợp với: "<b>{searchTerm}</b>"
        </div>
      )}

      {/* Bảng dữ liệu */}
      <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#f8f8f8', borderBottom: '1px solid #eee' }}>
            <tr style={{ textAlign: 'left', color: '#666', fontSize: '14px' }}>
              <th style={{ padding: '16px' }}>User Info</th>
              <th style={{ padding: '16px' }}>Bio</th>
              <th style={{ padding: '16px' }}>Thống kê</th>
              <th style={{ padding: '16px' }}>Vai trò</th>
              <th style={{ padding: '16px' }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              // Thông báo khác nhau tùy vào việc có đang tìm kiếm hay không
              <tr>
                <td colSpan={5} style={{ padding: '30px', textAlign: 'center', color: '#888' }}>
                  {searchTerm ? "Không tìm thấy người dùng nào phù hợp." : "Chưa có người dùng nào trong hệ thống."}
                </td>
              </tr>
            ) : (
              filteredUsers.map(u => (
                <tr key={u.uid} style={{ borderBottom: '1px solid #eee' }}>
                  {/* Cột 1: Info User */}
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img
                        src={u.avatarUrl || `https://ui-avatars.com/api/?name=${u.username}&background=random`}
                        alt="avt"
                        style={{ width: '48px', height: '48px', borderRadius: '50%', border: '1px solid #eee' }}
                      />
                      <div>
                        <div style={{ fontWeight: 'bold', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                          @{u.username}
                          {u.followersCount > 1000000 && <FaCheckCircle color="#20D5EC" size={12} title="Tích xanh" />}
                        </div>
                        <div style={{ fontSize: '13px', color: '#888' }}>{u.email}</div>
                        <div style={{ fontSize: '11px', color: '#aaa' }}>UID: {u.uid.substring(0, 6)}...</div>
                      </div>
                    </div>
                  </td>

                  {/* Cột 2: Bio */}
                  <td style={{ padding: '16px', color: '#555', maxWidth: '250px', fontSize: '14px' }}>
                    {u.bio || "Chưa có tiểu sử"}
                  </td>

                  {/* Cột 3: Stats */}
                  <td style={{ padding: '16px', fontSize: '14px' }}>
                    <div><b>{u.followersCount?.toLocaleString() || 0}</b> followers</div>
                    <div style={{ color: '#888', marginTop: '4px' }}>{u.followingCount?.toLocaleString() || 0} following</div>
                  </td>

                  {/* Cột 4: Role */}
                  <td style={{ padding: '16px' }}>
                    <span style={{
                      background: u.role === 'admin' ? '#e8f0fe' : '#f1f2f6',
                      color: u.role === 'admin' ? '#1967d2' : '#57606f',
                      padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase'
                    }}>
                      {u.role || 'user'}
                    </span>
                  </td>

                  {/* Cột 5: Actions */}
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => {
                          setSelectedUser(u);
                          setShowTrackingModal(true);
                        }}
                        style={{
                          padding: '8px', background: '#f1f1f2', border: 'none', borderRadius: '6px', cursor: 'pointer', color: '#333'
                        }}
                        title="Xem thông tin tracking"
                      >
                        <FaEye />
                      </button>

                      <button
                        onClick={() => handleDeleteUser(u)}
                        style={{
                          padding: '8px',
                          background: 'white',
                          border: '1px solid #fe2c55',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          color: '#fe2c55'
                        }}
                        title="Xóa tài khoản vĩnh viễn"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* User Tracking Modal */}
      {showTrackingModal && selectedUser && (
        <UserTrackingModal
          user={selectedUser}
          onClose={() => {
            setShowTrackingModal(false);
            setSelectedUser(null);
          }}
        />
      )}
    </div>
  );
};

export default Users;