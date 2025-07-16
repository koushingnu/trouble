import React from "react";

interface FullScreenLoadingProps {
  message?: string;
}

const FullScreenLoading: React.FC<FullScreenLoadingProps> = ({
  message = "Loading...",
}) => {
  return (
    <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50 flex items-center justify-center">
      <div className="text-center">
        <div
          className="inline-block h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
          role="status"
        >
          <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
            Loading...
          </span>
        </div>
        <p className="mt-4 text-lg text-gray-700 dark:text-gray-200">
          {message}
        </p>
      </div>
    </div>
  );
};

export default FullScreenLoading;
