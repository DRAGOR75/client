import React, { useState, useEffect } from 'react';
import { TestAttemptContainer } from './components/TestAttemptContainer';
import { TestImporter } from './components/TestImporter';

const App: React.FC = () => {
  const [currentHash, setCurrentHash] = useState<string>(window.location.hash);

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentHash(window.location.hash);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  if (currentHash === '#admin') {
    return <TestImporter />;
  }

  return <TestAttemptContainer />;
};

export default App;
