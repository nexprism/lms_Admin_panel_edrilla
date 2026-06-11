import React from "react";

interface PopupAlertProps {
  message: string;
  type?: "success" | "error" | "info";
  isVisible: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
}

const PopupAlert: React.FC<PopupAlertProps> = ({
  message,
  type = "info",
  isVisible,
  onClose,
  onConfirm,
  confirmLabel = "Yes",
  cancelLabel = "Cancel",
}) => {
  if (!isVisible) return null;

  const showConfirm = typeof onConfirm === "function";

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center" style={{ zIndex: 999999 }} role="dialog" aria-modal="true">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl">
        <div className="flex items-center mb-4">
          {type === "success" && (
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
              <svg
                className="w-5 h-5 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
            </div>
          )}
          {type === "error" && (
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
              <svg
                className="w-5 h-5 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </div>
          )}
          <h3 className="text-lg font-semibold text-gray-900">
            {type === "success" ? "Success" : type === "error" ? "Warning" : "Notice"}
          </h3>
        </div>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex gap-3">
          {showConfirm ? (
            <>
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
              >
                {cancelLabel}
              </button>
              <button
                onClick={() => {
                  if (onConfirm) onConfirm();
                }}
                className="flex-1 px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                {confirmLabel}
              </button>
            </>
          ) : (
            <button
              onClick={onClose}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              OK
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PopupAlert;
