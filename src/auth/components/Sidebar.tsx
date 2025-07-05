import React, { useState } from 'react';

interface SidebarItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  children?: SidebarItem[];
}

interface SidebarProps {
  title?: string;
  items: SidebarItem[];
  activeItem?: string;
  onItemClick?: (itemId: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  title = "YourBono",
  items,
  activeItem,
  onItemClick
}) => {
  const [expandedItems, setExpandedItems] = useState<string[]>(['operaciones']);

  const toggleExpand = (itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleItemClick = (itemId: string, hasChildren: boolean) => {
    if (hasChildren) {
      toggleExpand(itemId);
    } else {
      onItemClick?.(itemId);
    }
  };

  const renderItem = (item: SidebarItem, level: number = 0) => {
    const hasChildren = Boolean(item.children && item.children.length > 0);
    const isExpanded = expandedItems.includes(item.id);
    const isActive = activeItem === item.id;

    return (
      <div key={item.id}>
        <div
          className={`flex items-center px-3 py-2 cursor-pointer transition-colors ${
            isActive 
              ? 'bg-gray-200 text-gray-900' 
              : 'text-gray-600 hover:bg-gray-100'
          } ${level > 0 ? 'ml-4' : ''}`}
          onClick={() => handleItemClick(item.id, hasChildren)}
          style={{ paddingLeft: `${12 + level * 16}px` }}
        >
          {item.icon && (
            <span className="mr-3 text-sm">
              {item.icon}
            </span>
          )}
          <span className="flex-1 text-sm font-medium">{item.label}</span>
          {hasChildren && (
            <span className={`transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
              ▶
            </span>
          )}
        </div>
        {hasChildren && isExpanded && (
          <div className="ml-2">
            {item.children!.map(child => renderItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-full overflow-y-auto">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      </div>

      {/* Navigation */}
      <nav className="p-2">
        <div className="mb-4">
          <h3 className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            PRINCIPAL
          </h3>
          {items.map(item => renderItem(item))}
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;