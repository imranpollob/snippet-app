"use client";

import React, { useEffect } from "react";

const Modal = ({ show, onClose, children }) => {
  useEffect(() => {
    if (!show) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [show, onClose]);

  if (!show) {
    return null;
  }

  const handleBackdropClick = () => {
    onClose();
  };

  return (
    <div className="modal" role="dialog" aria-modal="true" onClick={handleBackdropClick}>
      <div className="modal-content" onClick={(event) => event.stopPropagation()}>
        <button
          type="button"
          className="modal-close"
          aria-label="Close dialog"
          onClick={onClose}
        >
          X
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;
