import { motion } from 'framer-motion';
import { Snowflake } from 'lucide-react';

interface SnowToggleProps {
  isActive: boolean;
  onToggle: () => void;
}

export function SnowToggle({ isActive, onToggle }: SnowToggleProps) {
  return (
    <motion.button
      onClick={onToggle}
      className={`p-2 rounded-lg transition-colors ${
        isActive ? 'bg-primary/20 text-primary' : 'hover:bg-secondary text-muted-foreground'
      }`}
      whileTap={{ scale: 0.9 }}
      aria-label="Toggle snow effect"
    >
      <motion.div
        animate={{ rotate: isActive ? 360 : 0 }}
        transition={{ duration: 0.5 }}
      >
        <Snowflake className="w-5 h-5" />
      </motion.div>
    </motion.button>
  );
}
