import React, { useState, useEffect } from 'react';
import api from '../services/api';

const productTypes = [
  'Cabo Displayport',
  'Cabo HDMI',
  'Cabo USB A-A',
  'Cabo USC A-B',
  'Cabo de força',
  'Cabo VGA',
  'Carregador + cabo usb C',
  'Filtro de linha',
  'HD',
  'Memoria Ram',
  'SSD',
  'Smartphone',
  'Suporte de notebook',
  'Teclado e Mouse'
].sort();

const TabProductRegistration = () => {
  const [formData, setFormData] = useState({
    tipo: '',
    marca: '',
    modelo: '',
    descricao: '',
    codigoBarras: ''
  });
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
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!formData.tipo || !formData.marca || !formData.modelo || !formData.descricao || !formData.codigoBarras) {
      setError('Todos os campos são obrigatórios');
      return;
    }
    try {
      await api.post('/products', formData);
      setMessage('Produto cadastrado com sucesso');
      setFormData({
        tipo: '',
        marca: '',
        modelo: '',
        descricao: '',
        codigoBarras: ''
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao cadastrar produto');
    }
  };

  if (!isAdmin) {
    return <p>Você não tem permissão para acessar esta seção.</p>;
  }

  return (
    <div>
      <h2>Cadastrar Produto</h2>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {message && <div style={{ color: 'green' }}>{message}</div>}
      <form onSubmit={handleSubmit} style={{ maxWidth: '400px' }}>
        <div style={{ marginBottom: '0.5rem' }}>
          <label>Tipo:</label>
          <select name="tipo" value={formData.tipo} onChange={handleChange} required style={{ width: '100%' }}>
            <option value="">-- Selecione --</option>
            {productTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
        <div style={{ marginBottom: '0.5rem' }}>
          <label>Marca:</label>
          <input type="text" name="marca" value={formData.marca} onChange={handleChange} required style={{ width: '100%' }} />
        </div>
        <div style={{ marginBottom: '0.5rem' }}>
          <label>Modelo:</label>
          <input type="text" name="modelo" value={formData.modelo} onChange={handleChange} required style={{ width: '100%' }} />
        </div>
        <div style={{ marginBottom: '0.5rem' }}>
          <label>Descrição:</label>
          <input type="text" name="descricao" value={formData.descricao} onChange={handleChange} required style={{ width: '100%' }} />
        </div>
        <div style={{ marginBottom: '0.5rem' }}>
          <label>Código de Barras:</label>
          <input type="text" name="codigoBarras" value={formData.codigoBarras} onChange={handleChange} required style={{ width: '100%' }} />
        </div>
        <button type="submit">Cadastrar</button>
      </form>
    </div>
  );
};

export default TabProductRegistration;
