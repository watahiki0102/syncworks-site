import React from 'react';
import { motion, Variants } from 'framer-motion';

interface AnimatedCardProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  whileHover?: boolean;
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  delay = 0,
  className = '',
  whileHover = true
}) => {
  const cardVariants: Variants = {
    hidden: {
      opacity: 0,
      y: 50,
      scale: 0.9
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        damping: 20,
        stiffness: 100,
        delay
      }
    }
  };

  const hoverVariants: Variants = whileHover
    ? {
        hover: {
          y: -10,
          scale: 1.02,
          transition: {
            type: "spring",
            damping: 15,
            stiffness: 300
          }
        }
      }
    : {};

  const variants: Variants = { ...cardVariants, ...hoverVariants };

  return (
    <motion.div
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="visible"
      whileHover={whileHover ? "hover" : undefined}
      viewport={{ once: true, amount: 0.3 }}
    >
      {children}
    </motion.div>
  );
};
