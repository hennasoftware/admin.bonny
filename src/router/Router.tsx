import React, { createContext, useContext, useState } from 'react';

type Page = 'coming-soon' | 'login';

interface RouterContextType {
  currentPage: Page;
  goTo: (page: Page) => void;
}

const RouterContext = createContext<RouterContextType | undefined>(undefined);

export const useRouter = () => {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error('useRouter must be used within a RouterProvider');
  }
  return context;
};

export const RouterProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentPage, setCurrentPage] = useState<Page>('coming-soon');

  const goTo = (page: Page) => {
    setCurrentPage(page);
  };

  return (
    <RouterContext.Provider value={{ currentPage, goTo }}>
      {children}
    </RouterContext.Provider>
  );
};

