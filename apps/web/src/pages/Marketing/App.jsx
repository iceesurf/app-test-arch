
import React from 'react';
import Header from './Header';
import Hero from './Hero';
import Services from './Services';
import About from './About';
import Contact from './Contact';
import Footer from './Footer';
import RegisterModal from './RegisterModal';
import ContactModal from './ContactModal';

function App() {
    return (
        <div>
            <Header />
            <Hero />
            <Services />
            <About />
            <Contact />
            <Footer />
            <RegisterModal />
            <ContactModal />
        </div>
    );
}

export default App;
