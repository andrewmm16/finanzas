import React, { useState } from 'react';
import { InputFieldComponent } from '../components/InputFieldComponent';
import { useNavigate } from 'react-router-dom';

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name?: string;
  };
}

export const SignInPage: React.FC = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<LoginRequest>({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    general?: string;
  }>({});

  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Limpiar errores cuando el usuario empiece a escribir
    if (errors[field as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!formData.email) {
      newErrors.email = 'El correo electrónico es obligatorio';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El formato del correo electrónico no es válido';
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es obligatoria';
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
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
    setErrors({});

    try {
      const response = await fetch('https://localhost:7049/api/v1/authentication/sign-in', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        if (response.status === 401) {
          setErrors({ general: 'Credenciales incorrectas. Verifica tu email y contraseña.' });
        } else if (response.status === 400) {
          const errorData = await response.json();
          setErrors({ general: errorData.message || 'Datos de entrada inválidos' });
        } else if (response.status === 500) {
          setErrors({ general: 'Error interno del servidor. Intenta más tarde.' });
        } else {
          setErrors({ general: 'Error de conexión. Verifica tu conexión a internet.' });
        }
        return;
      }

      const data: LoginResponse = await response.json();
      
      // Guardar el token en localStorage o sessionStorage
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Redirigir al usuario a la página principal
      console.log('Login exitoso:', data);
      navigate('/home'); // Cambia '/home' por la ruta que uses para HomePage
      
    } catch (error) {
      console.error('Error durante el login:', error);
      setErrors({ 
        general: 'Error de conexión. Verifica que la API esté ejecutándose en https://localhost:7049' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="w-full h-[100dvh] px-4 sm:px-8 md:px-10 lg:px-16 py-4 flex flex-col justify-center items-center gap-2">
      <h1 className="text-(--title-color) font-bebas-neue text-center text-8xl">YOURBONO</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-160 mx-auto mt-10">
        <InputFieldComponent
          value={formData.email}
          placeholder="Correo electrónico"
          type="email"
          autocomplete="email"
          error={errors.email}
          onChange={(value) => handleChange('email', value)}
        />
        <InputFieldComponent
          value={formData.password}
          placeholder="Contraseña"
          type="password"
          autocomplete="current-password"
          error={errors.password}
          onChange={(value) => handleChange('password', value)}
        />
        <button
          type="submit"
          disabled={isLoading}
          className="bg-(--button-color) text-white p-4 rounded-md hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
        </button>

        {errors.general && (
          <span className="text-red-400 text-sm text-center">{errors.general}</span>
        )}

        <p className="text-center text-base text-white">¿Aún no tienes una cuenta?</p>
        <div className="w-full h-0.5 bg-white" />
        <button
          type="button"
          className="bg-(--button-color) text-white p-4 rounded-md hover:cursor-pointer"
        >
          Regístrate
        </button>
      </form>
    </main>
  );
};