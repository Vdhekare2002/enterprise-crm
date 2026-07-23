export const exportLeadsToCSV = (leads) => {
  if (!leads || leads.length === 0) {
    alert("No leads available to export!");
    return;
  }

  // Headers define karein
  const headers = [
    "Name",
    "Email",
    "Phone",
    "Status",
    "Source",
    "Assigned To",
    "Created Date",
  ];

  // Rows format karein
  const rows = leads.map((lead) => [
    `"${lead.name || ""}"`,
    `"${lead.email || ""}"`,
    `"${lead.phone || ""}"`,
    `"${lead.status || "New"}"`,
    `"${lead.source || "Direct"}"`,
    `"${lead.assignedTo?.name || "Unassigned"}"`,
    `"${new Date(lead.createdAt).toLocaleDateString()}"`,
  ]);

  // Combine headers and rows
  const csvContent =
    "data:text/csv;charset=utf-8," +
    [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

  // File download trigger karein
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute(
    "download",
    `CRM_Leads_Report_${new Date().toISOString().slice(0, 10)}.csv`,
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
