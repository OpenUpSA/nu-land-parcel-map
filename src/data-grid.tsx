import * as React from "react";
import { LicenseInfo } from "@mui/x-license-pro";
import "./table-view.scss";
import {
  DataGridPro,
  GridColDef,
  GridFooter,
  GridFooterContainer,
} from "@mui/x-data-grid-pro";
import geojson from "./data/complete.json";
import { Button } from "@mui/material";
import * as CSV from "csv-string";

LicenseInfo.setLicenseKey(process.env.MUIXPRO_LICENSE_KEY || "");

const urlSearch: URLSearchParams = new URLSearchParams(window.location.search);
const filterProperty: string = urlSearch.get("property") || "";
const selected: string[] = (urlSearch.get("selected") || "")
  .split(",")
  .map((s) => {
    return s === "NONE" ? "" : s;
  });

console.log({ filterProperty });
console.log({ selected });

//#TODO: Use config not hard-coded
const columns: GridColDef[] = [
  {
    field: "index",
    headerName: "#",
    filterable: false,
    sortable: false,
    editable: false,
    disableColumnMenu: true,
    width: 50,
    resizable: false,
    headerAlign: "center",
    cellClassName: "cell-index",
    headerClassName: "header-index",
    renderCell: (params: any) => {
      return <div>{params.api.getRowIndex(params.id) + 1}</div>;
    },
  },
  { field: "Erven Number", minWidth: 150, headerName: "Erven Number" },
  { field: "Name", minWidth: 300, headerName: "Name" },
  { field: "Value at 2015", minWidth: 250, headerName: "Value At 2015" },
  { field: "Value at 2018", minWidth: 250, headerName: "Value At 2018" },
  { field: "Suburb", minWidth: 200, headerName: "Suburb" },
  { field: "Owner type", minWidth: 300, headerName: "Owner type" },
  { field: "Owner", minWidth: 300, headerName: "Owner" },
  { field: "Size m2", minWidth: 200, headerName: "Size m2" },
  { field: "Zoning", minWidth: 800, headerName: "Zoning" },
];

const rows: string[] = geojson["features"]
  .filter((feature) => {
    try {
      return selected.includes(
        feature["properties"][filterProperty].trim().replace(/[\?\(\)]/g, "")
      );
    } catch {
      return "";
    }
  })
  .map((r) => r["properties"]);

const onDownload = () => {
  let csvArray = [];
  csvArray.push(Object.keys(rows[0]));

  rows.forEach((row) => {
    csvArray.push(Object.values(row));
  });

  const csv = CSV.stringify(csvArray);
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "nu-land-map.csv";
  a.click();
  URL.revokeObjectURL(url);
};

const CustomFooter = () => {
  return (
    <GridFooterContainer>
      {/* Add what you want here */}
      <Button onClick={onDownload}>Download as CSV</Button>
      <GridFooter
        sx={{
          border: "none", // To delete double border.
        }}
      />
    </GridFooterContainer>
  );
};

export function DataTable() {
  return (
    <div style={{ height: "100vh", width: "100%" }}>
      <DataGridPro
        getRowId={(row: any) => row["Name"] + row["Erven Number"]}
        rows={rows}
        columns={columns}
        pageSize={5000}
        rowsPerPageOptions={[5000]}
        initialState={{ pinnedColumns: { left: ["index"] } }}
        disableSelectionOnClick
        components={{ Footer: CustomFooter }}
      />
    </div>
  );
}
