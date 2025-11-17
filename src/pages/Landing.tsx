import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  BarChart3,
  CreditCard,
  Scan,
  CheckCircle,
  Upload,
  ArrowRight
} from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { useAuthStore } from '../hooks/useAuth';
import logoGreen from '../assets/Budget_Buddy_green.png';
import logoWhite from '../assets/Budget_Buddy_White.png';
import BackgroundImage from '../assets/Background_Landing.png';

export const Landing = () => {
  const { isAuthenticated } = useAuthStore();

  const features = [
    {
      icon: <BarChart3 className="w-6 h-6 lg:w-8 lg:h-8" />,
      title: 'Smart Budget Tracking',
      description:
        'Monitor your spending with beautiful charts and real-time insights. Stay on top of your finances effortlessly.'
    },
    {
      icon: <Scan className="w-6 h-6 lg:w-8 lg:h-8" />,
      title: 'AI Receipt Scanning',
      description:
        'Snap a photo or upload receipt images — our AI automatically extracts all transaction details. Save time, stay organized.'
    },
    {
      icon: <CreditCard className="w-6 h-6 lg:w-8 lg:h-8" />,
      title: 'Multi-Platform',
      description:
        'Works seamlessly on desktop and mobile. Access your budget anywhere, anytime with our responsive design.'
    }
  ];

  const faqs = [
    {
      question: 'Is BudgetBuddy really free?',
      answer:
        'Yes! BudgetBuddy is completely free to use forever. No hidden fees, no subscriptions — we believe everyone deserves great financial tools.'
    },
    {
      question: 'How does the receipt scanning work?',
      answer:
        'Upload a photo of your receipt or take one with your phone. Our AI automatically detects amounts, dates, and merchants.'
    },
    {
      question: 'Can I use it on both phone and computer?',
      answer:
        'Absolutely! BudgetBuddy is fully responsive and works perfectly on all your devices — desktop, tablet, and smartphone.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary-dark/10 dark:to-primary-dark/5">
      {/* Navigation */}
      <nav className="px-4 py-4 lg:px-8 lg:py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 lg:gap-3">
            <img
              src={logoGreen}
              alt="BudgetBuddy Logo"
              className="w-8 h-8 lg:w-10 lg:h-10 object-contain rounded-lg"
            />
            <span className="text-lg sm:text-xl lg:text-2xl font-bold text-primary-dark dark:text-primary-light">
              BudgetBuddy
            </span>
          </div>
          <div className="flex items-center gap-3 lg:gap-6">
            <a
              href="#features"
              className="hidden md:block text-sm lg:text-base text-gray-600 dark:text-gray-400 hover:text-primary-dark dark:hover:text-primary-light transition-colors"
            >
              Features
            </a>
            <a
              href="#faq"
              className="hidden md:block text-sm lg:text-base text-gray-600 dark:text-gray-400 hover:text-primary-dark dark:hover:text-primary-light transition-colors"
            >
              FAQ
            </a>
            {!isAuthenticated ? (
              <div className="flex items-center gap-2 lg:gap-4">
                <Link to="/login">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hidden sm:flex group text-primary DEFAULT dark:text-white hover:text-primary-light dark:hover:text-primary text-sm lg:text-base"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm" className="text-sm lg:text-base whitespace-nowrap">
                    Get Started
                  </Button>
                </Link>
              </div>
            ) : (
              <Link to="/dashboard">
                <Button variant="primary" size="sm" className="text-sm lg:text-base">Dashboard</Button>
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-4 py-12 sm:py-16 lg:py-20 xl:py-24">
        {/* Background image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${BackgroundImage})`,
            filter: 'brightness(0.8)',
            backgroundSize: 'cover',
          }} 
        />
        <div className="absolute inset-0 bg-white opacity-20"></div>
        <div className="absolute inset-0 opacity-60 rounded-lg" style={{ boxShadow: "0px 0px 60px rgba(255, 255, 255, 0.8)" }}></div>

        <div className="relative max-w-7xl mx-auto text-center z-10">
          <motion.h1
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-4 sm:mb-6 lg:mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="inline-block border-b-2 lg:border-b-4 border-white pb-2">
              Take Control of Your
            </span>
            <br className="sm:hidden" />
            <span className="text-primary dark:text-primary-light"> Finances</span>
          </motion.h1>
          
          <motion.p
            className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-white mb-6 sm:mb-8 lg:mb-10 max-w-3xl mx-auto px-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            The completely free, AI-powered expense tracker that helps you manage your money across all devices.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-3 lg:gap-4 justify-center items-center px-4"
          >
            {!isAuthenticated ? (
              <>
                <Link to="/register" className="w-full sm:w-auto">
                  <Button size="lg" variant="primary" className="flex items-center justify-center gap-2 w-full">
                    Start For Free <ArrowRight className="w-4 h-4 lg:w-5 lg:h-5" />
                  </Button>
                </Link>
                <p className="text-white text-xs sm:text-sm">
                  No credit card • Forever free
                </p>
              </>
            ) : (
              <Link to="/dashboard" className="w-full sm:w-auto">
                <Button size="lg" variant="primary" className="flex items-center justify-center gap-2 w-full">
                  Go to Dashboard <ArrowRight className="w-4 h-4 lg:w-5 lg:h-5" />
                </Button>
              </Link>
            )}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-4 py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary-dark/10 dark:to-primary-dark/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10 sm:mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary-dark dark:text-primary-light mb-2 sm:mb-4 px-4">
              Powerful Features, Zero Cost
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {features.map((feature, index) => (
              <Card key={index} hover className="text-center p-5 sm:p-6 h-full">
                <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-primary/10 dark:bg-primary-light/20 rounded-2xl flex items-center justify-center text-primary dark:text-primary-light mx-auto mb-3 sm:mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-primary-dark dark:text-white mb-2 sm:mb-3">
                  {feature.title}
                </h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* OCR Section */}
      <section className="px-4 py-12 sm:py-16 lg:py-20 bg-primary dark:bg-primary-dark text-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="order-2 lg:order-1"
          >
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6">
              Upload or Snap. We Do the Rest.
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-white/80 mb-4 sm:mb-6">
              Upload receipts or take photos — our AI extracts all the details automatically.
            </p>
            <div className="space-y-3 sm:space-y-4">
              {['Upload from computer', 'Take photo with phone', 'Automatic data extraction', 'Smart category suggestions'].map((item, index) => (
                <div key={index} className="flex items-center gap-2 sm:gap-3">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-white flex-shrink-0" />
                  <span className="text-sm sm:text-base text-white/90">{item}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="order-1 lg:order-2"
          >
            <Card className="p-6 sm:p-8 bg-white/10 backdrop-blur-sm border-white/20">
              <div className="text-center text-white">
                <Upload className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 mx-auto mb-3 sm:mb-4" />
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-3 sm:mb-4">Multi-Platform Scanning</h3>
                <p className="text-sm sm:text-base text-white/80">
                  Works seamlessly across all your devices. Upload from desktop or snap with mobile.
                </p>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="px-4 py-12 sm:py-16 lg:py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary-dark dark:text-primary-light text-center mb-8 sm:mb-10 lg:mb-12 px-4">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4 sm:space-y-6">
            {faqs.map((faq, index) => (
              <Card key={index} className="p-5 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-primary-dark dark:text-white mb-2">
                  {faq.question}
                </h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">{faq.answer}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-white px-4 py-12 sm:py-16 lg:py-20 mt-12 sm:mt-16">
        <div className="max-w-4xl mx-auto text-center">
          <img
            src={logoWhite}
            alt="BudgetBuddy Logo"
            className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 mx-auto mb-4 sm:mb-6 object-contain"
          />
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 px-4">
            Ready to Transform Your Finances?
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-white/90 mb-6 sm:mb-8 lg:mb-10 px-4">
            Join thousands of users managing their money smarter with BudgetBuddy.
          </p>

          {!isAuthenticated ? (
            <Link to="/register" className="inline-block w-full sm:w-auto px-4">
              <Button
                size="lg"
                variant="secondary"
                className="bg-white text-primary-dark hover:bg-white/90 flex items-center justify-center gap-2 mx-auto w-full sm:w-auto"
              >
                Get Started Free
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            </Link>
          ) : (
            <Link to="/dashboard" className="inline-block w-full sm:w-auto px-4">
              <Button
                size="lg"
                variant="secondary"
                className="bg-white text-primary-dark hover:bg-white/90 flex items-center justify-center gap-2 mx-auto w-full sm:w-auto"
              >
                Go to Dashboard
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            </Link>
          )}

          <p className="text-white/60 text-xs sm:text-sm mt-8 sm:mt-10 lg:mt-12 px-4">
            © {new Date().getFullYear()} <span className="font-semibold">BudgetBuddy</span> - Built BY students, made FOR students.
          </p>
        </div>
      </footer>
    </div>
  );
};