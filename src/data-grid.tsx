import * as React from "react";
import { DataGridPro, GridColDef } from "@mui/x-data-grid-pro";
import geojson from "./data/complete.json";

const urlSearch: URLSearchParams = new URLSearchParams(window.location.search);
const filterProperty: string = urlSearch.get("property") || "";
const selected: string[] = (urlSearch.get("selected") || "")
  .split(",")
  .map((s) => {
    return s === "NONE" ? "" : s;
  });

//#TODO: Use config not hard-coded
const columns: GridColDef[] = [
  { field: "OBJECTID", maxWidth: 80, headerName: "ID" },
  { field: "Name", minWidth: 300, headerName: "Name" },
  { field: "GR2018", minWidth: 250, headerName: "Value" },
  { field: "OFC_SBRB_N", minWidth: 200, headerName: "Suburb" },
  { field: "OWNER_TYPE", minWidth: 300, headerName: "Owner type" },
  { field: "Owner", minWidth: 300, headerName: "Owner" },
  { field: "Size m2", minWidth: 200, headerName: "Size m2" },
  { field: "ZONING", minWidth: 800, headerName: "Zoning" },
];

const rows: string[] = geojson["features"]
  .filter((feature) => {
    return selected.includes(
      feature["properties"][filterProperty].trim().replace(/[\?\(\)]/g, "")
    );
  })
  .map((r) => r["properties"]);

export function DataTable() {
  return (
    <div style={{ height: "100vh", width: "100%" }}>
      <DataGridPro
        getRowId={(row: any) => row["OBJECTID"]}
        rows={rows}
        columns={columns}
        pageSize={5000}
        rowsPerPageOptions={[5000]}
      />
    </div>
  );
}