import React from 'react';

interface StepperProps {
  steps: string[];
  currentStep: number;
}

export const Stepper: React.FC<StepperProps> = ({ steps, currentStep }) => {
  return (
    <div className="w-full px-4 sm:px-8">
      <div className="flex items-center">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = currentStep > stepNumber;
          const isActive = currentStep === stepNumber;

          return (
            <React.Fragment key={step}>
              <div className="flex flex-col items-center text-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300
                    ${isActive ? 'bg-[#6D597A] border-[#6D597A] text-white' : ''}
                    ${isCompleted ? 'bg-[#B56576] border-[#B56576] text-white' : ''}
                    ${!isActive && !isCompleted ? 'bg-white border-[#6D597A]/50 text-[#3A3A3A]' : ''}
                  `}
                >
                  {isCompleted ? (
                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  ) : (
                    <span className="font-bold">{stepNumber}</span>
                  )}
                </div>
                <p className={`mt-2 text-xs sm:text-sm font-semibold transition-colors duration-300 ${isActive || isCompleted ? 'text-[#3A3A3A]' : 'text-[#3A3A3A]/60'}`}>
                  {step}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div className={`flex-auto border-t-2 transition-colors duration-300 mx-4 ${isCompleted ? 'border-[#B56576]' : 'border-[#6D597A]/50'}`}></div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};