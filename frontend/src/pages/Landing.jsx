import React from 'react';
import Navbar from '../components/landing/Navbar';
import Hero from '../components/landing/Hero';
import DemoSection from '../components/landing/DemoSection';
import Features from '../components/landing/Features';
import Pricing from '../components/landing/Pricing';
import Footer from '../components/landing/Footer';

const Landing = () => {
    return (
        <div className="min-h-screen bg-[#0a0a0f]">
            <Navbar />
            <Hero />
            <DemoSection />
            <Features />
            <Pricing />
            <Footer />
        </div>
    );
};

export default Landing;
