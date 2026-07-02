'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { 
  Loader2,
  Sparkles,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  MoreHorizontal,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Ripple Effect Button
export function RippleButton({ children, className, ...props }: any) {
  return (
    <button
      className={cn(
        'relative overflow-hidden transition-all duration-300',
        'hover:shadow-lg hover:scale-105 active:scale-95',
        className
      )}
      {...props}
    >
      <span className="relative z-10">{children}</span>
    </button>
  );
}

// Premium Card with Hover Effect
export function PremiumCard({ children, className, ...props }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ 
        y: -4,
        boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.15)',
        transition: { duration: 0.2 }
      }}
      className={cn(
        'rounded-xl border border-border/40 bg-background',
        'transition-all duration-300',
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Floating Toolbar
export function FloatingToolbar({ children, className, ...props }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={cn(
        'flex items-center gap-2 p-2 rounded-xl',
        'bg-background/95 backdrop-blur-sm',
        'border border-border/40 shadow-2xl',
        'transition-all duration-300',
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Premium Shadow Utility
export const premiumShadows = {
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-xl',
  '2xl': 'shadow-2xl',
  luxury: 'shadow-luxury',
  glow: 'shadow-glow',
  inner: 'shadow-inner',
  none: 'shadow-none',
};

// Context Menu
export function ContextMenu({ 
  isOpen, 
  onClose, 
  children, 
  className,
  ...props 
}: any) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={cn(
              'absolute z-50 min-w-[200px] p-2 rounded-xl',
              'bg-background/95 backdrop-blur-sm',
              'border border-border/40 shadow-2xl',
              'transition-all duration-200',
              className
            )}
            {...props}
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Context Menu Item
export function ContextMenuItem({ children, icon, className, ...props }: any) {
  return (
    <button
      className={cn(
        'w-full flex items-center gap-3 px-3 py-2 rounded-lg',
        'text-sm text-left',
        'hover:bg-brand-500/10 hover:text-brand-600',
        'transition-colors duration-200',
        className
      )}
      {...props}
    >
      {icon && <span className="w-4 h-4">{icon}</span>}
      {children}
    </button>
  );
}

// Loading Skeleton
export function LoadingSkeleton({ className, ...props }: any) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-lg bg-muted/50',
        'transition-all duration-300',
        className
      )}
      {...props}
    />
  );
}

// Elegant Empty State
export function EmptyState({ 
  icon, 
  title, 
  description, 
  action,
  className,
  ...props 
}: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'flex flex-col items-center justify-center p-8',
        'text-center space-y-4',
        className
      )}
      {...props}
    >
      <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center">
        {icon}
      </div>
      <div className="space-y-2">
        <h3 className="font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground max-w-md">{description}</p>
      </div>
      {action}
    </motion.div>
  );
}

// Success Animation
export function SuccessAnimation({ onComplete }: { onComplete?: () => void }) {
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      exit={{ scale: 0 }}
      onAnimationComplete={onComplete}
      className="relative"
    >
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', damping: 10, stiffness: 200 }}
        className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center"
      >
        <CheckCircle className="w-8 h-8 text-white" />
      </motion.div>
      <motion.div
        initial={{ scale: 0, opacity: 1 }}
        animate={{ scale: 3, opacity: 0 }}
        transition={{ duration: 0.6 }}
        className="absolute inset-0 rounded-full bg-green-500/30"
      />
    </motion.div>
  );
}

