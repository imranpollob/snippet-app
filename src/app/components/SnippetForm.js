"use client";

import React, { useCallback, useRef, useState } from "react";

const SnippetForm = ({ addSnippet, isSaving = false }) => {
  const [title, setTitle] = useState("");
  const [data, setData] = useState("");
  const textareaRef = useRef(null);

  const resetForm = useCallback(() => {
    setTitle("");
    setData("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "";
    }
  }, []);

  const handleResize = useCallback(() => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = "auto";
    textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
  }, []);

  const submitSnippet = useCallback(async () => {
    if (isSaving) {
      return;
    }

    const trimmedTitle = title.trim();
    const trimmedData = data.trim();

    if (!trimmedTitle && !trimmedData) {
      return;
    }

    await addSnippet({ title: trimmedTitle, data: trimmedData });
    resetForm();
  }, [title, data, addSnippet, resetForm, isSaving]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    await submitSnippet();
  };

  const handleShortcut = async (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
      event.preventDefault();
      await submitSnippet();
    }
  };

  const isDisabled = isSaving || (!title.trim() && !data.trim());

  return (
    <section className="composer-card" aria-labelledby="composer-title">
      <div className="composer-card-head">
        <h2 id="composer-title" className="composer-card-title">
          Capture a new snippet
        </h2>
        <p className="composer-card-subtitle">
          Drop code, commands, or notes. Use Cmd/Ctrl + Enter to save instantly.
        </p>
      </div>

      <form className="composer-form" onSubmit={handleSubmit}>
        <label className="input-group">
          <span className="input-label">Title</span>
          <input
            className="text-input"
            type="text"
            placeholder="A short label for your snippet"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            onKeyDown={handleShortcut}
            autoFocus
            autoComplete="off"
          />
        </label>

        <label className="input-group">
          <span className="input-label">Snippet details</span>
          <textarea
            ref={textareaRef}
            className="text-area"
            rows={4}
            placeholder="Paste code or jot down a reusable idea"
            value={data}
            onChange={(event) => {
              setData(event.target.value);
              handleResize();
            }}
            onInput={handleResize}
            onKeyDown={handleShortcut}
          />
        </label>

        <div className="form-actions">
          <button
            type="submit"
            className="primary-action"
            disabled={isDisabled}
            aria-disabled={isDisabled}
          >
            {isSaving ? "Saving..." : "Save snippet"}
          </button>
        </div>
      </form>
    </section>
  );
};

export default SnippetForm;
