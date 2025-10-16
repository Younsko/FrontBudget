import { Plus } from 'lucide-react';
import { motion } from 'framer-motion';

interface FloatingActionButtonProps {
  onClick: () => void;
}

export const FloatingActionButton = ({ onClick }: FloatingActionButtonProps) => {
  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className="lg:hidden fixed right-6 bottom-24 w-14 h-14 bg-primary rounded-full shadow-card flex items-center justify-center text-white z-40"
    >
      <Plus className="w-6 h-6" />
    </motion.button>
  );
};
