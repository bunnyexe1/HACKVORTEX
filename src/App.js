import React from 'react';
import './AppStyles.css';
import Header from './components/Header';
import Footer from './components/Footer';
import ProductGrid from './components/ProductGrid'; // Import ProductGrid

function App() {
  return (
    <div className="App">
      <Header />
      <main className="App-main">
        <h1 style={{ textAlign: 'center', margin: '20px 0' }}>Discover NFTs</h1>
        <ProductGrid /> {/* Use ProductGrid */}
      </main>
      <Footer />
    </div>
  );
}

export default App;