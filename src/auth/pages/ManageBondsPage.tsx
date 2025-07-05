import React, { useState, useEffect } from 'react';
import { LayoutWithSidebar } from '../components/LayoutWithSidebar';

// Importar esta página en tu App.tsx y agregar la ruta:
// import { ManageBondsPage } from './auth/pages/ManageBondsPage'
// <Route path='/manage-bonds' element={<ManageBondsPage />}/>

interface Bond {
  id: number;
  userId: number;
  name: string;
  nominalValue: number;
  marketValue: number;
  duration: number;
  frequency: number;
  interestRateTypeId: number;
  interestRate: number;
  capitalization: number;
  discountRate: number;
  emissionDate: string;
  gracePeriodTypeId: number;
  gracePeriodDuration: number;
  currencyTypeId: number;
  primeRate: number;
  structuredRate: number;
  placementRate: number;
  floatingRate: number;
  cavaliRate: number;
}

interface ConfirmationModal {
  show: boolean;
  bondId: number | null;
  bondName: string;
  action: 'delete' | 'edit';
}

interface EditModal {
  show: boolean;
  bond: Bond | null;
  loading: boolean;
}

// Función para decodificar el JWT token
const parseJWT = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error parsing JWT:', error);
    return null;
  }
};

// Función para obtener el userId del token
const getUserIdFromToken = (): number => {
  const token = localStorage.getItem('authToken');
  if (!token) {
    console.warn('No auth token found');
    return 1;
  }

  const decoded = parseJWT(token);
  if (!decoded) {
    console.warn('Could not decode token');
    return 1;
  }

  const userId = decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/sid'];
  
  if (!userId) {
    console.warn('UserId not found in token claims');
    return 1;
  }

  return parseInt(userId, 10);
};

// Función para formatear la fecha
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

// Función para formatear fecha para input
const formatDateForInput = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
};

// Función para formatear porcentajes
const formatPercentage = (value: number): string => {
  return `${(value * 100).toFixed(2)}%`;
};

// Función para formatear moneda
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 2
  }).format(value);
};

// Función para obtener el tipo de moneda
const getCurrencyType = (typeId: number): string => {
  switch (typeId) {
    case 1: return 'PEN';
    case 2: return 'USD';
    case 3: return 'EUR';
    default: return 'PEN';
  }
};

// Función para obtener el tipo de tasa de interés
const getInterestRateType = (typeId: number): string => {
  switch (typeId) {
    case 1: return 'Fija';
    case 2: return 'Variable';
    default: return 'Fija';
  }
};

// Función para obtener el tipo de período de gracia
const getGracePeriodType = (typeId: number): string => {
  switch (typeId) {
    case 1: return 'Parcial';
    case 2: return 'Total';
    default: return 'Parcial';
  }
};

