import React from 'react';

const Splash = () => {
  return (
    <div className="h-screen w-screen bg-gradient-to-br from-orange-400 via-red-500 to-pink-500 flex flex-col relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-32 h-32 bg-white rounded-full blur-xl"></div>
        <div className="absolute bottom-32 right-16 w-24 h-24 bg-white rounded-full blur-lg"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-white rounded-full blur-md"></div>
      </div>
      
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-8 relative z-10">
        <div className="max-w-6xl w-full flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-20">
          {/* Left side - Main content */}
          <div className="flex flex-col items-center text-center lg:text-left lg:items-start lg:flex-1 space-y-6">
            {/* Logo with modern glow effect */}
            <div className="relative">
              <div className="absolute inset-0 bg-orange-300/40 rounded-full blur-2xl"></div>
              <img
                src="/icons/icon-192.png"
                alt="MRC Foods Logo"
                className="relative w-32 h-32 md:w-36 md:h-36 lg:w-44 lg:h-44 drop-shadow-2xl"
              />
            </div>
            
            {/* Modern typography */}
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-black mb-2 drop-shadow-lg tracking-tight">
                <span className="bg-gradient-to-r from-white to-orange-100 bg-clip-text text-transparent">
                  MRC Foods
                </span>
              </h1>
              <div className="w-24 h-1 bg-orange-300/80 rounded-full mx-auto lg:mx-0"></div>
            </div>
            
            <p className="text-xl sm:text-2xl md:text-3xl font-light mb-8 max-w-xl leading-relaxed text-white/90">
              Order your favorite food from the college canteen. 
              <span className="font-semibold text-white"> Fast, fresh, and real-time updates!</span>
            </p>
            
            {/* Modern CTA button - Swiggy style */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="group relative bg-white text-orange-600 font-bold py-4 px-10 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 text-lg overflow-hidden border-2 border-orange-200">
                <span className="relative z-10">Get Started</span>
                <div className="absolute inset-0 bg-gradient-to-r from-orange-50 to-red-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
              <button className="text-white font-semibold py-4 px-10 rounded-2xl border-2 border-orange-300/40 backdrop-blur-sm hover:bg-orange-400/20 transition-all duration-300 text-lg">
                Learn More
              </button>
            </div>
          </div>

          {/* Right side - Modern visual element */}
          <div className="hidden lg:flex lg:flex-1 justify-center items-center">
            <div className="relative">
              {/* Animated rings - Swiggy colors */}
              <div className="absolute inset-0 w-96 h-96 rounded-full border-2 border-orange-300/30 animate-spin" style={{animationDuration: '20s'}}></div>
              <div className="absolute inset-4 w-88 h-88 rounded-full border border-red-300/40 animate-spin" style={{animationDuration: '15s', animationDirection: 'reverse'}}></div>
              
              {/* Main circle */}
              <div className="w-80 h-80 bg-gradient-to-br from-orange-200/20 to-red-200/10 rounded-full flex items-center justify-center backdrop-blur-xl border border-orange-300/30 shadow-2xl">
                <div className="w-64 h-64 bg-gradient-to-br from-orange-200/30 to-red-200/20 rounded-full flex items-center justify-center backdrop-blur-lg">
                  <div className="text-8xl drop-shadow-2xl">🍽️</div>
                </div>
              </div>
              
              {/* Floating elements */}
              <div className="absolute -top-8 -right-8 w-16 h-16 bg-orange-300/30 rounded-full backdrop-blur-md animate-bounce"></div>
              <div className="absolute -bottom-6 -left-6 w-12 h-12 bg-red-300/35 rounded-full backdrop-blur-md animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Modern footer */}
      <footer className="w-full py-6 text-center text-sm text-white/70 backdrop-blur-sm relative z-10">
        <div className="flex items-center justify-center space-x-2">
          <span>&copy; {new Date().getFullYear()}</span>
          <div className="w-1 h-1 bg-orange-300/60 rounded-full"></div>
          <span className="font-semibold">MRC Foods</span>
          <div className="w-1 h-1 bg-orange-300/60 rounded-full"></div>
          <span>All rights reserved</span>
        </div>
      </footer>
    </div>
  );
};

export default Splash;
