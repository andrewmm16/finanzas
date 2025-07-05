import React, { useState, useEffect } from 'react';
import { LayoutWithSidebar } from '../components/LayoutWithSidebar';

interface BondFormData {
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

interface FormErrors {
  [key: string]: string;
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
    return 1; // Valor por defecto si no hay token
  }

  const decoded = parseJWT(token);
  if (!decoded) {
    console.warn('Could not decode token');
    return 1; // Valor por defecto si no se puede decodificar
  }

  // Buscar el userId en el claim específico
  const userId = decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/sid'];
  
  if (!userId) {
    console.warn('UserId not found in token claims');
    return 1; // Valor por defecto si no se encuentra el claim
  }

  return parseInt(userId, 10);
};

export const NewBondPage: React.FC = () => {
  const [currentUserId, setCurrentUserId] = useState<number>(1);
  
  const [formData, setFormData] = useState<BondFormData>({
    userId: 1,
    name: '',
    nominalValue: 0,
    marketValue: 0,
    duration: 0,
    frequency: 0,
    interestRateTypeId: 1,
    interestRate: 0,
    capitalization: 0,
    discountRate: 0,
    emissionDate: new Date().toISOString().split('T')[0],
    gracePeriodTypeId: 1,
    gracePeriodDuration: 0,
    currencyTypeId: 1,
    primeRate: 0,
    structuredRate: 0,
    placementRate: 0,
    floatingRate: 0,
    cavaliRate: 0,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  // Obtener el userId del token al cargar el componente
  useEffect(() => {
    const userId = getUserIdFromToken();
    setCurrentUserId(userId);
    setFormData(prev => ({ ...prev, userId }));
  }, []);

  const handleChange = (field: keyof BondFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpiar errores cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validaciones requeridas
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre del bono es obligatorio';
    }
    if (formData.nominalValue <= 0) {
      newErrors.nominalValue = 'El valor nominal debe ser mayor a 0';
    }
    if (formData.marketValue <= 0) {
      newErrors.marketValue = 'El valor de mercado debe ser mayor a 0';
    }
    if (formData.duration <= 0) {
      newErrors.duration = 'La duración debe ser mayor a 0';
    }
    if (formData.frequency <= 0) {
      newErrors.frequency = 'La frecuencia debe ser mayor a 0';
    }
    if (formData.interestRate <= 0) {
      newErrors.interestRate = 'La tasa de interés debe ser mayor a 0';
    }
    if (!formData.emissionDate) {
      newErrors.emissionDate = 'La fecha de emisión es obligatoria';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setSubmitMessage(null);

    try {
      // Asegurar que el userId actual esté en el formData
      const formattedData = {
        ...formData,
        userId: currentUserId,
        emissionDate: new Date(formData.emissionDate).toISOString(),
        // Convertir las tasas de porcentaje a decimales
        interestRate: formData.interestRate / 100,
        discountRate: formData.discountRate / 100,
        primeRate: formData.primeRate / 100,
        structuredRate: formData.structuredRate / 100,
        placementRate: formData.placementRate / 100,
        floatingRate: formData.floatingRate / 100,
        cavaliRate: formData.cavaliRate / 100,
      };

      const token = localStorage.getItem('authToken');
      
      const response = await fetch('https://localhost:7049/api/bonds', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formattedData),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Bono creado exitosamente:', result);
      
      setSubmitMessage({ 
        type: 'success', 
        message: 'Bono creado exitosamente' 
      });

      // Limpiar el formulario después de un envío exitoso
      setFormData({
        userId: currentUserId,
        name: '',
        nominalValue: 0,
        marketValue: 0,
        duration: 0,
        frequency: 0,
        interestRateTypeId: 1,
        interestRate: 0,
        capitalization: 0,
        discountRate: 0,
        emissionDate: new Date().toISOString().split('T')[0],
        gracePeriodTypeId: 1,
        gracePeriodDuration: 0,
        currencyTypeId: 1,
        primeRate: 0,
        structuredRate: 0,
        placementRate: 0,
        floatingRate: 0,
        cavaliRate: 0,
      });

    } catch (error) {
      console.error('Error al crear el bono:', error);
      setSubmitMessage({ 
        type: 'error', 
        message: 'Error al crear el bono. Verifica la conexión con la API.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    // Limpiar el formulario
    setFormData({
      userId: currentUserId,
      name: '',
      nominalValue: 0,
      marketValue: 0,
      duration: 0,
      frequency: 0,
      interestRateTypeId: 1,
      interestRate: 0,
      capitalization: 0,
      discountRate: 0,
      emissionDate: new Date().toISOString().split('T')[0],
      gracePeriodTypeId: 1,
      gracePeriodDuration: 0,
      currencyTypeId: 1,
      primeRate: 0,
      structuredRate: 0,
      placementRate: 0,
      floatingRate: 0,
      cavaliRate: 0,
    });
    setErrors({});
    setSubmitMessage(null);
  };

  const handleNavigation = (itemId: string) => {
    console.log(`Navigating to: ${itemId}`);
  };

  return (
    <LayoutWithSidebar 
      activeItem="registro" 
      onNavigate={handleNavigation}
    >
      <main
        className="min-h-screen flex flex-col items-center justify-start p-10"
        style={{ backgroundColor: '#efffed' }}
      >
        <h1 className="text-4xl font-bold mb-10 text-gray-800">Nuevo Bono Corporativo</h1>
        
        {/* Mostrar información del usuario actual */}
        <div className="mb-4 text-sm text-gray-600">
          Usuario ID: {currentUserId}
        </div>

        {submitMessage && (
          <div className={`mb-6 p-4 rounded-md w-full max-w-5xl ${
            submitMessage.type === 'success' 
              ? 'bg-green-100 border border-green-400 text-green-700' 
              : 'bg-red-100 border border-red-400 text-red-700'
          }`}>
            {submitMessage.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white p-10 rounded-md shadow-md w-full max-w-5xl">
          {/* Información básica */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Información Básica</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block mb-1 font-medium text-gray-700">Nombre del Bono *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Bono Corporativo UPC 2025"
                  className={`w-full border rounded-md p-2 ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.name && <span className="text-red-500 text-sm">{errors.name}</span>}
              </div>

              <div>
                <label className="block mb-1 font-medium text-gray-700">Fecha de Emisión *</label>
                <input
                  type="date"
                  value={formData.emissionDate}
                  onChange={(e) => handleChange('emissionDate', e.target.value)}
                  className={`w-full border rounded-md p-2 ${errors.emissionDate ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.emissionDate && <span className="text-red-500 text-sm">{errors.emissionDate}</span>}
              </div>

              <div>
                <label className="block mb-1 font-medium text-gray-700">Valor Nominal *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.nominalValue}
                  onChange={(e) => handleChange('nominalValue', parseFloat(e.target.value) || 0)}
                  placeholder="1000"
                  className={`w-full border rounded-md p-2 ${errors.nominalValue ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.nominalValue && <span className="text-red-500 text-sm">{errors.nominalValue}</span>}
              </div>

              <div>
                <label className="block mb-1 font-medium text-gray-700">Valor de Mercado *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.marketValue}
                  onChange={(e) => handleChange('marketValue', parseFloat(e.target.value) || 0)}
                  placeholder="950"
                  className={`w-full border rounded-md p-2 ${errors.marketValue ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.marketValue && <span className="text-red-500 text-sm">{errors.marketValue}</span>}
              </div>

              <div>
                <label className="block mb-1 font-medium text-gray-700">Tipo de Moneda</label>
                <select
                  value={formData.currencyTypeId}
                  onChange={(e) => handleChange('currencyTypeId', parseInt(e.target.value))}
                  className="w-full border border-gray-300 rounded-md p-2"
                >
                  <option value={1}>Soles (PEN)</option>
                  <option value={2}>Dólares (USD)</option>
                  <option value={3}>Euros (EUR)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Configuración de Períodos */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Configuración de Períodos</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block mb-1 font-medium text-gray-700">Duración (años) *</label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => handleChange('duration', parseInt(e.target.value) || 0)}
                  placeholder="5"
                  className={`w-full border rounded-md p-2 ${errors.duration ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.duration && <span className="text-red-500 text-sm">{errors.duration}</span>}
              </div>

              <div>
                <label className="block mb-1 font-medium text-gray-700">Frecuencia de Pago (veces por año) *</label>
                <input
                  type="number"
                  value={formData.frequency}
                  onChange={(e) => handleChange('frequency', parseInt(e.target.value) || 0)}
                  placeholder="2"
                  className={`w-full border rounded-md p-2 ${errors.frequency ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.frequency && <span className="text-red-500 text-sm">{errors.frequency}</span>}
              </div>

              <div>
                <label className="block mb-1 font-medium text-gray-700">Tipo de Período de Gracia</label>
                <select
                  value={formData.gracePeriodTypeId}
                  onChange={(e) => handleChange('gracePeriodTypeId', parseInt(e.target.value))}
                  className="w-full border border-gray-300 rounded-md p-2"
                >
                  <option value={1}>Parcial</option>
                  <option value={2}>Total</option>
                </select>
              </div>

              <div>
                <label className="block mb-1 font-medium text-gray-700">Duración del Período de Gracia (años)</label>
                <input
                  type="number"
                  value={formData.gracePeriodDuration}
                  onChange={(e) => handleChange('gracePeriodDuration', parseInt(e.target.value) || 0)}
                  placeholder="1"
                  className="w-full border border-gray-300 rounded-md p-2"
                />
              </div>

              <div>
                <label className="block mb-1 font-medium text-gray-700">Capitalización (veces por año)</label>
                <input
                  type="number"
                  value={formData.capitalization}
                  onChange={(e) => handleChange('capitalization', parseInt(e.target.value) || 0)}
                  placeholder="2"
                  className="w-full border border-gray-300 rounded-md p-2"
                />
              </div>
            </div>
          </div>

          {/* Tasas de Interés */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Tasas de Interés</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block mb-1 font-medium text-gray-700">Tipo de Tasa de Interés</label>
                <select
                  value={formData.interestRateTypeId}
                  onChange={(e) => handleChange('interestRateTypeId', parseInt(e.target.value))}
                  className="w-full border border-gray-300 rounded-md p-2"
                >
                  <option value={1}>Fija</option>
                  <option value={2}>Variable</option>
                </select>
              </div>

              <div>
                <label className="block mb-1 font-medium text-gray-700">Tasa de Interés (%) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.interestRate}
                  onChange={(e) => handleChange('interestRate', parseFloat(e.target.value) || 0)}
                  placeholder="8.00"
                  className={`w-full border rounded-md p-2 ${errors.interestRate ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.interestRate && <span className="text-red-500 text-sm">{errors.interestRate}</span>}
              </div>

              <div>
                <label className="block mb-1 font-medium text-gray-700">Tasa de Descuento (%)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.discountRate}
                  onChange={(e) => handleChange('discountRate', parseFloat(e.target.value) || 0)}
                  placeholder="7.00"
                  className="w-full border border-gray-300 rounded-md p-2"
                />
              </div>
            </div>
          </div>

          {/* Tasas Adicionales */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Tasas Adicionales</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block mb-1 font-medium text-gray-700">Tasa Prime (%)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.primeRate}
                  onChange={(e) => handleChange('primeRate', parseFloat(e.target.value) || 0)}
                  placeholder="3.00"
                  className="w-full border border-gray-300 rounded-md p-2"
                />
              </div>

              <div>
                <label className="block mb-1 font-medium text-gray-700">Tasa Estructurada (%)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.structuredRate}
                  onChange={(e) => handleChange('structuredRate', parseFloat(e.target.value) || 0)}
                  placeholder="1.00"
                  className="w-full border border-gray-300 rounded-md p-2"
                />
              </div>

              <div>
                <label className="block mb-1 font-medium text-gray-700">Tasa de Colocación (%)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.placementRate}
                  onChange={(e) => handleChange('placementRate', parseFloat(e.target.value) || 0)}
                  placeholder="2.00"
                  className="w-full border border-gray-300 rounded-md p-2"
                />
              </div>

              <div>
                <label className="block mb-1 font-medium text-gray-700">Tasa Flotante (%)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.floatingRate}
                  onChange={(e) => handleChange('floatingRate', parseFloat(e.target.value) || 0)}
                  placeholder="0.50"
                  className="w-full border border-gray-300 rounded-md p-2"
                />
              </div>

              <div>
                <label className="block mb-1 font-medium text-gray-700">Tasa CAVALI (%)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.cavaliRate}
                  onChange={(e) => handleChange('cavaliRate', parseFloat(e.target.value) || 0)}
                  placeholder="0.25"
                  className="w-full border border-gray-300 rounded-md p-2"
                />
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex gap-4 justify-end">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isLoading}
              className="px-6 py-2 rounded-md text-white font-semibold transition-colors disabled:opacity-50"
              style={{ backgroundColor: '#dc2626' }}
              onMouseOver={(e) => {
                if (!isLoading) {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#b91c1c';
                }
              }}
              onMouseOut={(e) => {
                if (!isLoading) {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#dc2626';
                }
              }}
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 rounded-md text-black font-semibold transition-colors disabled:opacity-50"
              style={{ backgroundColor: '#47FFA9' }}
              onMouseOver={(e) => {
                if (!isLoading) {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#3edb90';
                }
              }}
              onMouseOut={(e) => {
                if (!isLoading) {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#47FFA9';
                }
              }}
            >
              {isLoading ? 'Creando Bono...' : 'Crear Bono'}
            </button>
          </div>
        </form>
      </main>
    </LayoutWithSidebar>
  );
};

export default NewBondPage;