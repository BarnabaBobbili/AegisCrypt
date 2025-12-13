import React from 'react';
import { ThemeProvider, useTheme } from '../hooks/useTheme';
import Navbar from '../components/landing/Navbar';
import Hero from '../components/landing/Hero';
import DemoSection from '../components/landing/DemoSection';
import Features from '../components/landing/Features';
import Pricing from '../components/landing/Pricing';
import Footer from '../components/landing/Footer';

const Landing = () => {
    return (
        <ThemeProvider>
            <LandingContent />
        </ThemeProvider>
    );
};

const LandingContent = () => {
    const { isDark } = useTheme();

    return (
        <div className={`min-h-screen ${isDark ? 'bg-[#0a0a0f]' : 'bg-gray-50'}`}>
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
