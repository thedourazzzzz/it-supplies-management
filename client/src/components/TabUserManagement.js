import React, { useEffect, useState } from 'react';
import api from '../services/api';

const TabUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formMode, setFormMode] = useState(null); // 'add' or 'edit'
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    isAdmin: false,
    forcePasswordChange: true
  });
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [passwordResetUser, setPasswordResetUser] = useState(null);
  const [passwordResetValue, setPasswordResetValue] = useState('');
  const [message, setMessage] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao buscar usuários');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openAddForm = () => {
    setFormMode('add');
    setFormData({
      username: '',
      password: '',
      isAdmin: false,
      forcePasswordChange: true
    });
    setSelectedUser(null);
    setMessage('');
  };

  const openEditForm = (user) => {
    setFormMode('edit');
    setFormData({
      username: user.username,
      password: '',
      isAdmin: user.isAdmin,
      forcePasswordChange: user.forcePasswordChange
    });
    setSelectedUser(user);
    setMessage('');
  };

  const closeForm = () => {
    setFormMode(null);
    setSelectedUser(null);
    setMessage('');
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      if (formMode === 'add') {
        await api.post('/users', formData);
        setMessage('Usuário criado com sucesso');
      } else if (formMode === 'edit' && selectedUser) {
        await api.put(`/users/${selectedUser._id}`, {
          username: formData.username,
          isAdmin: formData.isAdmin
        });
        setMessage('Usuário atualizado com sucesso');
      }
      fetchUsers();
      closeForm();
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao salvar usuário');
    }
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`Confirma exclusão do usuário ${user.username}?`)) return;
    setError('');
    setMessage('');
    try {
      await api.delete(`/users/${user._id}`);
      setMessage('Usuário excluído com sucesso');
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao excluir usuário');
    }
  };

  const openPasswordReset = (user) => {
    setPasswordResetUser(user);
    setPasswordResetValue('');
    setShowPasswordReset(true);
    setMessage('');
  };

  const closePasswordReset = () => {
    setShowPasswordReset(false);
    setPasswordResetUser(null);
    setPasswordResetValue('');
  };

  const handlePasswordReset = async () => {
    if (!passwordResetValue) {
      setError('Informe a nova senha');
      return;
    }
    setError('');
    setMessage('');
    try {
      await api.post(`/users/${passwordResetUser._id}/reset-password`, {
        newPassword: passwordResetValue
      });
      setMessage('Senha redefinida com sucesso');
      closePasswordReset();
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao redefinir senha');
    }
  };

  const toggleAdmin = async (user) => {
    setError('');
    setMessage('');
    try {
      await api.patch(`/users/${user._id}/toggle-admin`);
      setMessage(`Status de administrador alterado para ${!user.isAdmin ? 'ativo' : 'inativo'}`);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao alterar status de administrador');
    }
  };

  return (
    <div>
      <h2>Gerenciamento de Usuários</h2>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {message && <div style={{ color: 'green' }}>{message}</div>}
      <button onClick={openAddForm} style={{ marginBottom: '1rem' }}>Adicionar Usuário</button>
      {loading ? (
        <p>Carregando usuários...</p>
      ) : (
        <table border="1" cellPadding="8" cellSpacing="0" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>Usuário</th>
              <th>Administrador</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user._id}>
                <td>{user.username}</td>
                <td>{user.isAdmin ? 'Sim' : 'Não'}</td>
                <td>
                  <button onClick={() => openEditForm(user)}>Editar</button>{' '}
                  <button onClick={() => handleDelete(user)}>Excluir</button>{' '}
                  <button onClick={() => openPasswordReset(user)}>Resetar Senha</button>{' '}
                  <button onClick={() => toggleAdmin(user)}>
                    {user.isAdmin ? 'Remover Admin' : 'Tornar Admin'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {formMode && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
          justifyContent: 'center', alignItems: 'center'
        }}>
          <form onSubmit={handleSubmit} style={{
            backgroundColor: 'white', padding: '1rem', borderRadius: '8px',
            width: '300px'
          }}>
            <h3>{formMode === 'add' ? 'Adicionar Usuário' : 'Editar Usuário'}</h3>
            <div style={{ marginBottom: '0.5rem' }}>
              <label>Usuário</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={e => setFormData({ ...formData, username: e.target.value })}
                required
                disabled={formMode === 'edit'}
                style={{ width: '100%' }}
              />
            </div>
            {formMode === 'add' && (
              <div style={{ marginBottom: '0.5rem' }}>
                <label>Senha</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  required
                  style={{ width: '100%' }}
                />
              </div>
            )}
            <div style={{ marginBottom: '0.5rem' }}>
              <label>
                <input
                  type="checkbox"
                  name="isAdmin"
                  checked={formData.isAdmin}
                  onChange={e => setFormData({ ...formData, isAdmin: e.target.checked })}
                />
                {' '}Administrador
              </label>
            </div>
            <button type="submit">{formMode === 'add' ? 'Criar' : 'Salvar'}</button>{' '}
            <button type="button" onClick={closeForm}>Cancelar</button>
          </form>
        </div>
      )}

      {showPasswordReset && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
          justifyContent: 'center', alignItems: 'center'
        }}>
          <div style={{
            backgroundColor: 'white', padding: '1rem', borderRadius: '8px',
            width: '300px'
          }}>
            <h3>Resetar Senha para {passwordResetUser?.username}</h3>
            <input
              type="password"
              value={passwordResetValue}
              onChange={e => setPasswordResetValue(e.target.value)}
              placeholder="Nova senha"
              style={{ width: '100%', marginBottom: '0.5rem' }}
            />
            <button onClick={handlePasswordReset}>Confirmar</button>{' '}
            <button onClick={closePasswordReset}>Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TabUserManagement;
