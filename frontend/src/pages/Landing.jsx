import React from 'react';
import HeroSection from '../components/landing/HeroSection';
import DemoSection from '../components/landing/DemoSection';
import HowItWorks from '../components/landing/HowItWorks';
import FeaturesGrid from '../components/landing/FeaturesGrid';
import Footer from '../components/landing/Footer';

const Landing = () => {
    return (
        <div className="min-h-screen bg-white">
            <HeroSection />
            <DemoSection />
            <HowItWorks />
            <FeaturesGrid />
            <Footer />
        </div>
    );
};

export default Landing;
