document.addEventListener("DOMContentLoaded", () => {
  const products = JSON.parse(localStorage.getItem("products")) || [];
  const sales = JSON.parse(localStorage.getItem("sales")) || [];

  // Total Products
  document.querySelector("#totalProducts p").textContent = products.length;

  // Total Sales
  document.querySelector("#totalSales p").textContent = sales.length;

  // Total Earnings
  const total = sales.reduce((sum, sale) => sum + sale.total, 0);
  document.querySelector("#totalEarnings p").textContent = "₱" + total.toFixed(2);
});
