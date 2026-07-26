import { useState } from 'react';
import Navbar from '../components/landing/Navbar';
import Hero from '../components/landing/Hero';
import Stats from '../components/landing/Stats';
import About from '../components/landing/About';
import WhyChoose from '../components/landing/WhyChoose';
import Benefits from '../components/landing/Benefits';
import StudentBenefits from '../components/landing/StudentBenefits';
import HowItWorks from '../components/landing/HowItWorks';
import Trust from '../components/landing/Trust';
import LoanPartners from '../components/landing/LoanPartners';
import Countries from '../components/landing/Countries';
import CompanyInfo from '../components/landing/CompanyInfo';
import LoanCalculator from '../components/landing/LoanCalculator';
import FAQ from '../components/landing/FAQ';
import FinalCTA from '../components/landing/FinalCTA';
import OfficeContact from '../components/landing/OfficeContact';
import Footer from '../components/landing/Footer';
import CountryModal from '../components/landing/CountryModal';
import BankModal from '../components/landing/BankModal';
import EmployeePortal from '../components/landing/EmployeePortal';

import type { CountryInfo } from '../data/countries';
import type { BankInfo } from '../data/banks';

interface LandingPageProps {
  onLogin: () => void;
  onRegister: () => void;
  onCheckEligibility: () => void;
  onEmployeeLogin: () => void;
}

export default function LandingPage({
  onLogin,
  onRegister,
  onCheckEligibility,
  onEmployeeLogin,
}: LandingPageProps) {
  const [selectedCountry, setSelectedCountry] =
    useState<CountryInfo | null>(null);

  const [selectedBank, setSelectedBank] =
    useState<BankInfo | null>(null);

  return (
    <div className="min-h-screen bg-ink-surface">
      <Navbar
        onLogin={onLogin}
        onRegister={onRegister}
        onEmployeeLogin={onEmployeeLogin}
      />

      <Hero
        onApply={onRegister}
        onCheckEligibility={onCheckEligibility}
      />

      <Stats />
      <About />
      <WhyChoose />
      <Benefits />
      <StudentBenefits />
      <HowItWorks onApply={onRegister} />
      <Trust />
      <LoanPartners onSelectBank={setSelectedBank} />
      <Countries onSelectCountry={setSelectedCountry} />
      <CompanyInfo />
      <LoanCalculator onApply={onRegister} />
      <FAQ />
      <FinalCTA onApply={onRegister} />

      <OfficeContact
        onConsult={() =>
          document
            .getElementById('contact')
            ?.scrollIntoView({ behavior: 'smooth' })
        }
      />

      <EmployeePortal
        onEmployeeLogin={onEmployeeLogin}
      />

      <Footer />

      <CountryModal
        country={selectedCountry}
        onClose={() => setSelectedCountry(null)}
        onApply={onRegister}
      />

      <BankModal
        bank={selectedBank}
        onClose={() => setSelectedBank(null)}
        onApply={onRegister}
      />
    </div>
  );
}