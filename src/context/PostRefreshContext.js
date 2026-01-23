import React, { createContext, useState, useCallback } from 'react';

export const PostRefreshContext = createContext();

export const PostRefreshProvider = ({ children }) => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const triggerRefresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  const value = {
    refreshTrigger,
    triggerRefresh,
  };

  return (
    <PostRefreshContext.Provider value={value}>
      {children}
    </PostRefreshContext.Provider>
  );
};

export const usePostRefresh = () => {
  const context = React.useContext(PostRefreshContext);
  if (!context) {
    throw new Error('usePostRefresh must be used within PostRefreshProvider');
  }
  return context;
};
