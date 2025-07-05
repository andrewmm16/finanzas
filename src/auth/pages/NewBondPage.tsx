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

interface ValidationWarning {
  field: string;
  message: string;
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

export const NewBondPage: React.FC = () => {
  const [currentUserId, setCurrentUserId] = useState<number>(1);
  
  const [formData, setFormData] = useState<BondFormData>({
    userId: 1,
    name: '',
    nominalValue: 1000,
    marketValue: 950,
    duration: 5,
    frequency: 2,
    interestRateTypeId: 1,
    interestRate: 8.0,
    capitalization: 2,
    discountRate: 7.0,
    emissionDate: new Date().toISOString().split('T')[0],
    gracePeriodTypeId: 1,
    gracePeriodDuration: 0,
    currencyTypeId: 1,
    primeRate: 3.0,
    structuredRate: 1.0,
    placementRate: 2.0,
    floatingRate: 0.5,
    cavaliRate: 0.25,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [warnings, setWarnings] = useState<ValidationWarning[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('');

  useEffect(() => {
    const userId = getUserIdFromToken();
    setCurrentUserId(userId);
    setFormData(prev => ({ ...prev, userId }));
  }, []);

  const handleChange = (field: keyof BondFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    // Limpiar advertencias cuando el usuario cambie el campo
    if (warnings.some(w => w.field === field)) {
      setWarnings(prev => prev.filter(w => w.field !== field));
    }
  };

  const validateBusinessLogic = (): ValidationWarning[] => {
    const businessWarnings: ValidationWarning[] = [];

    // Validación: Valor de mercado muy diferente del nominal
    const marketToNominalRatio = formData.marketValue / formData.nominalValue;
    if (marketToNominalRatio < 0.5 || marketToNominalRatio > 1.5) {
      businessWarnings.push({
        field: 'marketValue',
        message: `El valor de mercado (${formData.marketValue}) es muy diferente del nominal (${formData.nominalValue}). Esto puede causar problemas en los cálculos.`
      });
    }

    // Validación: Tasa de interés muy alta o muy baja
    if (formData.interestRate > 50) {
      businessWarnings.push({
        field: 'interestRate',
        message: 'La tasa de interés es muy alta (>50%). Esto puede causar overflow en los cálculos.'
      });
    }
    if (formData.interestRate < 0.01) {
      businessWarnings.push({
        field: 'interestRate',
        message: 'La tasa de interés es muy baja (<0.01%). Verifique que sea correcta.'
      });
    }

    // Validación: Frecuencia vs Capitalización
    if (formData.capitalization > 0 && formData.frequency > 0) {
      if (formData.capitalization > formData.frequency * 4) {
        businessWarnings.push({
          field: 'capitalization',
          message: 'La capitalización es muy alta comparada con la frecuencia de pago. Esto puede causar problemas en los cálculos.'
        });
      }
    }

    // Validación: Duración del período de gracia
    if (formData.gracePeriodDuration >= formData.duration) {
      businessWarnings.push({
        field: 'gracePeriodDuration',
        message: 'El período de gracia no puede ser mayor o igual a la duración total del bono.'
      });
    }

    // Validación: Consistencia de tasas
    if (formData.discountRate > formData.interestRate) {
      businessWarnings.push({
        field: 'discountRate',
        message: 'La tasa de descuento es mayor que la tasa de interés. Esto puede generar valores negativos.'
      });
    }

    // Validación: Suma de tasas adicionales muy alta
    const totalAdditionalRates = formData.primeRate + formData.structuredRate + 
                                formData.placementRate + formData.floatingRate + formData.cavaliRate;
    if (totalAdditionalRates > formData.interestRate) {
      businessWarnings.push({
        field: 'primeRate',
        message: `La suma de tasas adicionales (${totalAdditionalRates.toFixed(2)}%) es mayor que la tasa de interés principal. Verifique los valores.`
      });
    }

    // Validación: Duración extrema
    if (formData.duration > 50) {
      businessWarnings.push({
        field: 'duration',
        message: 'La duración es muy larga (>50 años). Esto puede causar overflow en los cálculos de valor futuro.'
      });
    }

    return businessWarnings;
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validaciones básicas
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

    // Validaciones de límites para prevenir overflow
    if (formData.nominalValue > 1000000000) {
      newErrors.nominalValue = 'El valor nominal no puede ser mayor a 1,000,000,000';
    }
    if (formData.marketValue > 1000000000) {
      newErrors.marketValue = 'El valor de mercado no puede ser mayor a 1,000,000,000';
    }
    if (formData.duration > 100) {
      newErrors.duration = 'La duración no puede ser mayor a 100 años';
    }
    if (formData.frequency > 365) {
      newErrors.frequency = 'La frecuencia no puede ser mayor a 365 veces por año';
    }
    if (formData.interestRate > 100) {
      newErrors.interestRate = 'La tasa de interés no puede ser mayor al 100%';
    }
    if (formData.capitalization > 365) {
      newErrors.capitalization = 'La capitalización no puede ser mayor a 365 veces por año';
    }

    // Validaciones de tasas negativas
    if (formData.discountRate < 0) {
      newErrors.discountRate = 'La tasa de descuento no puede ser negativa';
    }
    if (formData.primeRate < 0) {
      newErrors.primeRate = 'La tasa prime no puede ser negativa';
    }
    if (formData.structuredRate < 0) {
      newErrors.structuredRate = 'La tasa estructurada no puede ser negativa';
    }
    if (formData.placementRate < 0) {
      newErrors.placementRate = 'La tasa de colocación no puede ser negativa';
    }
    if (formData.floatingRate < 0) {
      newErrors.floatingRate = 'La tasa flotante no puede ser negativa';
    }
    if (formData.cavaliRate < 0) {
      newErrors.cavaliRate = 'La tasa CAVALI no puede ser negativa';
    }

    // Validaciones de fechas
    const emissionDate = new Date(formData.emissionDate);
    const today = new Date();
    const maxDate = new Date();
    maxDate.setFullYear(today.getFullYear() + 10);

    if (emissionDate > maxDate) {
      newErrors.emissionDate = 'La fecha de emisión no puede ser mayor a 10 años en el futuro';
    }

    // Validaciones de período de gracia
    if (formData.gracePeriodDuration < 0) {
      newErrors.gracePeriodDuration = 'La duración del período de gracia no puede ser negativa';
    }
    if (formData.gracePeriodDuration > formData.duration) {
      newErrors.gracePeriodDuration = 'El período de gracia no puede ser mayor a la duración total';
    }

    setErrors(newErrors);
    
    // Generar advertencias de lógica de negocio
    const businessWarnings = validateBusinessLogic();
    setWarnings(businessWarnings);
    
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setSubmitMessage(null);
    setDebugInfo('');

    try {
      // Redondear valores para evitar problemas de precisión
      const roundToDecimals = (num: number, decimals: number) => {
        return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
      };

      // Crear el objeto con el formato exacto del swagger
      const formattedData = {
        userId: currentUserId,
        name: formData.name.trim(),
        nominalValue: roundToDecimals(formData.nominalValue, 2),
        marketValue: roundToDecimals(formData.marketValue, 2),
        duration: formData.duration,
        frequency: formData.frequency,
        interestRateTypeId: formData.interestRateTypeId,
        interestRate: roundToDecimals(formData.interestRate / 100, 6), // Convertir a decimal con 6 decimales
        capitalization: formData.capitalization,
        discountRate: roundToDecimals(formData.discountRate / 100, 6), // Convertir a decimal con 6 decimales
        emissionDate: formData.emissionDate + 'T00:00:00.000Z', // Formato ISO completo
        gracePeriodTypeId: formData.gracePeriodTypeId,
        gracePeriodDuration: formData.gracePeriodDuration,
        currencyTypeId: formData.currencyTypeId,
        primeRate: roundToDecimals(formData.primeRate / 100, 6), // Convertir a decimal con 6 decimales
        structuredRate: roundToDecimals(formData.structuredRate / 100, 6), // Convertir a decimal con 6 decimales
        placementRate: roundToDecimals(formData.placementRate / 100, 6), // Convertir a decimal con 6 decimales
        floatingRate: roundToDecimals(formData.floatingRate / 100, 6), // Convertir a decimal con 6 decimales
        cavaliRate: roundToDecimals(formData.cavaliRate / 100, 6), // Convertir a decimal con 6 decimales
      };

      // Validación final antes de enviar
      if (formattedData.interestRate <= 0 || formattedData.interestRate > 1) {
        throw new Error('La tasa de interés debe estar entre 0.01% y 100%');
      }

      // Log para debugging
      console.log('Datos a enviar:', JSON.stringify(formattedData, null, 2));
      setDebugInfo(`Datos enviados: ${JSON.stringify(formattedData, null, 2)}`);

      const token = localStorage.getItem('authToken');
      
      const response = await fetch('https://localhost:7049/api/bonds', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formattedData),
      });

      // Obtener el texto de la respuesta para debugging
      const responseText = await response.text();
      console.log('Respuesta del servidor:', responseText);

      if (!response.ok) {
        // Mostrar más información del error
        setDebugInfo(prev => prev + `\n\nError del servidor: ${response.status} - ${response.statusText}\nRespuesta: ${responseText}`);
        
        // Proporcionar mensajes de error más específicos
        let errorMessage = 'Error al crear el bono';
        if (responseText.includes('OverflowException')) {
          errorMessage = 'Error: Los valores ingresados son demasiado grandes para el cálculo. Revise los valores del bono y las tasas.';
        } else if (responseText.includes('ArgumentException')) {
          errorMessage = 'Error: Algunos valores ingresados no son válidos. Revise los datos del formulario.';
        } else if (responseText.includes('DivideByZeroException')) {
          errorMessage = 'Error: División por cero en los cálculos. Revise que las frecuencias y duraciones no sean cero.';
        }
        
        throw new Error(errorMessage);
      }

      const result = responseText ? JSON.parse(responseText) : {};
      console.log('Bono creado exitosamente:', result);
      
      setSubmitMessage({ 
        type: 'success', 
        message: 'Bono creado exitosamente' 
      });

      // Limpiar el formulario
      setFormData({
        userId: currentUserId,
        name: '',
        nominalValue: 1000,
        marketValue: 950,
        duration: 5,
        frequency: 2,
        interestRateTypeId: 1,
        interestRate: 8.0,
        capitalization: 2,
        discountRate: 7.0,
        emissionDate: new Date().toISOString().split('T')[0],
        gracePeriodTypeId: 1,
        gracePeriodDuration: 0,
        currencyTypeId: 1,
        primeRate: 3.0,
        structuredRate: 1.0,
        placementRate: 2.0,
        floatingRate: 0.5,
        cavaliRate: 0.25,
      });

      setWarnings([]);

    } catch (error) {
      console.error('Error al crear el bono:', error);
      setSubmitMessage({ 
        type: 'error', 
        message: error instanceof Error ? error.message : 'Error desconocido al crear el bono' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      userId: currentUserId,
      name: '',
      nominalValue: 1000,
      marketValue: 950,
      duration: 5,
      frequency: 2,
      interestRateTypeId: 1,
      interestRate: 8.0,
      capitalization: 2,
      discountRate: 7.0,
      emissionDate: new Date().toISOString().split('T')[0],
      gracePeriodTypeId: 1,
      gracePeriodDuration: 0,
      currencyTypeId: 1,
      primeRate: 3.0,
      structuredRate: 1.0,
      placementRate: 2.0,
      floatingRate: 0.5,
      cavaliRate: 0.25,
    });
    setErrors({});
    setWarnings([]);
    setSubmitMessage(null);
    setDebugInfo('');
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

        {warnings.length > 0 && (
          <div className="mb-6 p-4 rounded-md w-full max-w-5xl bg-yellow-100 border border-yellow-400 text-yellow-700">
            <h3 className="font-semibold mb-2">⚠️ Advertencias:</h3>
            <ul className="list-disc list-inside space-y-1">
              {warnings.map((warning, index) => (
                <li key={index} className="text-sm">{warning.message}</li>
              ))}
            </ul>
          </div>
        )}

        {debugInfo && (
          <div className="mb-6 p-4 rounded-md w-full max-w-5xl bg-gray-100 border border-gray-300">
            <h3 className="font-semibold mb-2">Debug Info:</h3>
            <pre className="text-xs overflow-auto max-h-40">{debugInfo}</pre>
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
                <label className="block mb-1 font-medium text-gray-700">Valor Nominal * (máx: 1,000,000,000)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max="1000000000"
                  value={formData.nominalValue}
                  onChange={(e) => handleChange('nominalValue', parseFloat(e.target.value) || 0)}
                  placeholder="1000"
                  className={`w-full border rounded-md p-2 ${errors.nominalValue ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.nominalValue && <span className="text-red-500 text-sm">{errors.nominalValue}</span>}
              </div>

              <div>
                <label className="block mb-1 font-medium text-gray-700">Valor de Mercado * (máx: 1,000,000,000)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max="1000000000"
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
                <label className="block mb-1 font-medium text-gray-700">Duración (años) * (máx: 100)</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={formData.duration}
                  onChange={(e) => handleChange('duration', parseInt(e.target.value) || 0)}
                  placeholder="5"
                  className={`w-full border rounded-md p-2 ${errors.duration ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.duration && <span className="text-red-500 text-sm">{errors.duration}</span>}
              </div>

              <div>
                <label className="block mb-1 font-medium text-gray-700">Frecuencia de Pago (veces por año) * (máx: 365)</label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={formData.frequency}
                  onChange={(e) => handleChange('frequency', parseInt(e.target.value) || 0)}
                  placeholder="2"
                  className={`w-full border rounded-md p-2 ${errors.frequency ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.frequency && <span className="text-red-500 text-sm">{errors.frequency}</span>}
                <small className="text-gray-500 text-xs">Común: 1=Anual, 2=Semestral, 4=Trimestral, 12=Mensual</small>
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
                  min="0"
                  max={formData.duration - 1}
                  value={formData.gracePeriodDuration}
                  onChange={(e) => handleChange('gracePeriodDuration', parseInt(e.target.value) || 0)}
                  placeholder="0"
                  className={`w-full border rounded-md p-2 ${errors.gracePeriodDuration ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.gracePeriodDuration && <span className="text-red-500 text-sm">{errors.gracePeriodDuration}</span>}
              </div>

              <div>
                <label className="block mb-1 font-medium text-gray-700">Capitalización (veces por año) (máx: 365)</label>
                <input
                  type="number"
                  min="0"
                  max="365"
                  value={formData.capitalization}
                  onChange={(e) => handleChange('capitalization', parseInt(e.target.value) || 0)}
                  placeholder="2"
                  className={`w-full border rounded-md p-2 ${errors.capitalization ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.capitalization && <span className="text-red-500 text-sm">{errors.capitalization}</span>}
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
                <label className="block mb-1 font-medium text-gray-700">Tasa de Interés (%) * (máx: 100%)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max="100"
                  value={formData.interestRate}
                  onChange={(e) => handleChange('interestRate', parseFloat(e.target.value) || 0)}
                  placeholder="8.00"
                  className={// Continuación del código del formulario - parte faltante con validaciones mejoradas

              `w-full border rounded-md p-2 ${errors.interestRate ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.interestRate && <span className="text-red-500 text-sm">{errors.interestRate}</span>}
              </div>

              <div>
                <label className="block mb-1 font-medium text-gray-700">Tasa de Descuento (%)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="50"
                  value={formData.discountRate}
                  onChange={(e) => handleChange('discountRate', parseFloat(e.target.value) || 0)}
                  placeholder="7.00"
                  className={`w-full border rounded-md p-2 ${errors.discountRate ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.discountRate && <span className="text-red-500 text-sm">{errors.discountRate}</span>}
              </div>
            </div>
          </div>

          {/* Tasas Adicionales */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Tasas Adicionales</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block mb-1 font-medium text-gray-700">Tasa Prime (%)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="20"
                  value={formData.primeRate}
                  onChange={(e) => handleChange('primeRate', parseFloat(e.target.value) || 0)}
                  placeholder="3.00"
                  className={`w-full border rounded-md p-2 ${errors.primeRate ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.primeRate && <span className="text-red-500 text-sm">{errors.primeRate}</span>}
              </div>

              <div>
                <label className="block mb-1 font-medium text-gray-700">Tasa Estructurada (%)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="20"
                  value={formData.structuredRate}
                  onChange={(e) => handleChange('structuredRate', parseFloat(e.target.value) || 0)}
                  placeholder="1.00"
                  className={`w-full border rounded-md p-2 ${errors.structuredRate ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.structuredRate && <span className="text-red-500 text-sm">{errors.structuredRate}</span>}
              </div>

              <div>
                <label className="block mb-1 font-medium text-gray-700">Tasa de Colocación (%)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="20"
                  value={formData.placementRate}
                  onChange={(e) => handleChange('placementRate', parseFloat(e.target.value) || 0)}
                  placeholder="2.00"
                  className={`w-full border rounded-md p-2 ${errors.placementRate ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.placementRate && <span className="text-red-500 text-sm">{errors.placementRate}</span>}
              </div>

              <div>
                <label className="block mb-1 font-medium text-gray-700">Tasa Flotante (%)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="20"
                  value={formData.floatingRate}
                  onChange={(e) => handleChange('floatingRate', parseFloat(e.target.value) || 0)}
                  placeholder="0.50"
                  className={`w-full border rounded-md p-2 ${errors.floatingRate ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.floatingRate && <span className="text-red-500 text-sm">{errors.floatingRate}</span>}
              </div>

              <div>
                <label className="block mb-1 font-medium text-gray-700">Tasa CAVALI (%)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="20"
                  value={formData.cavaliRate}
                  onChange={(e) => handleChange('cavaliRate', parseFloat(e.target.value) || 0)}
                  placeholder="0.25"
                  className={`w-full border rounded-md p-2 ${errors.cavaliRate ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.cavaliRate && <span className="text-red-500 text-sm">{errors.cavaliRate}</span>}
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400"
            >
              {isLoading ? 'Creando...' : 'Crear Bono'}
            </button>
          </div>
        </form>
      </main>
    </LayoutWithSidebar>
  );
};