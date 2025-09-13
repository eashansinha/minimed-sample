import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useLanguage, Language } from '@/contexts/LanguageContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Activity, 
  Shield, 
  Smartphone, 
  Share2, 
  ChevronDown,
  Globe,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';

const Landing = () => {
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const languages: { code: Language; label: string; flag: string }[] = [
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'es', label: 'Español', flag: '🇪🇸' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  ];

  const currentLanguage = languages.find(l => l.code === language);

  const features = [
    {
      icon: Activity,
      title: t('features.monitoring'),
      description: 'Track glucose levels continuously with advanced CGM integration'
    },
    {
      icon: Shield,
      title: t('features.delivery'),
      description: 'Smart insulin delivery that adapts to your body\'s needs'
    },
    {
      icon: Share2,
      title: t('features.sharing'),
      description: 'Share real-time data with your healthcare team'
    },
    {
      icon: Smartphone,
      title: t('features.mobile'),
      description: 'Stay connected with mobile app integration'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-medical-blue rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">M</span>
              </div>
              <span className="text-xl font-semibold text-gray-900">MiniMed</span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#" className="text-gray-600 hover:text-medical-blue transition-colors">
                {t('nav.products')}
              </a>
              <a href="#" className="text-gray-600 hover:text-medical-blue transition-colors">
                {t('nav.support')}
              </a>
              <a href="#" className="text-gray-600 hover:text-medical-blue transition-colors">
                {t('nav.healthcare')}
              </a>
            </nav>

            {/* Right Section */}
            <div className="flex items-center space-x-4">
              {/* Language Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="hidden md:flex items-center space-x-2">
                    <Globe className="h-4 w-4" />
                    <span>{currentLanguage?.flag} {currentLanguage?.label}</span>
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {languages.map((lang) => (
                    <DropdownMenuItem
                      key={lang.code}
                      onClick={() => setLanguage(lang.code)}
                      className="flex items-center space-x-2"
                    >
                      <span>{lang.flag}</span>
                      <span>{lang.label}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Sign In Button */}
              <Button 
                variant="medical" 
                onClick={() => navigate('/auth')}
                className="hidden md:inline-flex"
              >
                {t('nav.signin')}
              </Button>

              {/* Mobile Menu Button */}
              <button
                className="md:hidden p-2"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="px-4 py-2 space-y-1">
              <a href="#" className="block py-2 text-gray-600">
                {t('nav.products')}
              </a>
              <a href="#" className="block py-2 text-gray-600">
                {t('nav.support')}
              </a>
              <a href="#" className="block py-2 text-gray-600">
                {t('nav.healthcare')}
              </a>
              <div className="py-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="w-full justify-start">
                      <Globe className="h-4 w-4 mr-2" />
                      <span>{currentLanguage?.flag} {currentLanguage?.label}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-full">
                    {languages.map((lang) => (
                      <DropdownMenuItem
                        key={lang.code}
                        onClick={() => setLanguage(lang.code)}
                        className="flex items-center space-x-2"
                      >
                        <span>{lang.flag}</span>
                        <span>{lang.label}</span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <Button 
                variant="medical" 
                onClick={() => navigate('/auth')}
                className="w-full"
              >
                {t('nav.signin')}
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="container mx-auto px-4 py-20 md:py-32">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                {t('hero.title')}
              </h1>
              <p className="text-xl text-gray-600">
                {t('hero.subtitle')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  variant="medical"
                  onClick={() => navigate('/auth')}
                  className="text-lg px-8"
                >
                  {t('hero.cta')}
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="text-lg px-8"
                >
                  Learn More
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-medical-blue/10 to-medical-lightBlue/10 rounded-3xl flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="w-32 h-32 mx-auto bg-medical-blue rounded-full flex items-center justify-center mb-4">
                    <Activity className="h-16 w-16 text-white" />
                  </div>
                  <p className="text-2xl font-semibold text-gray-800">MiniMed 780G</p>
                  <p className="text-gray-600 mt-2">Advanced Hybrid Closed Loop System</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Comprehensive Diabetes Management
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the most advanced insulin pump system with features designed for your lifestyle
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center group">
                <div className="w-16 h-16 mx-auto bg-medical-blue/10 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-medical-blue/20 transition-colors">
                  <feature.icon className="h-8 w-8 text-medical-blue" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-medical-blue to-medical-lightBlue">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Take Control?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of users who have transformed their diabetes management with MiniMed
          </p>
          <Button 
            size="lg" 
            variant="secondary"
            onClick={() => navigate('/auth')}
            className="text-lg px-8"
          >
            Start Your Journey
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="text-white font-semibold mb-4">Products</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition-colors">MiniMed 780G</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Guardian Sensors</a></li>
                <li><a href="#" className="hover:text-white transition-colors">CareLink Software</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition-colors">Customer Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Training</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Resources</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Use</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Regulatory</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-sm">
              © 2024 MiniMed Dashboard. This is a demonstration platform inspired by Medtronic systems.
            </p>
            <p className="text-sm mt-2">
              Not affiliated with or endorsed by Medtronic, Inc.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
