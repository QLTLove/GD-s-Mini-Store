document.addEventListener("DOMContentLoaded", () => {
  const expenses = JSON.parse(localStorage.getItem("expenses")) || [];
  const expensesTable = document.querySelector("#expensesTable tbody");
  const totalExpensesEl = document.getElementById("totalExpenses");

  function renderExpenses() {
    expensesTable.innerHTML = "";
    let totalExpenses = 0;

    expenses.forEach((exp, index) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${exp.date}</td>
        <td>${exp.desc}</td>
        <td>₱${parseFloat(exp.amount).toFixed(2)}</td>
        <td><button class="delete-btn" data-index="${index}">🗑️ Delete</button></td>
      `;
      expensesTable.appendChild(row);
      totalExpenses += parseFloat(exp.amount);
    });

    totalExpensesEl.textContent = totalExpenses.toFixed(2);

    // Add delete event listeners
    document.querySelectorAll(".delete-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const index = parseInt(e.target.getAttribute("data-index"));
        Swal.fire({
  title: 'Are you sure?',
  text: "This will delete the expense permanently.",
  icon: 'warning',
  showCancelButton: true,
  confirmButtonColor: '#d33',
  cancelButtonColor: '#3085d6',
  confirmButtonText: 'Yes, delete it!'
}).then((result) => {
  if (result.isConfirmed) {
    expenses.splice(index, 1);
    localStorage.setItem("expenses", JSON.stringify(expenses));
    renderExpenses();
    displayMonthlyReport();
    Swal.fire({
      icon: 'success',
      title: 'Deleted!',
      text: 'Expense has been removed.',
      timer: 1500,
      showConfirmButton: false
    });
  }
});

      });
    });
  }

  document.getElementById("expenseForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const desc = document.getElementById("expenseDesc").value.trim();
    const amount = parseFloat(document.getElementById("expenseAmount").value);
    const date = document.getElementById("expenseDate").value;

if (!desc || !amount || !date) {
  Swal.fire({
    icon: 'error',
    title: 'Missing Fields',
    text: 'Please fill out all fields!',
    timer: 2000,
    showConfirmButton: false
  });
  return;
}
Swal.fire({
  icon: 'success',
  title: 'Expense Added',
  showConfirmButton: false,
  timer: 1500
});



    const newExpense = { desc, amount, date };
    expenses.push(newExpense);
    localStorage.setItem("expenses", JSON.stringify(expenses));
    renderExpenses();
    displayMonthlyReport();

    // Clear form
    e.target.reset();
  });

  renderExpenses();
  displayMonthlyReport();
});

function displayMonthlyReport() {
  const sales = JSON.parse(localStorage.getItem("sales")) || [];
  const expenses = JSON.parse(localStorage.getItem("expenses")) || [];

  const monthlySales = {};
  const monthlyExpenses = {};

  sales.forEach(sale => {
    const date = new Date(sale.date);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    if (!monthlySales[key]) monthlySales[key] = 0;
    monthlySales[key] += parseFloat(sale.total || 0);
  });

  expenses.forEach(exp => {
    const date = new Date(exp.date);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    if (!monthlyExpenses[key]) monthlyExpenses[key] = 0;
    monthlyExpenses[key] += parseFloat(exp.amount || 0);
  });

  const allMonths = new Set([...Object.keys(monthlySales), ...Object.keys(monthlyExpenses)]);
  const sortedMonths = [...allMonths].sort();

  const table = document.querySelector("#monthlyEarningsTable tbody");
  table.innerHTML = "";

  let runningNetIncome = 0;

  sortedMonths.forEach(month => {
    const salesTotal = monthlySales[month] || 0;
    const expenseTotal = monthlyExpenses[month] || 0;
    const netThisMonth = salesTotal - expenseTotal;
    runningNetIncome += netThisMonth;

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${month}</td>
      <td>₱${salesTotal.toFixed(2)}</td>
      <td>₱${expenseTotal.toFixed(2)}</td>
      <td>₱${netThisMonth.toFixed(2)}</td>
      <td><strong>₱${runningNetIncome.toFixed(2)}</strong></td>
    `;
    table.appendChild(row);
  });
}

function showNotification(message, type = "success") {
  const notif = document.getElementById("notification");
  notif.textContent = message;
  notif.className = `show ${type}`;
  setTimeout(() => {
    notif.className = "hidden";
  }, 3000);
}
