import { Wrench } from "lucide-react";

export default function MaintenanceScreen() {
  return (
    <div className="relative min-h-screen w-full bg-gradient-to-tr from-purple-700 via-indigo-800 to-blue-900 flex items-center justify-center overflow-hidden">
      {/* Background with glowing particles */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <svg width="100%" height="100%">
          <defs>
            <radialGradient id="glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#4338ca" stopOpacity="0" />
            </radialGradient>
            <pattern id="glowingDots" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse">
              <circle cx="10" cy="10" r="3" fill="url(#glow)" />
              <circle cx="40" cy="40" r="2" fill="url(#glow)" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#glowingDots)" />
        </svg>
      </div>

      {/* Main card */}
      <div className="z-10 max-w-lg w-full mx-4 bg-gradient-to-br from-white/10 via-white/5 to-white/10 rounded-3xl backdrop-blur-lg border border-white/20 shadow-xl p-10 text-center text-white">
        {/* Floating icon */}
        <div className="flex justify-center mb-8">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 shadow-lg flex items-center justify-center animate-floating">
            <Wrench className="w-12 h-12 text-white drop-shadow-lg" />
          </div>
        </div>

        <h1 className="text-4xl font-extrabold tracking-tight mb-4 drop-shadow-lg">
          Estamos en mantenimiento
        </h1>

        <p className="text-lg text-indigo-200 mb-10 max-w-md mx-auto drop-shadow-md">
          Estamos trabajando para mejorar el sistema. Volveremos pronto con nuevas funcionalidades y mejor rendimiento.
        </p>

        {/* Spinner with a cool neon effect */}
        <div className="flex justify-center mb-10">
          <div className="loader-ring-neon"></div>
        </div>

        <p className="text-xs text-indigo-300 tracking-wide">
          Sistema EasyTrack - JASANA <br />
          Gracias por tu paciencia 🙏<br />
          ClerDevs-Code
        </p>
      </div>

      {/* Extra styles */}
      <style>{`
        @keyframes floating {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-12px);
          }
        }

        .animate-floating {
          animation: floating 4s ease-in-out infinite;
        }

        .loader-ring-neon {
          width: 48px;
          height: 48px;
          border: 5px solid transparent;
          border-top: 5px solid #a78bfa;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          box-shadow:
            0 0 8px #a78bfa,
            0 0 20px #8b5cf6,
            0 0 30px #7c3aed,
            inset 0 0 8px #a78bfa;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
