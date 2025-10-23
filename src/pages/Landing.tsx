import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Wallet, BarChart3, CreditCard, Scan, Shield, Smartphone, ArrowRight, CheckCircle, Upload } from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { useAuthStore } from '../hooks/useAuth';

export const Landing = () => {
  const { isAuthenticated } = useAuthStore();

  const features = [
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Smart Budget Tracking",
      description: "Monitor your spending with beautiful charts and real-time insights. Stay on top of your finances effortlessly."
    },
    {
      icon: <Scan className="w-8 h-8" />,
      title: "AI Receipt Scanning",
      description: "Snap a photo or upload receipt images - our AI automatically extracts all transaction details. Save time, stay organized."
    },
    {
      icon: <CreditCard className="w-8 h-8" />,
      title: "Multi-Platform",
      description: "Works seamlessly on desktop and mobile. Access your budget anywhere, anytime with our responsive design."
    }
  ];

  const faqs = [
    {
      question: "Is BudgetBuddy really free?",
      answer: "Yes! BudgetBuddy is completely free to use forever. No hidden fees, no subscriptions - we believe everyone deserves great financial tools."
    },
    {
      question: "How does the receipt scanning work?",
      answer: "Upload a photo of your receipt from your computer or take one with your phone. Our AI automatically detects amounts, dates, and merchants."
    },
    {
      question: "Can I use it on both phone and computer?",
      answer: "Absolutely! BudgetBuddy is fully responsive and works perfectly on all your devices - desktop, tablet, and smartphone."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary-dark/10 dark:to-primary-dark/5">
      {/* Navigation */}
      <nav className="px-4 py-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-primary-dark dark:text-primary-light">BudgetBuddy</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#features" className="text-gray-600 dark:text-gray-400 hover:text-primary-dark dark:hover:text-primary-light transition-colors">Features</a>
            <a href="#faq" className="text-gray-600 dark:text-gray-400 hover:text-primary-dark dark:hover:text-primary-light transition-colors">FAQ</a>
            {!isAuthenticated ? (
              <div className="flex items-center gap-4">
                <Link to="/login">
                  <Button variant="ghost" className="hidden sm:flex">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary">
                    Get Started Free
                  </Button>
                </Link>
              </div>
            ) : (
              <Link to="/dashboard">
                <Button variant="primary">
                  Go to Dashboard
                </Button>
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-4 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto text-center">
          <motion.h1 
            className="text-4xl lg:text-6xl font-bold text-primary-dark dark:text-primary-light mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Take Control of Your
            <span className="text-primary dark:text-primary-light"> Finances</span>
          </motion.h1>
          <motion.p 
            className="text-xl lg:text-2xl text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto"
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
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            {!isAuthenticated ? (
              <>
                <Link to="/register">
                  <Button size="lg" variant="primary" className="flex items-center gap-2">
                    Start For Free <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  No credit card • Forever free
                </p>
              </>
            ) : (
              <Link to="/dashboard">
                <Button size="lg" variant="primary" className="flex items-center gap-2">
                  Go to Dashboard <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            )}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-4 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-primary-dark dark:text-primary-light mb-4">
              Powerful Features, Zero Cost
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} hover className="text-center p-6 h-full">
                <div className="w-16 h-16 bg-primary/10 dark:bg-primary-light/20 rounded-2xl flex items-center justify-center text-primary dark:text-primary-light mx-auto mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-primary-dark dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* OCR Section */}
      <section className="px-4 py-16 bg-primary dark:bg-primary-dark">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="text-white"
            >
              <h2 className="text-3xl lg:text-4xl font-bold mb-6">
                Upload or Snap. We Do the Rest.
              </h2>
              <p className="text-xl text-white/80 mb-6">
                Whether you're on your computer or phone, easily upload receipt images or use your camera. 
                Our AI automatically extracts all the details for you.
              </p>
              <div className="space-y-4">
                {['Upload from computer', 'Take photo with phone', 'Automatic data extraction', 'Smart category suggestions'].map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-white" />
                    <span className="text-white/90">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              <Card className="p-8 bg-white/10 backdrop-blur-sm border-white/20">
                <div className="text-center text-white">
                  <Upload className="w-16 h-16 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold mb-4">Multi-Platform Scanning</h3>
                  <p className="text-white/80 mb-6">
                    Works seamlessly across all your devices. Upload from desktop or snap with mobile.
                  </p>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl lg:text-4xl font-bold text-primary-dark dark:text-primary-light text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <Card key={index} className="p-6">
                <h3 className="text-lg font-semibold text-primary-dark dark:text-white mb-2">
                  {faq.question}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {faq.answer}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-4 py-16 bg-primary dark:bg-primary-dark">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            Ready to Transform Your Finances?
          </h2>
          <p className="text-xl text-white/80 mb-8">
            Join thousands of users managing their money smarter with BudgetBuddy.
          </p>
          {!isAuthenticated ? (
            <Link to="/register">
              <Button size="lg" variant="secondary" className="bg-white text-primary-dark hover:bg-white/90">
                Get Started Free <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          ) : (
            <Link to="/dashboard">
              <Button size="lg" variant="secondary" className="bg-white text-primary-dark hover:bg-white/90">
                Go to Dashboard <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 py-8 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-primary-dark dark:text-primary-light">BudgetBuddy</span>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Made with ❤️ for better financial management • 100% Free • 2024
          </p>
        </div>
      </footer>
    </div>
  );
};