export const ManageBondsPage: React.FC = () => {
  const [bonds, setBonds] = useState<Bond[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [confirmation, setConfirmation] = useState<ConfirmationModal>({
    show: false,
    bondId: null,
    bondName: '',
    action: 'delete'
  });
  const [editModal, setEditModal] = useState<EditModal>({
    show: false,
    bond: null,
    loading: false
  });
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const bondsPerPage = 5;

  useEffect(() => {
    const userId = getUserIdFromToken();
    setCurrentUserId(userId);
    fetchBonds(userId);
  }, []);

  const fetchBonds = async (userId: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`https://localhost:7049/api/bonds/user-id/${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          setBonds([]);
          return;
        }
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setBonds(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching bonds:', error);
      setError('Error al cargar los bonos. Verifica la conexión con la API.');
      setBonds([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteBond = async (bondId: number) => {
    setActionLoading(bondId);
    
    try {
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`https://localhost:7049/api/bonds/${bondId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      // Recargar la lista de bonos
      await fetchBonds(currentUserId);
      
      // Cerrar modal de confirmación
      setConfirmation({ show: false, bondId: null, bondName: '', action: 'delete' });
      
    } catch (error) {
      console.error('Error deleting bond:', error);
      setError('Error al eliminar el bono. Verifica la conexión con la API.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleEditBond = (bond: Bond) => {
    setEditModal({
      show: true,
      bond: { ...bond },
      loading: false
    });
  };

  const handleUpdateBond = async (updatedBond: Bond) => {
    setEditModal(prev => ({ ...prev, loading: true }));
    
    try {
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`https://localhost:7049/api/bonds/${updatedBond.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedBond)
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      // Recargar la lista de bonos
      await fetchBonds(currentUserId);
      
      // Cerrar modal de edición
      setEditModal({ show: false, bond: null, loading: false });
      
    } catch (error) {
      console.error('Error updating bond:', error);
      setError('Error al actualizar el bono. Verifica la conexión con la API.');
    } finally {
      setEditModal(prev => ({ ...prev, loading: false }));
    }
  };

  const showConfirmation = (bondId: number, bondName: string, action: 'delete' | 'edit') => {
    setConfirmation({
      show: true,
      bondId,
      bondName,
      action
    });
  };

  const handleConfirmAction = () => {
    if (confirmation.bondId && confirmation.action === 'delete') {
      handleDeleteBond(confirmation.bondId);
    }
  };

  const handleNavigation = (itemId: string) => {
    console.log(`Navigating to: ${itemId}`);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editModal.bond) {
      handleUpdateBond(editModal.bond);
    }
  };

  const handleInputChange = (field: keyof Bond, value: string | number) => {
    if (editModal.bond) {
      setEditModal(prev => ({
        ...prev,
        bond: {
          ...prev.bond!,
          [field]: value
        }
      }));
    }
  };

  // Paginación
  const indexOfLastBond = currentPage * bondsPerPage;
  const indexOfFirstBond = indexOfLastBond - bondsPerPage;
  const currentBonds = bonds.slice(indexOfFirstBond, indexOfLastBond);
  const totalPages = Math.ceil(bonds.length / bondsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  if (isLoading) {
    return (
      <LayoutWithSidebar activeItem="registro" onNavigate={handleNavigation}>
        <div className="flex items-center justify-center h-screen" style={{ backgroundColor: '#efffed' }}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando bonos...</p>
          </div>
        </div>
      </LayoutWithSidebar>
    );
  }

  return (
    <LayoutWithSidebar activeItem="registro" onNavigate={handleNavigation}>
      <main
        className="min-h-screen p-10"
        style={{ backgroundColor: '#efffed' }}
      >
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-10 text-gray-800">
            Gestión de Bonos
          </h1>
          
          <div className="mb-4 text-sm text-gray-600 text-center">
            Usuario ID: {currentUserId} | Total de bonos: {bonds.length}
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-md bg-red-100 border border-red-400 text-red-700">
              {error}
              <button
                onClick={() => fetchBonds(currentUserId)}
                className="ml-4 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Reintentar
              </button>
            </div>
          )}

          {bonds.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-600 text-lg">No tienes bonos registrados</p>
              <p className="text-gray-500 mt-2">¡Crea tu primer bono para comenzar!</p>
            </div>
          ) : (
            <>
              <div className="grid gap-6 mb-8">
                {currentBonds.map((bond) => (
                  <div
                    key={bond.id}
                    className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h2 className="text-xl font-semibold text-gray-800">{bond.name}</h2>
                        <p className="text-gray-600">ID: {bond.id}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditBond(bond)}
                          className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
                        >
                          ✏️ Editar
                        </button>
                        <button
                          onClick={() => showConfirmation(bond.id, bond.name, 'delete')}
                          disabled={actionLoading === bond.id}
                          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors disabled:opacity-50"
                        >
                          {actionLoading === bond.id ? '⏳' : '🗑️'} Eliminar
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Valor Nominal:</span>
                        <p className="text-gray-600">{formatCurrency(bond.nominalValue)}</p>
                      </div>
                      
                      <div>
                        <span className="font-medium text-gray-700">Valor de Mercado:</span>
                        <p className="text-gray-600">{formatCurrency(bond.marketValue)}</p>
                      </div>
                      
                      <div>
                        <span className="font-medium text-gray-700">Moneda:</span>
                        <p className="text-gray-600">{getCurrencyType(bond.currencyTypeId)}</p>
                      </div>
                      
                      <div>
                        <span className="font-medium text-gray-700">Duración:</span>
                        <p className="text-gray-600">{bond.duration} años</p>
                      </div>
                      
                      <div>
                        <span className="font-medium text-gray-700">Frecuencia:</span>
                        <p className="text-gray-600">{bond.frequency} veces/año</p>
                      </div>
                      
                      <div>
                        <span className="font-medium text-gray-700">Tasa de Interés:</span>
                        <p className="text-gray-600">{formatPercentage(bond.interestRate)} ({getInterestRateType(bond.interestRateTypeId)})</p>
                      </div>
                      
                      <div>
                        <span className="font-medium text-gray-700">Fecha de Emisión:</span>
                        <p className="text-gray-600">{formatDate(bond.emissionDate)}</p>
                      </div>
                      
                      <div>
                        <span className="font-medium text-gray-700">Período de Gracia:</span>
                        <p className="text-gray-600">{bond.gracePeriodDuration} años ({getGracePeriodType(bond.gracePeriodTypeId)})</p>
                      </div>
                      
                      <div>
                        <span className="font-medium text-gray-700">Tasa de Descuento:</span>
                        <p className="text-gray-600">{formatPercentage(bond.discountRate)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Paginación */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-3 mb-5">
                  <button
                    className="px-5 py-2 border-2 border-green-500 bg-white text-green-500 rounded hover:bg-green-500 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Anterior
                  </button>

                  <div className="flex gap-2">
                    {Array.from({ length: totalPages }, (_, index) => (
                      <button
                        key={index + 1}
                        className={`px-4 py-2 border-2 border-green-500 rounded transition-colors ${
                          currentPage === index + 1
                            ? 'bg-green-500 text-white'
                            : 'bg-white text-green-500 hover:bg-green-500 hover:text-white'
                        }`}
                        onClick={() => handlePageChange(index + 1)}
                      >
                        {index + 1}
                      </button>
                    ))}
                  </div>

                  <button
                    className="px-5 py-2 border-2 border-green-500 bg-white text-green-500 rounded hover:bg-green-500 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Siguiente
                  </button>
                </div>
              )}

              <div className="text-center text-gray-600 text-sm">
                Página {currentPage} de {totalPages} - Mostrando {currentBonds.length} de {bonds.length} bonos
              </div>
            </>
          )}
        </div>

        {/* Modal de confirmación para eliminar */}
        {confirmation.show && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">
                Confirmar Eliminación
              </h3>
              <p className="text-gray-600 mb-6">
                ¿Estás seguro que deseas eliminar el bono "{confirmation.bondName}"? Esta acción no se puede deshacer.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setConfirmation({ show: false, bondId: null, bondName: '', action: 'delete' })}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmAction}
                  disabled={actionLoading !== null}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  {actionLoading !== null ? 'Eliminando...' : 'Eliminar'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de edición */}
        {editModal.show && editModal.bond && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-semibold mb-6">
                Editar Bono: {editModal.bond.name}
              </h3>
              
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre del Bono
                    </label>
                    <input
                      type="text"
                      value={editModal.bond.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Valor Nominal
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={editModal.bond.nominalValue}
                      onChange={(e) => handleInputChange('nominalValue', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Valor de Mercado
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={editModal.bond.marketValue}
                      onChange={(e) => handleInputChange('marketValue', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Duración (años)
                    </label>
                    <input
                      type="number"
                      value={editModal.bond.duration}
                      onChange={(e) => handleInputChange('duration', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Frecuencia (veces/año)
                    </label>
                    <input
                      type="number"
                      value={editModal.bond.frequency}
                      onChange={(e) => handleInputChange('frequency', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo de Tasa de Interés
                    </label>
                    <select
                      value={editModal.bond.interestRateTypeId}
                      onChange={(e) => handleInputChange('interestRateTypeId', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value={1}>Fija</option>
                      <option value={2}>Variable</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tasa de Interés (decimal)
                    </label>
                    <input
                      type="number"
                      step="0.0001"
                      value={editModal.bond.interestRate}
                      onChange={(e) => handleInputChange('interestRate', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Capitalización
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={editModal.bond.capitalization}
                      onChange={(e) => handleInputChange('capitalization', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tasa de Descuento (decimal)
                    </label>
                    <input
                      type="number"
                      step="0.0001"
                      value={editModal.bond.discountRate}
                      onChange={(e) => handleInputChange('discountRate', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha de Emisión
                    </label>
                    <input
                      type="date"
                      value={formatDateForInput(editModal.bond.emissionDate)}
                      onChange={(e) => handleInputChange('emissionDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo de Período de Gracia
                    </label>
                    <select
                      value={editModal.bond.gracePeriodTypeId}
                      onChange={(e) => handleInputChange('gracePeriodTypeId', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value={1}>Parcial</option>
                      <option value={2}>Total</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Duración Período de Gracia (años)
                    </label>
                    <input
                      type="number"
                      value={editModal.bond.gracePeriodDuration}
                      onChange={(e) => handleInputChange('gracePeriodDuration', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo de Moneda
                    </label>
                    <select
                      value={editModal.bond.currencyTypeId}
                      onChange={(e) => handleInputChange('currencyTypeId', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value={1}>PEN</option>
                      <option value={2}>USD</option>
                      <option value={3}>EUR</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tasa Prime
                    </label>
                    <input
                      type="number"
                      step="0.0001"
                      value={editModal.bond.primeRate}
                      onChange={(e) => handleInputChange('primeRate', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tasa Estructurada
                    </label>
                    <input
                      type="number"
                      step="0.0001"
                      value={editModal.bond.structuredRate}
                      onChange={(e) => handleInputChange('structuredRate', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tasa de Colocación
                    </label>
                    <input
                      type="number"
                      step="0.0001"
                      value={editModal.bond.placementRate}
                      onChange={(e) => handleInputChange('placementRate', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tasa Flotante
                    </label>
                    <input
                      type="number"
                      step="0.0001"
                      value={editModal.bond.floatingRate}
                      onChange={(e) => handleInputChange('floatingRate', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tasa Cavali
                    </label>
                    <input
                      type="number"
                      step="0.0001"
                      value={editModal.bond.cavaliRate}
                      onChange={(e) => handleInputChange('cavaliRate', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-3 justify-end mt-6 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setEditModal({ show: false, bond: null, loading: false })}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
                    disabled={editModal.loading}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={editModal.loading}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors disabled:opacity-50"
                  >
                    {editModal.loading ? 'Guardando...' : 'Guardar Cambios'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </LayoutWithSidebar>
  );
};

export default ManageBondsPage;