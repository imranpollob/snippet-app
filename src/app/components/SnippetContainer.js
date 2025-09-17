"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import GoogleAuthButton from "./GoogleAuthButton";
import SnippetForm from "./SnippetForm";
import SnippetsComponent from "./SnippetsComponent";
import Modal from "./Modal";
import { auth, db, onAuthStateChanged } from "../../../firebase";

import {
  collection,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
} from "firebase/firestore";

const AUTOSAVE_DELAY = 1000;

const SnippetContainer = () => {
  const [snippets, setSnippets] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentSnippet, setCurrentSnippet] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState(null);

  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      if (authUser) {
        setUser(authUser);
        fetchSnippets(authUser.uid);
      } else {
        setUser(null);
        setSnippets([]);
        setIsModalOpen(false);
        setCurrentSnippet(null);
        setSearchQuery("");
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchSnippets = async (uid) => {
    setIsLoading(true);
    try {
      const snippetsCol = collection(db, "snippets");
      const q = query(snippetsCol, where("uid", "==", uid));
      const snapshot = await getDocs(q);
      const snippetsList = snapshot.docs.map((snapshotDoc) => ({
        id: snapshotDoc.id,
        ...snapshotDoc.data(),
      }));
      setSnippets(snippetsList);
    } catch (error) {
      console.error("Error fetching snippets:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const addSnippet = async (newSnippet) => {
    if (!user) {
      return;
    }

    const title = newSnippet.title?.trim();
    const data = newSnippet.data?.trim();

    if (!title && !data) {
      return;
    }

    setIsSaving(true);
    try {
      const snippetWithUid = { ...newSnippet, title, data, uid: user.uid };
      const docRef = await addDoc(collection(db, "snippets"), snippetWithUid);
      const newSnippetWithId = { id: docRef.id, ...snippetWithUid };
      setSnippets((previous) => [newSnippetWithId, ...previous]);
    } catch (error) {
      console.error("Error adding new snippet:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const updateSnippet = async (snippetId, updatedData) => {
    const snippetRef = doc(db, "snippets", snippetId);
    try {
      await updateDoc(snippetRef, updatedData);
      setSnippets((previous) =>
        previous.map((snippet) =>
          snippet.id === snippetId ? { ...snippet, ...updatedData } : snippet
        )
      );
    } catch (error) {
      console.error("Error updating snippet:", error);
    }
  };

  const deleteSnippet = async (snippetId) => {
    const snippetRef = doc(db, "snippets", snippetId);
    try {
      await deleteDoc(snippetRef);
      setSnippets((previous) =>
        previous.filter((snippet) => snippet.id !== snippetId)
      );
      closeModal();
    } catch (error) {
      console.error("Error deleting snippet:", error);
    }
  };

  const openModal = (snippet) => {
    setCurrentSnippet(snippet);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentSnippet(null);
  };

  const handleUpdateSnippet = (snippetId, updates) => {
    setCurrentSnippet((previous) =>
      previous ? { ...previous, ...updates } : { id: snippetId, ...updates }
    );

    const payload = {};
    if (Object.prototype.hasOwnProperty.call(updates, "title")) {
      payload.title = updates.title;
    }
    if (Object.prototype.hasOwnProperty.call(updates, "data")) {
      payload.data = updates.data;
    }

    if (!Object.keys(payload).length) {
      return;
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      updateSnippet(snippetId, payload);
    }, AUTOSAVE_DELAY);
  };

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredSnippets = useMemo(() => {
    if (!normalizedQuery) {
      return snippets;
    }

    return snippets.filter((snippet) => {
      const title = (snippet.title || "").toLowerCase();
      const data = (snippet.data || "").toLowerCase();
      return title.includes(normalizedQuery) || data.includes(normalizedQuery);
    });
  }, [snippets, normalizedQuery]);

  const totalSnippets = snippets.length;
  const visibleSnippets = filteredSnippets.length;
  const hasSearch = Boolean(normalizedQuery);
  const showEmptyState = !isLoading && !isSaving && !totalSnippets;
  const showNoResultsState =
    !isLoading && !isSaving && totalSnippets && !visibleSnippets;
  const statusMessage = isLoading
    ? "Syncing your snippets..."
    : isSaving
    ? "Saving your snippet..."
    : null;

  return (
    <div className="page-shell">
      <header className="hero-card">
        <div className="hero-head">
          <div className="brand">
            <div className="brand-mark">&lt;/&gt;</div>
            <div className="brand-copy">
              <span className="hero-eyebrow">Snippet Studio</span>
              <span className="brand-title">Build once. Reuse forever.</span>
            </div>
          </div>
          <GoogleAuthButton />
        </div>

        <div className="hero-copy">
          <h1 className="hero-title">Your personal snippet command center</h1>
          <p className="hero-description">
            Collect your favorite code, configuration, and workflow snippets in a
            beautifully organized space that is always within reach.
          </p>
        </div>

        <div className="hero-actions">
          <label className="search-shell" htmlFor="snippet-search">
            <svg
              className="search-icon"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M15.5 14h-.79l-.28-.27a6.47 6.47 0 0 0 1.57-4.23A6.5 6.5 0 1 0 9.5 16a6.47 6.47 0 0 0 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5Zm-6 0a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9Z"
                fill="currentColor"
              />
            </svg>
            <input
              id="snippet-search"
              className="search-input"
              type="search"
              placeholder={
                user
                  ? "Search snippets by title or content"
                  : "Sign in to search your library"
              }
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              disabled={!user}
              aria-disabled={!user}
            />
          </label>

          <div className="hero-meta" aria-live="polite">
            <span className="metric-pill">
              <strong>{totalSnippets}</strong> total
            </span>
            <span className="metric-pill">
              <strong>{visibleSnippets}</strong> showing
            </span>
            {hasSearch ? (
              <span className="metric-pill">Filter: {searchQuery}</span>
            ) : null}
          </div>
        </div>
      </header>

      {user ? (
        <>
          <SnippetForm addSnippet={addSnippet} isSaving={isSaving} />

          <section className="cards-section" aria-live="polite">
            <div className="cards-header">
              <h2 className="cards-title">Library</h2>
              <span className="cards-count">
                {visibleSnippets} {visibleSnippets === 1 ? "snippet" : "snippets"}
                {hasSearch ? " match" : " saved"}
              </span>
            </div>

            {statusMessage ? (
              <div className="loading-state">
                <div className="loading-ring" aria-hidden="true" />
                <p>{statusMessage}</p>
              </div>
            ) : null}

            {!isLoading && showEmptyState ? (
              <div className="empty-state">
                <span className="empty-eyebrow">No snippets yet</span>
                <h3 className="empty-title">Let's capture your first idea</h3>
                <p className="empty-description">
                  Save frequently used commands, git aliases, or that clever
                  utility function you always copy from an old project.
                </p>
              </div>
            ) : null}

            {!isLoading && !showEmptyState && showNoResultsState ? (
              <div className="empty-state">
                <span className="empty-eyebrow">No matches</span>
                <h3 className="empty-title">Nothing fits that search</h3>
                <p className="empty-description">
                  Try a different keyword or clear the filter to see everything in
                  your library.
                </p>
              </div>
            ) : null}

            {!isLoading && !showEmptyState && !showNoResultsState ? (
              <SnippetsComponent
                snippets={filteredSnippets}
                onCardClick={openModal}
                searchQuery={searchQuery}
              />
            ) : null}
          </section>
        </>
      ) : (
        <section className="guest-card" aria-live="polite">
          <span className="guest-eyebrow">Welcome</span>
          <h2 className="guest-title">Sign in to unlock your snippets</h2>
          <p className="guest-description">
            Connect your Google account using the control above to start saving,
            searching, and editing your personal snippet library.
          </p>
        </section>
      )}

      <Modal show={isModalOpen} onClose={closeModal}>
        {currentSnippet ? (
          <div className="modal-editor">
            <div className="modal-editor-fields">
              <input
                className="modal-editor-title"
                type="text"
                value={currentSnippet.title || ""}
                onChange={(event) =>
                  handleUpdateSnippet(currentSnippet.id, {
                    ...currentSnippet,
                    title: event.target.value,
                  })
                }
              />
              <textarea
                className="modal-editor-body"
                value={currentSnippet.data || ""}
                onChange={(event) =>
                  handleUpdateSnippet(currentSnippet.id, {
                    ...currentSnippet,
                    data: event.target.value,
                  })
                }
              />
            </div>
            <div className="modal-editor-actions">
              <button
                className="danger-button"
                type="button"
                onClick={() => deleteSnippet(currentSnippet.id)}
              >
                Delete snippet
              </button>
              <button className="ghost-button" type="button" onClick={closeModal}>
                Close
              </button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
};

export default SnippetContainer;
