import React, { useState, useEffect } from 'react';
import api from '../services/api';

const TabAssetManagement = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [csvFile, setCsvFile] = useState(null);
  const [newAssetName, setNewAssetName] = useState('');
  const [newAssetType, setNewAssetType] = useState('computador');
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
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/assets');
      setAssets(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao buscar ativos');
    } finally {
      setLoading(false);
    }
  };

  const handleCsvChange = (e) => {
    setCsvFile(e.target.files[0]);
  };

  const handleCsvUpload = async () => {
    if (!csvFile) {
      setError('Selecione um arquivo CSV');
      return;
    }
    setError('');
    setMessage('');
    const formData = new FormData();
    formData.append('file', csvFile);
    try {
      const response = await api.post('/assets/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMessage(`Importação concluída. Sucesso: ${response.data.success.length}, Ignorados: ${response.data.ignored.length}, Erros: ${response.data.errors.length}`);
      fetchAssets();
      setCsvFile(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao importar CSV');
    }
  };

  const handleAddAsset = async () => {
    if (!newAssetName) {
      setError('Informe o nome do ativo');
      return;
    }
    setError('');
    setMessage('');
    try {
      await api.post('/assets', { nome: newAssetName, tipo: newAssetType });
      setMessage('Ativo adicionado com sucesso');
      setNewAssetName('');
      setNewAssetType('computador');
      fetchAssets();
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao adicionar ativo');
    }
  };

  const handleRemoveAsset = async (id) => {
    if (!window.confirm('Confirma exclusão do ativo?')) return;
    setError('');
    setMessage('');
    try {
      await api.delete(`/assets/${id}`);
      setMessage('Ativo removido com sucesso');
      fetchAssets();
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao remover ativo');
    }
  };

  if (!isAdmin) {
    return <p>Você não tem permissão para acessar esta seção.</p>;
  }

  return (
    <div>
      <h2>Gerenciar Ativos</h2>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {message && <div style={{ color: 'green' }}>{message}</div>}

      <div style={{ marginBottom: '1rem' }}>
        <h3>Importar CSV</h3>
        <input type="file" accept=".csv" onChange={handleCsvChange} />
        <button onClick={handleCsvUpload} disabled={!csvFile}>Importar</button>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <h3>Adicionar Ativo Manualmente</h3>
        <input
          type="text"
          placeholder="Nome do ativo"
          value={newAssetName}
          onChange={e => setNewAssetName(e.target.value)}
          style={{ marginRight: '0.5rem' }}
        />
        <select value={newAssetType} onChange={e => setNewAssetType(e.target.value)} style={{ marginRight: '0.5rem' }}>
          <option value="computador">Computador</option>
          <option value="notebook">Notebook</option>
        </select>
        <button onClick={handleAddAsset}>Adicionar</button>
      </div>

      <h3>Ativos Cadastrados</h3>
      {loading ? (
        <p>Carregando ativos...</p>
      ) : (
        <table border="1" cellPadding="8" cellSpacing="0" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Tipo</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {assets.map(asset => (
              <tr key={asset._id}>
                <td>{asset.nome}</td>
                <td>{asset.tipo}</td>
                <td>
                  <button onClick={() => handleRemoveAsset(asset._id)}>Remover</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default TabAssetManagement;
