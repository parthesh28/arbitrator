'use client';

interface StepperProps {
  steps: string[];
  currentStep: number;
}

export default function Stepper({ steps, currentStep }: StepperProps) {
  return (
    <div className="flex items-center justify-between max-w-3xl mx-auto w-full relative">
      <div className="absolute top-1/2 left-0 w-full h-px bg-zinc-800 -z-10 -translate-y-1/2">
        <div 
          className="h-full bg-orange-500 transition-all duration-300 ease-out"
          style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
        />
      </div>
      
      {steps.map((step, i) => {
        const isActive = i === currentStep;
        const isDone = i < currentStep;
        
        return (
          <div key={step} className="flex flex-col items-center group bg-zinc-950 px-2">
            <div 
              className={`w-6 h-6 flex items-center justify-center font-mono text-[10px] font-bold border ${
                isActive 
                  ? 'border-orange-500 bg-orange-500 text-black' 
                  : isDone 
                    ? 'border-orange-500 text-orange-500 bg-zinc-950'
                    : 'border-zinc-700 text-zinc-600 bg-zinc-950'
              } transition-colors duration-300`}
            >
              {i + 1}
            </div>
            <span 
              className={`absolute mt-8 text-[9px] font-mono tracking-widest uppercase ${
                isActive ? 'text-zinc-50 font-bold' : 'text-zinc-600'
              }`}
            >
              {step}
            </span>
          </div>
        );
      })}
    </div>
  );
}
