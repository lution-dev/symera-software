import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Set page title
document.title = "Symera - Plataforma de Organização de Eventos com IA";

createRoot(document.getElementById("root")!).render(<App />);
