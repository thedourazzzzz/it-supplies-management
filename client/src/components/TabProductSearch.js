import React, { useEffect, useState } from 'react';
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

const TabProductSearch = () => {
  const [filters, setFilters] = useState({
    marca: '',
    tipo: '',
    modelo: '',
    descricao: '',
    codigoBarras: ''
  });
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantityChange, setQuantityChange] = useState(1);
  const [changeType, setChangeType] = useState(null); // 'add' or 'remove'
  const [modalInfo, setModalInfo] = useState({ purchaseOrder: '', asset: '' });
  const [showModal, setShowModal] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params[key] = value;
      });
      const response = await api.get('/products', { params });
      setProducts(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao buscar produtos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const openModal = (product, type) => {
    setSelectedProduct(product);
    setChangeType(type);
    setQuantityChange(1);
    setModalInfo({ purchaseOrder: '', asset: '' });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedProduct(null);
    setChangeType(null);
  };

  const handleModalChange = (e) => {
    const { name, value } = e.target;
    setModalInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleQuantityChange = (e) => {
    let val = parseInt(e.target.value, 10);
    if (isNaN(val) || val < 1) val = 1;
    if (val > 50) val = 50;
    setQuantityChange(val);
  };

  const submitQuantityChange = async () => {
    if (changeType === 'add' && !modalInfo.purchaseOrder) {
      alert('Informe o número da solicitação de compra');
      return;
    }
    if (changeType === 'remove' && !modalInfo.asset) {
      alert('Informe o ativo para instalação');
      return;
    }
    try {
      await api.patch(`/products/${selectedProduct._id}/update-quantity`, {
        change: changeType === 'add' ? quantityChange : -quantityChange,
        requestInfo: {
          purchaseOrder: modalInfo.purchaseOrder,
          asset: modalInfo.asset
        }
      });
      alert('Quantidade atualizada com sucesso');
      fetchProducts();
      closeModal();
    } catch (err) {
      alert(err.response?.data?.error || 'Erro ao atualizar quantidade');
    }
  };

  return (
    <div>
      <h2>Buscar Produto</h2>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <div style={{ marginBottom: '1rem' }}>
        <label>
          Marca:
          <input
            type="text"
            name="marca"
            value={filters.marca}
            onChange={handleFilterChange}
            style={{ marginLeft: '0.5rem' }}
          />
        </label>{' '}
        <label>
          Tipo:
          <select name="tipo" value={filters.tipo} onChange={handleFilterChange} style={{ marginLeft: '0.5rem' }}>
            <option value="">-- Selecione --</option>
            {productTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </label>{' '}
        <label>
          Modelo:
          <input
            type="text"
            name="modelo"
            value={filters.modelo}
            onChange={handleFilterChange}
            style={{ marginLeft: '0.5rem' }}
          />
        </label>{' '}
        <label>
          Descrição:
          <input
            type="text"
            name="descricao"
            value={filters.descricao}
            onChange={handleFilterChange}
            style={{ marginLeft: '0.5rem' }}
          />
        </label>{' '}
        <label>
          Código de Barras:
          <input
            type="text"
            name="codigoBarras"
            value={filters.codigoBarras}
            onChange={handleFilterChange}
            style={{ marginLeft: '0.5rem' }}
          />
        </label>{' '}
        <button onClick={fetchProducts}>Buscar</button>
      </div>
      {loading ? (
        <p>Carregando produtos...</p>
      ) : (
        <table border="1" cellPadding="8" cellSpacing="0" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>Tipo</th>
              <th>Marca</th>
              <th>Modelo</th>
              <th>Descrição</th>
              <th>Código de Barras</th>
              <th>Quantidade</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product._id}>
                <td>{product.tipo}</td>
                <td>{product.marca}</td>
                <td>{product.modelo}</td>
                <td>{product.descricao}</td>
                <td>{product.codigoBarras}</td>
                <td>{product.quantidade}</td>
                <td>
                  <button onClick={() => openModal(product, 'add')}>Adicionar</button>{' '}
                  <button onClick={() => openModal(product, 'remove')}>Diminuir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
          justifyContent: 'center', alignItems: 'center'
        }}>
          <div style={{
            backgroundColor: 'white', padding: '1rem', borderRadius: '8px',
            width: '320px'
          }}>
            <h3>{changeType === 'add' ? 'Adicionar Quantidade' : 'Diminuir Quantidade'}</h3>
            <p>Produto: {selectedProduct.marca} {selectedProduct.modelo}</p>
            <label>
              Quantidade (1-50):
              <input
                type="number"
                min="1"
                max="50"
                value={quantityChange}
                onChange={e => setQuantityChange(parseInt(e.target.value, 10) || 1)}
                style={{ width: '100%', marginBottom: '0.5rem' }}
              />
            </label>
            {changeType === 'add' && (
              <label>
                Número da Solicitação de Compra:
                <input
                  type="text"
                  name="purchaseOrder"
                  value={modalInfo.purchaseOrder}
                  onChange={handleModalChange}
                  style={{ width: '100%', marginBottom: '0.5rem' }}
                />
              </label>
            )}
            {changeType === 'remove' && (
              <label>
                Ativo (computador / notebook):
                <select
                  name="asset"
                  value={modalInfo.asset}
                  onChange={handleModalChange}
                  style={{ width: '100%', marginBottom: '0.5rem' }}
                >
                  <option value="">-- Selecione --</option>
                  <option value="computador">Computador</option>
                  <option value="notebook">Notebook</option>
                </select>
              </label>
            )}
            <button onClick={submitQuantityChange}>Confirmar</button>{' '}
            <button onClick={closeModal}>Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TabProductSearch;