// Confetti Animation
export function ConfettiAnimation({ trigger }: { trigger: boolean }) {
  const particles = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 0.5,
    color: ['#0F766E', '#D4AF37', '#C25B33', '#10B981', '#3B82F6'][i % 5],
  }));

  return (
    <AnimatePresence>
      {trigger && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              initial={{ 
                x: particle.x + '%', 
                y: '-10%',
                opacity: 1,
                scale: 1
              }}
              animate={{
                y: '110%',
                opacity: 0,
                scale: 0,
                rotate: particle.id * 360
              }}
              transition={{
                duration: 2 + Math.random(),
                delay: particle.delay,
                ease: 'easeOut'
              }}
              className="absolute w-3 h-3 rounded-full"
              style={{ 
                backgroundColor: particle.color,
                left: particle.x + '%'
              }}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}

// Toast Notification
export function Toast({ 
  type = 'info', 
  title, 
  message, 
  onClose,
  className 
}: any) {
  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-500" />,
    error: <XCircle className="w-5 h-5 text-red-500" />,
    warning: <AlertCircle className="w-5 h-5 text-yellow-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />,
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      className={cn(
        'flex items-start gap-3 p-4 rounded-xl',
        'bg-background/95 backdrop-blur-sm',
        'border border-border/40 shadow-2xl',
        'transition-all duration-300',
        className
      )}
    >
      <div className="flex-shrink-0">{icons[type]}</div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm">{title}</div>
        <div className="text-xs text-muted-foreground mt-1">{message}</div>
      </div>
      <button
        onClick={onClose}
        className="flex-shrink-0 h-6 w-6 rounded-lg hover:bg-muted/50 flex items-center justify-center transition-colors"
      >
        <XCircle className="w-4 h-4 text-muted-foreground" />
      </button>
    </motion.div>
  );
}

// Smooth Transition Wrapper
export function SmoothTransition({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
    >
      {children}
    </motion.div>
  );
}

// Hover Reveal Component
export function HoverReveal({ 
  trigger, 
  content, 
  className 
}: { 
  trigger: React.ReactNode; 
  content: React.ReactNode; 
  className?: string;
}) {
  return (
    <div className={cn('relative group', className)}>
      {trigger}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileHover={{ opacity: 1, y: 0 }}
        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-2 rounded-lg bg-background/95 backdrop-blur-sm border border-border/40 shadow-xl whitespace-nowrap z-50 pointer-events-none group-hover:pointer-events-auto"
      >
        {content}
      </motion.div>
    </div>
  );
}

// Expandable Card
export function ExpandableCard({ 
  title, 
  children, 
  defaultExpanded = false,
  className 
}: { 
  title: string; 
  children: React.ReactNode; 
  defaultExpanded?: boolean;
  className?: string;
}) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <motion.div
      layout
      className={cn(
        'rounded-xl border border-border/40 bg-background',
        'overflow-hidden transition-all duration-300',
        isExpanded ? 'shadow-lg' : 'shadow-sm',
        className
      )}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
      >
        <span className="font-medium">{title}</span>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronRight className="w-5 h-5" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="p-4 pt-0 border-t border-border/40"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Magnetic Button (follows cursor slightly)
export function MagneticButton({ children, className, ...props }: any) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={cn(
        'relative transition-transform duration-200',
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
}

// Shimmer Effect
export function Shimmer({ className, ...props }: any) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-lg',
        'bg-gradient-to-r from-transparent via-muted/50 to-transparent',
        'animate-shimmer',
        className
      )}
      {...props}
    />
  );
}

// Staggered Animation List
export function StaggeredList({ children, className }: { children: React.ReactNode; className?: string }) {
  const items = React.Children.toArray(children);

  return (
    <div className={className}>
      {items.map((item, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          {item}
        </motion.div>
      ))}
    </div>
  );
}

// Premium Badge
export function PremiumBadge({ children, variant = 'default', className, ...props }: any) {
  const variants = {
    default: 'bg-brand-500 text-white shadow-lg shadow-brand-500/30',
    secondary: 'bg-muted text-foreground shadow-lg',
    outline: 'border-2 border-brand-500 text-brand-500',
    ghost: 'bg-brand-500/10 text-brand-600',
  };

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      whileHover={{ scale: 1.05 }}
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium',
        'transition-all duration-200',
        variants[variant],
        className
      )}
      {...props}
    >
      <Sparkles className="w-3 h-3" />
      {children}
    </motion.div>
  );
}
