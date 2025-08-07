document.addEventListener("DOMContentLoaded", () => {
  let sales = JSON.parse(localStorage.getItem("sales")) || [];

  const cashBody = document.querySelector("#cashTable tbody");
  const creditBody = document.querySelector("#creditTable tbody");

  function saveSales(updatedSales) {
    localStorage.setItem("sales", JSON.stringify(updatedSales));
  }

  window.renderTables = function () {
    cashBody.innerHTML = "";
    creditBody.innerHTML = "";

    const searchName = document.getElementById("searchName").value.toLowerCase();
    const startDate = document.getElementById("startDate").value;
    const endDate = document.getElementById("endDate").value;

    let cashTotal = 0;
    let creditTotal = 0;

    sales.forEach((sale, index) => {
      const matchesName = !searchName || (sale.employee && sale.employee.toLowerCase().includes(searchName));
      const matchesStart = !startDate || new Date(sale.date) >= new Date(startDate);
      const matchesEnd = !endDate || new Date(sale.date) <= new Date(endDate);

      if (!matchesName || !matchesStart || !matchesEnd) return;

      const row = document.createElement("tr");
      const itemList = sale.items.map(item => `${item.name} x${item.quantity}`).join("<br>");

      if (sale.type === "cash") {
        cashTotal += sale.total;
        row.innerHTML = `
          <td>${sale.date}</td>
          <td>${itemList}</td>
          <td>₱${sale.total.toFixed(2)}</td>
          <td>₱${sale.cash.toFixed(2)}</td>
          <td>₱${sale.change.toFixed(2)}</td>
        `;
        cashBody.appendChild(row);
      }

  if (sale.type === "credit") {
  creditTotal += sale.total;
  row.innerHTML = `
    <td>${sale.date}</td>
    <td>${sale.employee || "N/A"}</td>
    <td>${itemList}</td>
    <td>₱${sale.total.toFixed(2)}</td>
    <td>${sale.status || "unpaid"}</td>
    <td>
      ${sale.status === "paid"
        ? `<span style="color:limegreen;">✔ Paid</span>`
        : `<button onclick="markAsPaid(${index})">Mark as Paid</button>`}
      <br>
      <button onclick="printSingleCredit(${index})">🖨️ Receipt</button>
    </td>
  `;

        creditBody.appendChild(row);
      }
    });

    document.getElementById("cashTotal").textContent = `₱${cashTotal.toFixed(2)}`;
    document.getElementById("creditTotal").textContent = `₱${creditTotal.toFixed(2)}`;
  };

  window.markAsPaid = function (index) {
    sales[index].status = "paid";
    saveSales(sales);
    renderTables();
  };

  window.exportTableToExcel = function (tableID, filename = "") {
    const table = document.getElementById(tableID);
    const workbook = XLSX.utils.table_to_book(table, { sheet: "Sheet1" });
    XLSX.writeFile(workbook, filename + ".xlsx");
  };

  window.printTable = function (tableID) {
    const table = document.getElementById(tableID).outerHTML;
    const win = window.open("", "", "height=700,width=900");
    win.document.write("<html><head><title>Print Table</title>");
    win.document.write("<style>table { width: 100%; border-collapse: collapse; } th, td { border: 1px solid #000; padding: 8px; }</style>");
    win.document.write("</head><body>");
    win.document.write("<h2>Sales Table</h2>");
    win.document.write(table);
    win.document.write("</body></html>");
    win.document.close();
    win.print();
  };

  renderTables();
});
// (your existing code remains unchanged above...)

function clearSales() {
  if (confirm("Are you sure you want to delete all sales?")) {
    localStorage.removeItem("sales");
    location.reload();
  }
}

function exportToExcel() {
  const sales = JSON.parse(localStorage.getItem("sales")) || [];
  const exportData = sales.map(sale => ({
    Date: sale.date,
    Type: sale.type,
    Customer: sale.employee || "-",
    Items: sale.items.map(i => `${i.name} x${i.quantity}`).join(", "),
    Total: sale.total,
    Cash: sale.cash || "-",
    Change: sale.change || "-",
    Status: sale.status || "-"
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "All Sales");

  XLSX.writeFile(workbook, "all_sales_report.xlsx");
}

// ✅ ✅ ✅ NEW: Print Credit Receipts (Receipt Style)
function printSingleCredit(index) {
  const sale = JSON.parse(localStorage.getItem("sales"))[index];
  if (!sale || sale.type !== "credit") return;

  const printWindow = window.open("", "_blank", "width=300,height=600");
  const itemList = sale.items.map(
    item => `<tr><td>${item.name}</td><td>x${item.quantity}</td></tr>`
  ).join("");

  printWindow.document.write(`
    <html>
    <head>
      <title>Receipt</title>
     <style>
  body {
    font-family: monospace;
    font-size: 14px;
    padding: 20px;
    width: 100%;
    max-width: 600px;
    margin: auto;
  }
        h2, h3 {
          text-align: center;
          margin: 0;
        }
        table {
          width: 100%;
          margin-top: 10px;
        }
        td {
          padding: 2px 0;
        }
        .total {
          text-align: right;
          margin-top: 10px;
          font-weight: bold;
        }
        .status {
          text-align: center;
          margin-top: 5px;
          font-style: italic;
        }
      </style>
    </head>
    <body>
      <h2>🧾 Mini Snack Store</h2>
      <h3>${sale.date}</h3>
      <hr>
      <p><strong>Employee:</strong> ${sale.employee || "N/A"}</p>
      <table>${itemList}</table>
      <p class="total">Total: ₱${sale.total.toFixed(2)}</p>
      <p class="status">Status: ${sale.status === "paid" ? "✔ Paid" : "❌ Unpaid"}</p>
      <hr>
      <p style="text-align:center;">Thank you!</p>
      <script>setTimeout(() => window.print(), 500);</script>
    </body>
    </html>
  `);
  printWindow.document.close();
}


function printAllCreditReceipts() {
  const sales = JSON.parse(localStorage.getItem("sales")) || [];
  const unpaidCredits = sales.filter(sale => sale.type === "credit" && sale.status !== "paid");

  const receiptHTML = unpaidCredits.map(sale => {
    const items = sale.items.map(i => `<div>${i.name} x${i.quantity}</div>`).join("");
    return `
      <div class="receipt-box">
        <h4>Mini Snack Store</h4>
        <div><strong>Date:</strong> ${sale.date}</div>
        <div><strong>Customer:</strong> ${sale.employee || "-"}</div>
        <div><strong>Items:</strong></div>
        ${items}
        <div><strong>Total:</strong> ₱${sale.total.toFixed(2)}</div>
        <div><strong>Status:</strong> ${sale.status}</div>
      </div>
    `;
  }).join("");

  const win = window.open("", "", "width=1000,height=1200");
  win.document.write(`
    <html>
      <head>
        <title>Credit Receipts</title>
        <style>
          @media print {
            body {
              margin: 0;
              padding: 0;
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              grid-gap: 0;
            }
            .receipt-box {
              border: 1px dashed #000;
              box-sizing: border-box;
              height: 280px;
              padding: 10px;
              font-size: 12px;
              page-break-inside: avoid;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
            }
          }

          body {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            grid-gap: 10px;
            padding: 20px;
            font-family: monospace;
          }
          .receipt-box {
            border: 1px dashed #000;
            padding: 10px;
            height: 280px;
            box-sizing: border-box;
            font-size: 12px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
          }
        </style>
      </head>
      <body>
        ${receiptHTML}
      </body>
    </html>
  `);
  win.document.close();
  win.focus();
  win.print();
}


