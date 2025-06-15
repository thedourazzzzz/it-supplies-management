import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Login from '../components/Login';

const LoginPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    if (userData.forcePasswordChange) {
      navigate('/change-password');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div>
      <Login onLoginSuccess={handleLoginSuccess} />
    </div>
  );
};

export default LoginPage;
