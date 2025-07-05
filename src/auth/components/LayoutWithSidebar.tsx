import React from 'react';
import { Sidebar } from './Sidebar';

interface LayoutWithSidebarProps {
  children: React.ReactNode;
  activeItem?: string;
  onNavigate?: (itemId: string) => void;
}

// Iconos simples usando emojis o caracteres
const icons = {
  home: '🏠',
  data: '📊',
  movements: '📈',
  history: '📋',
  operations: '⚙️',
  reports: '📄',
  valuation: '💰',
  analysis: '📊',
  plan: '📝',
  settings: '⚙️'
};

// Configuración de la barra lateral
const sidebarItems = [
  {
    id: 'inicio',
    label: 'Inicio',
    icon: icons.home
  },
  {
    id: 'mis-d|tos',
    label: 'Mis datos',
    icon: icons.data
  },
  {
    id: 'movimientos',
    label: 'Movimientos',
    icon: icons.movements
  },
  {
    id: 'historial',
    label: 'Historial',
    icon: icons.history
  },
  {
    id: 'operaciones',
    label: 'Operaciones',
    icon: icons.operations,
    children: [
      {
        id: 'registro',
        label: 'Registro'
      },
      {
        id: 'valoracion',
        label: 'Valoración'
      },
      {
        id: 'analisis',
        label: 'Análisis'
      },
      {
        id: 'plan-seguros',
        label: 'Plan de seguros'
      }
    ]
  },
  {
    id: 'configuracion',
    label: 'Configuración',
    icon: icons.settings
  }
];

export const LayoutWithSidebar: React.FC<LayoutWithSidebarProps> = ({
  children,
  activeItem,
  onNavigate
}) => {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        title="YourBono"
        items={sidebarItems}
        activeItem={activeItem}
        onItemClick={onNavigate}
      />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
};

export default LayoutWithSidebar;