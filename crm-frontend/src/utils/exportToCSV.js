export const exportLeadsToCSV = (data) => {
  if (!data || data.length === 0) {
    alert("Export karne ke liye koi data nahi hai!");
    return;
  }

  const headers = [
    "Name",
    "Email",
    "Phone",
    "Company",
    "Status",
    "Assigned To",
    "Created Date",
  ];

  const rows = data.map((item) => [
    `"${item.name || ""}"`,
    `"${item.email || ""}"`,
    `"${item.phone || ""}"`,
    `"${item.company || "N/A"}"`,
    `"${item.status || "New"}"`,
    `"${item.assignedTo?.name || "Unassigned"}"`,
    `"${item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "N/A"}"`,
  ]);

  const csvContent =
    "data:text/csv;charset=utf-8," +
    [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute(
    "download",
    `CRM_Customers_Report_${new Date().toISOString().slice(0, 10)}.csv`,
  );

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
