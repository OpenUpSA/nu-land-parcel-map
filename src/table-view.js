import ReactDOM from "react-dom/client";
import { DataTable } from "./data-grid";

const App = function() {
  return <DataTable></DataTable>;
}

const container = document.getElementById("root");
const root = ReactDOM.createRoot(container);
root.render(<App name="Saeloun blog" />);
