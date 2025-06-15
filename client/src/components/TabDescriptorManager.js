import React, { useEffect, useState } from 'react';
import api from '../services/api';

const TabDescriptorManager = () => {
  const [descriptors, setDescriptors] = useState([]);
  const [newDescriptor, setNewDescriptor] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setIsAdmin(payload.isAdmin);
      } catch {
        setIsAdmin(false);
      }
    }
    fetchDescriptors();
  }, []);

  const fetchDescriptors = async () => {
    setError('');
    try {
      const response = await api.get('/descriptors');
      setDescriptors(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao buscar descritivos');
    }
  };

  const handleAdd = async () => {
    if (!newDescriptor.trim()) {
      setError('Informe o nome do descritivo');
      return;
    }
    setError('');
    setMessage('');
    try {
      await api.post('/descriptors', { nome: newDescriptor.trim() });
      setMessage('Descritivo adicionado com sucesso');
      setNewDescriptor('');
      fetchDescriptors();
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao adicionar descritivo');
    }
  };

  const handleRemove = async (id) => {
    if (!window.confirm('Confirma exclusão do descritivo?')) return;
    setError('');
    setMessage('');
    try {
      await api.delete(`/descriptors/${id}`);
      setMessage('Descritivo removido com sucesso');
      fetchDescriptors();
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao remover descritivo');
    }
  };

  if (!isAdmin) {
    return <p>Você não tem permissão para acessar esta seção.</p>;
  }

  return (
    <div>
      <h2>Gerenciador de Descritivos</h2>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {message && <div style={{ color: 'green' }}>{message}</div>}

      <div style={{ marginBottom: '1rem' }}>
        <input
          type="text"
          placeholder="Novo descritivo"
          value={newDescriptor}
          onChange={e => setNewDescriptor(e.target.value)}
          style={{ marginRight: '0.5rem' }}
        />
        <button onClick={handleAdd}>Adicionar</button>
      </div>

      <ul>
        {descriptors.map(descriptor => (
          <li key={descriptor._id} style={{ marginBottom: '0.5rem' }}>
            {descriptor.nome}{' '}
            <button onClick={() => handleRemove(descriptor._id)}>Excluir</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TabDescriptorManager;
