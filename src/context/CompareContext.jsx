import React, { createContext, useState, useEffect } from 'react';
import { message } from 'antd';

export const CompareContext = createContext();

export const CompareProvider = ({ children }) => {
  const [compareList, setCompareList] = useState([]);

  // Load from local storage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('kpi_compare_cart');
      if (stored) {
        setCompareList(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to parse compare cart from localStorage');
    }
  }, []);

  // Save to local storage whenever list changes
  useEffect(() => {
    localStorage.setItem('kpi_compare_cart', JSON.stringify(compareList));
  }, [compareList]);

  const addToCompare = (apartment, projectInfo) => {
    // Check limit
    if (compareList.length >= 5 && !compareList.some(item => item.id === apartment.id)) {
      message.error('Bạn chỉ có thể so sánh tối đa 5 căn hộ cùng lúc.');
      return;
    }

    // Check if already in cart
    if (compareList.some(item => item.id === apartment.id)) {
      message.warning(`Căn hộ ${apartment.apartmentCode} đã có trong giỏ so sánh.`);
      return;
    }
    
    // Create an object holding the apartment + project context
    const compareItem = {
      ...apartment,
      projectInfo: projectInfo // to display project name or building name later
    };

    setCompareList(prev => [...prev, compareItem]);
    message.success(`Đã thêm ${apartment.apartmentCode} vào giỏ so sánh!`);
  };

  const removeFromCompare = (apartmentId) => {
    setCompareList(prev => prev.filter(item => item.id !== apartmentId));
  };

  const clearCompare = () => {
    setCompareList([]);
    message.info('Đã xóa toàn bộ giỏ so sánh.');
  };

  return (
    <CompareContext.Provider value={{ compareList, addToCompare, removeFromCompare, clearCompare }}>
      {children}
    </CompareContext.Provider>
  );
};
