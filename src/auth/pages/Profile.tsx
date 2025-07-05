import React, { useState, useEffect } from 'react';
import { LayoutWithSidebar } from '../components/LayoutWithSidebar';
import { useNavigate } from 'react-router-dom';

interface User {
  id: number;
  username: string;
}

export const Profile: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [newUsername, setNewUsername] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const navigate = useNavigate();

  // Función para obtener el ID del usuario desde el token JWT
  const getUserId = (): number | null => {
    try {
      const token = localStorage.getItem('authToken'); // Cambio aquí: 'token' → 'authToken'
      if (!token) {
        return null;
      }

      // Verificar que el token tenga el formato correcto (3 partes separadas por puntos)
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) {
        console.error('Token format invalid');
        return null;
      }

      // Decodificar el token JWT (payload)
      const payload = JSON.parse(atob(tokenParts[1]));
      
      // Extraer el ID del usuario desde la claim 'sid'
      const userId = payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/sid"];
      
      if (!userId) {
        console.error('User ID not found in token');
        return null;
      }

      return parseInt(userId);
    } catch (error) {
      console.error('Error parsing token:', error);
      return null;
    }
  };

  // Función para obtener los datos del usuario
  const fetchUserData = async (userId: number) => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('authToken'); // Cambio aquí: 'token' → 'authToken'
      if (!token) {
        throw new Error('No se encontró token de autenticación. Por favor, inicia sesión nuevamente.');
      }

      const response = await fetch(`https://localhost:7049/api/v1/users/${userId}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        throw new Error('Token de autenticación inválido o expirado. Por favor, inicia sesión nuevamente.');
      }

      if (!response.ok) {
        throw new Error(`Error al obtener los datos del usuario: ${response.status} - ${response.statusText}`);
      }

      const userData = await response.json();
      setUser(userData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  // Función para actualizar el username
  const updateUsername = async () => {
    if (!user || !newUsername.trim()) return;

    try {
      setIsUpdating(true);
      setError(null);
      
      const token = localStorage.getItem('authToken'); // Cambio aquí: 'token' → 'authToken'
      if (!token) {
        throw new Error('No se encontró token de autenticación. Por favor, inicia sesión nuevamente.');
      }

      const response = await fetch(`https://localhost:7049/api/v1/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          username: newUsername.trim(),
        }),
      });

      if (response.status === 401) {
        throw new Error('Token de autenticación inválido o expirado. Por favor, inicia sesión nuevamente.');
      }

      if (!response.ok) {
        throw new Error(`Error al actualizar el usuario: ${response.status} - ${response.statusText}`);
      }

      // Actualizar el estado local
      setUser(prev => prev ? { ...prev, username: newUsername.trim() } : null);
      setIsModalOpen(false);
      setNewUsername('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar');
    } finally {
      setIsUpdating(false);
    }
  };

  // Cargar datos del usuario al montar el componente
  useEffect(() => {
    const userId = getUserId();
    if (userId) {
      fetchUserData(userId);
    } else {
      // No hay token o no se pudo obtener el ID del usuario
      setError('No hay sesión activa. Por favor, inicia sesión para ver tu perfil.');
      setLoading(false);
    }
  }, []);

  const handleNavigation = (itemId: string) => {
    console.log(`Navigating to: ${itemId}`);
  };

  const openEditModal = () => {
    setNewUsername(user?.username || '');
    setIsModalOpen(true);
    setError(null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setNewUsername('');
    setError(null);
  };

  const handleRetry = () => {
    const userId = getUserId();
    if (userId) {
      fetchUserData(userId);
    } else {
      setError('No hay sesión activa. Por favor, inicia sesión para ver tu perfil.');
    }
  };

  if (loading) {
    return (
      <LayoutWithSidebar activeItem="perfil" onNavigate={handleNavigation}>
        <main className="flex items-center justify-center p-10" style={{ backgroundColor: '#efffed', height: '100vh' }}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-lg">Cargando perfil...</p>
          </div>
        </main>
      </LayoutWithSidebar>
    );
  }

  if (error && !user) {
    return (
      <LayoutWithSidebar activeItem="perfil" onNavigate={handleNavigation}>
        <main className="flex items-center justify-center p-10" style={{ backgroundColor: '#efffed', height: '100vh' }}>
          <div className="text-center">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <p className="font-bold">Error</p>
              <p>{error}</p>
            </div>
            <div className="space-y-3">
              <button
                onClick={handleRetry}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-3"
              >
                Reintentar
              </button>
              <button
                onClick={() => navigate('/sign-in')}
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
              >
                Ir a Iniciar Sesión
              </button>
            </div>
          </div>
        </main>
      </LayoutWithSidebar>
    );
  }

  return (
    <LayoutWithSidebar activeItem="perfil" onNavigate={handleNavigation}>
      <main className="p-10" style={{ backgroundColor: '#efffed', minHeight: '100vh' }}>
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-center">Mi Perfil</h1>
          
          {/* Tarjeta del perfil */}
          <div className="bg-white rounded-lg shadow-md p-8 mb-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center text-2xl font-bold text-gray-600 mr-6">
                  {user?.username?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-gray-800">
                    {user?.username || 'Usuario'}
                  </h2>
                  <p className="text-gray-600">ID: {user?.id}</p>
                </div>
              </div>
              <button
                onClick={openEditModal}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
              >
                Editar Username
              </button>
            </div>
          </div>

          {/* Información adicional */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-4">Información de la Cuenta</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Usuario:</span>
                <span className="font-medium">{user?.username}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">ID de Usuario:</span>
                <span className="font-medium">{user?.id}</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modal para editar username */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-semibold mb-4">Editar Username</h3>
            
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                <p>{error}</p>
              </div>
            )}

            <div className="mb-4">
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Nuevo Username
              </label>
              <input
                type="text"
                id="username"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ingresa tu nuevo username"
                disabled={isUpdating}
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={closeModal}
                disabled={isUpdating}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={updateUsername}
                disabled={isUpdating || !newUsername.trim()}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center"
              >
                {isUpdating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Actualizando...
                  </>
                ) : (
                  'Guardar'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </LayoutWithSidebar>
  );
};

export default Profile;