import React from 'react';
import { Header } from './components/Header';
import { Generator } from './components/Generator';
import { Footer } from './components/Footer';

const App: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 text-white selection:bg-yellow-500 selection:text-black">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 max-w-6xl">
        <Generator />
      </main>
      <Footer />
    </div>
  );
};

export default App;