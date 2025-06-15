import React from 'react';

const Header = () => {
  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      padding: '0.5rem 1rem',
      backgroundColor: '#004080',
      color: 'white',
      height: '60px'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        backgroundColor: '#004080',
        padding: '0.25rem',
        borderRadius: '4px'
      }}>
        <img
          src="https://catarinensepharma.com.br/wp-content/themes/catarinense/assets/images/logo-footer.png.webp"
          alt="Logo Catarinense Pharma"
          style={{ height: '40px', marginRight: '0.5rem', backgroundColor: '#004080', borderRadius: '4px' }}
        />
      </div>
      <h1 style={{ margin: '0 1rem', fontSize: '1.5rem', fontWeight: 'bold', flexGrow: 1 }}>
        Insumos de TI
      </h1>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        backgroundColor: 'white',
        padding: '0.25rem',
        borderRadius: '4px'
      }}>
        <img
          src="https://abplast.com.br/wp-content/uploads/2025/03/Mask-group.svg"
          alt="Logo AB Plast"
          style={{ height: '40px', marginLeft: '0.5rem' }}
        />
      </div>
    </header>
  );
};

export default Header;
