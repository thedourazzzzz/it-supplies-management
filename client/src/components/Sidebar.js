import React from 'react';

const tabs = [
  { id: 'user-management', label: 'Gerenciamento de Usuários' },
  { id: 'product-search', label: 'Buscar Produto' },
  { id: 'product-registration', label: 'Cadastrar Produto' },
  { id: 'asset-management', label: 'Gerenciar Ativos' },
  { id: 'descriptor-manager', label: 'Gerenciador de Descritivos' },
  { id: 'logs', label: 'Logs de Movimentações' }
];

const Sidebar = ({ activeTab, onTabChange, isAdmin }) => {
  return (
    <nav style={{
      width: '220px',
      backgroundColor: '#f0f0f0',
      height: 'calc(100vh - 60px)',
      paddingTop: '1rem',
      boxSizing: 'border-box'
    }}>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {tabs.map(tab => {
          // Hide admin-only tabs if user is not admin
          if (!isAdmin && ['product-registration', 'asset-management', 'descriptor-manager'].includes(tab.id)) {
            return null;
          }
          return (
            <li key={tab.id} style={{ marginBottom: '0.5rem' }}>
              <button
                onClick={() => onTabChange(tab.id)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  backgroundColor: activeTab === tab.id ? '#004080' : 'transparent',
                  color: activeTab === tab.id ? 'white' : '#333',
                  border: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontWeight: activeTab === tab.id ? 'bold' : 'normal',
                  borderRadius: '4px'
                }}
              >
                {tab.label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default Sidebar;
