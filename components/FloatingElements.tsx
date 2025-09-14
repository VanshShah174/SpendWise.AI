'use client';

const FloatingElements = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {/* Floating circles */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-emerald-400/10 to-green-400/10 rounded-full animate-float blur-xl"></div>
      <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-r from-green-400/10 to-teal-400/10 rounded-full animate-float blur-xl" style={{animationDelay: '2s'}}></div>
      <div className="absolute bottom-32 left-1/4 w-20 h-20 bg-gradient-to-r from-teal-400/10 to-emerald-400/10 rounded-full animate-float blur-xl" style={{animationDelay: '4s'}}></div>
      <div className="absolute bottom-20 right-1/3 w-28 h-28 bg-gradient-to-r from-emerald-400/10 to-green-400/10 rounded-full animate-float blur-xl" style={{animationDelay: '1s'}}></div>
      
      {/* Gradient orbs */}
      <div className="absolute top-1/3 left-1/2 w-40 h-40 bg-gradient-to-r from-emerald-300/5 via-green-300/5 to-teal-300/5 rounded-full animate-float blur-2xl" style={{animationDelay: '3s'}}></div>
      <div className="absolute bottom-1/3 right-1/4 w-36 h-36 bg-gradient-to-r from-green-300/5 via-teal-300/5 to-emerald-300/5 rounded-full animate-float blur-2xl" style={{animationDelay: '5s'}}></div>
    </div>
  );
};

export default FloatingElements;