import './GlassCard.css';

export default function GlassCard({ children, className = '', onClick }) {
  return (
    <div className={`glass-card ${className}`} onClick={onClick}>
      {children}
    </div>
  );
}
