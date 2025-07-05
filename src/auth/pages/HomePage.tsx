import React from 'react';
import { LayoutWithSidebar } from '../../auth/components/LayoutWithSidebar';

export const HomePage: React.FC = () => {
  const handleNavigation = (itemId: string) => {
    console.log(`Navigating to: ${itemId}`);
    // Aquí puedes implementar la navegación real
    // Por ejemplo, usando React Router:
    // navigate(`/${itemId}`);
  };

  return (
    <LayoutWithSidebar 
      activeItem="inicio" 
      onNavigate={handleNavigation}
    >
      <main
        className="flex flex-col items-center justify-center p-10"
        style={{ backgroundColor: '#efffed', height: '100vh' }}
      >
        <h1 className="text-4xl font-bold mb-6">Inicio</h1>
        <p className="text-lg mb-8">Tu configuración actual</p>
        <div className="flex gap-8">
          <button
            className="w-48 h-12 rounded-md text-black font-medium transition-colors"
            style={{
              backgroundColor: '#47FFA9',
            }}
            onMouseOver={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#3edb90';
            }}
            onMouseOut={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#47FFA9';
            }}
          >
            Lorem ipsum
          </button>

          <button
            className="w-48 h-12 rounded-md text-black font-medium transition-colors"
            style={{
              backgroundColor: '#47FFA9',
            }}
            onMouseOver={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#3edb90';
            }}
            onMouseOut={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#47FFA9';
            }}
          >
            Lorem ipsum
          </button>
        </div>
      </main>
    </LayoutWithSidebar>
  );
};

export default HomePage;