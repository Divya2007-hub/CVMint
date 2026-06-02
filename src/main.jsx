import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ResumeAILanding from "./ResumeAI";
import ResumeAIAuth from "./ResumeAI_Auth";
import Dashboard from "./Dashboard";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ResumeAILanding />} />
        <Route path="/auth" element={<ResumeAIAuth />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);