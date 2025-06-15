import React, { useEffect, useState } from 'react';
import api from '../services/api';

const TabLogs = () => {
  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchLogs = async (pageNumber = 1) => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/logs', { params: { page: pageNumber, limit: 20 } });
      setLogs(response.data.logs);
      setPage(response.data.currentPage);
      setPages(response.data.pages);
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao buscar logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(page);
  }, [page]);

  const handlePrev = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNext = () => {
    if (page < pages) setPage(page + 1);
  };

  return (
    <div>
      <h2>Logs de Movimentações</h2>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {loading ? (
        <p>Carregando logs...</p>
      ) : (
        <>
          <table border="1" cellPadding="8" cellSpacing="0" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th>Data/Hora</th>
                <th>Ação</th>
                <th>Usuário</th>
                <th>Detalhes</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <tr key={log._id}>
                  <td>{new Date(log.timestamp).toLocaleString()}</td>
                  <td>{log.action}</td>
                  <td>{log.userId?.username || 'N/A'}</td>
                  <td><pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(log.details, null, 2)}</pre></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ marginTop: '1rem' }}>
            <button onClick={handlePrev} disabled={page === 1}>Anterior</button>{' '}
            <span>Página {page} de {pages}</span>{' '}
            <button onClick={handleNext} disabled={page === pages}>Próxima</button>
          </div>
        </>
      )}
    </div>
  );
};

export default TabLogs;
