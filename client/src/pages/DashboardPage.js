import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';

// Placeholder components for tabs (to be implemented)
const UserManagement = () => <div>Gerenciamento de Usuários</div>;
const ProductSearch = () => <div>Buscar Produto</div>;
const ProductRegistration = () => <div>Cadastrar Produto</div>;
const AssetManagement = () => <div>Gerenciar Ativos</div>;
const DescriptorManager = () => <div>Gerenciador de Descritivos</div>;
const Logs = () => <div>Logs de Movimentações</div>;

const DashboardPage = () => {
  const [activeTab, setActiveTab] = useState('user-management');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Get user info from token or API
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/';
      return;
    }
    // Decode token or fetch user info to check admin status
    // For simplicity, decode JWT payload here
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setIsAdmin(payload.isAdmin);
    } catch {
      setIsAdmin(false);
    }
  }, []);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'user-management':
        return <UserManagement />;
      case 'product-search':
        return <ProductSearch />;
      case 'product-registration':
        return <ProductRegistration />;
      case 'asset-management':
        return <AssetManagement />;
      case 'descriptor-manager':
        return <DescriptorManager />;
      case 'logs':
        return <Logs />;
      default:
        return <UserManagement />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <Header />
      <div style={{ display: 'flex', flexGrow: 1 }}>
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} isAdmin={isAdmin} />
        <main style={{ flexGrow: 1, padding: '1rem', overflowY: 'auto' }}>
          {renderTabContent()}
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;
