import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ResumeAILanding from "./ResumeAI";
import ResumeAIAuth from "./ResumeAI_Auth";
import Dashboard from "./Dashboard";
import ErrorBoundary from "./ErrorBoundary";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={
            <ErrorBoundary>
              <ResumeAILanding />
            </ErrorBoundary>
          } />
          <Route path="/auth" element={
            <ErrorBoundary>
              <ResumeAIAuth />
            </ErrorBoundary>
          } />
          <Route path="/dashboard" element={
            <ErrorBoundary>
              <Dashboard />
            </ErrorBoundary>
          } />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>
);