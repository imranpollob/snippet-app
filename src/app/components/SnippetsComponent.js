"use client";

import React from "react";

const escapeRegExp = (value) =>
  String(value).replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");

const SnippetsComponent = ({ snippets, onCardClick, searchQuery }) => {
  const truncateText = (text, limit = 280) => {
    if (!text) {
      return "";
    }

    if (text.length <= limit) {
      return text;
    }

    return `${text.slice(0, limit - 1).trim()}...`;
  };

  const highlightMatch = (text, query) => {
    if (!query) {
      return text;
    }

    const safeQuery = escapeRegExp(query);
    const regex = new RegExp(`(${safeQuery})`, "gi");
    const parts = text.split(regex);

    return parts.map((part, index) =>
      index % 2 === 1 ? (
        <mark key={`${part}-${index}`} className="highlight">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div className="cards-grid" role="list">
      {snippets.map((snippet) => (
        <article
          key={snippet.id}
          className="snippet-card"
          role="listitem"
          tabIndex={0}
          onClick={() => onCardClick(snippet)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              onCardClick(snippet);
            }
          }}
        >
          <header className="snippet-card-header">
            <h3 className="snippet-card-title">
              {highlightMatch(snippet.title || "Untitled snippet", searchQuery)}
            </h3>
            <span className="snippet-card-cta" aria-hidden="true"></span>
          </header>
          <pre className="snippet-card-body">
            {highlightMatch(truncateText(snippet.data || "", 420), searchQuery)}
          </pre>
        </article>
      ))}
    </div>
  );
};

export default SnippetsComponent;
