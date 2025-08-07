document.addEventListener("DOMContentLoaded", () => {
  const productSelect = document.getElementById("productSelect");
  const quantityInput = document.getElementById("quantity");
  const posForm = document.getElementById("posForm");
  const cartTable = document.querySelector("#cartTable tbody");
  const totalSpan = document.getElementById("total");
  const cashInput = document.getElementById("cash");
  const checkoutBtn = document.getElementById("checkoutBtn");
  const changeSpan = document.getElementById("change");
  const paymentType = document.getElementById("paymentType");
  const employeeName = document.getElementById("employeeName");

  let products = JSON.parse(localStorage.getItem("products")) || [];
  let cart = [];
  let sales = JSON.parse(localStorage.getItem("sales")) || [];

  function populateProductDropdown() {
    productSelect.innerHTML = '<option value="">Select Product</option>';
    products.forEach((p, i) => {
      productSelect.innerHTML += `<option value="${i}">${p.name} (₱${p.price})</option>`;
    });
  }

  paymentType.addEventListener("change", () => {
    employeeName.style.display = paymentType.value === "credit" ? "inline-block" : "none";
  });

  function updateCartTable() {
    cartTable.innerHTML = "";
    let total = 0;

    cart.forEach((item, index) => {
      const itemTotal = item.quantity * item.price;
      total += itemTotal;

      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${item.name}</td>
        <td>${item.quantity}</td>
        <td>₱${item.price}</td>
        <td>₱${itemTotal.toFixed(2)}</td>
        <td><button onclick="removeFromCart(${index})">Remove</button></td>
      `;
      cartTable.appendChild(row);
    });

    totalSpan.textContent = total.toFixed(2);
  }

  window.removeFromCart = function(index) {
    cart.splice(index, 1);
    updateCartTable();
  };

  posForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const index = productSelect.value;
    const quantity = parseInt(quantityInput.value);
    if (index === "" || isNaN(quantity)) return;

    const selectedProduct = products[index];
    if (quantity > selectedProduct.stock) {
      Swal.fire({
        icon: 'error',
        title: 'Not enough stock!',
        text: `Available: ${selectedProduct.stock}`,
      });
      return;
    }

    const existing = cart.find(item => item.name === selectedProduct.name);
    if (existing) {
      if (existing.quantity + quantity > selectedProduct.stock) {
        Swal.fire({
          icon: 'error',
          title: 'Exceeds stock!',
          text: `Only ${selectedProduct.stock - existing.quantity} left.`,
        });
        return;
      }
      existing.quantity += quantity;
    } else {
      cart.push({
        name: selectedProduct.name,
        price: selectedProduct.price,
        quantity: quantity,
        productIndex: index
      });
    }

    updateCartTable();
    quantityInput.value = "";
  });

  checkoutBtn.addEventListener("click", () => {
    const total = parseFloat(totalSpan.textContent);
    const cash = parseFloat(cashInput.value);
    const type = paymentType.value;

    if (type === "cash") {
      if (isNaN(cash)) {
        Swal.fire({
          icon: 'warning',
          title: 'Enter Cash Received',
        });
        return;
      }
      if (cash < total) {
        Swal.fire({
          icon: 'error',
          title: 'Insufficient Cash',
          text: `Total: ₱${total.toFixed(2)}, Cash: ₱${cash.toFixed(2)}`
        });
        return;
      }
    }

    if (type === "credit" && employeeName.value.trim() === "") {
      Swal.fire({
        icon: 'warning',
        title: 'Employee Name Required',
        text: 'Please enter the employee name for credit purchase.'
      });
      return;
    }

    const change = type === "cash" ? (cash - total) : 0;
    changeSpan.textContent = change.toFixed(2);

    const saleRecord = {
      date: new Date().toLocaleString(),
      items: [...cart],
      total,
      cash: type === "cash" ? cash : 0,
      change,
      type,
      employee: type === "credit" ? employeeName.value : null,
      status: type === "credit" ? "unpaid" : "paid"
    };

    sales.push(saleRecord);
    localStorage.setItem("sales", JSON.stringify(sales));

    cart.forEach(item => {
      products[item.productIndex].stock -= item.quantity;
    });
    localStorage.setItem("products", JSON.stringify(products));

    cart = [];
    updateCartTable();
    cashInput.value = "";
    employeeName.value = "";
    changeSpan.textContent = "0";
    populateProductDropdown();

    Swal.fire({
      icon: 'success',
      title: type === "cash" ? 'Sale Completed!' : 'Credit Recorded',
      html: `
        <p>Total: ₱${total.toFixed(2)}</p>
        <p>${type === "cash" ? `Cash: ₱${cash.toFixed(2)}<br>Change: ₱${change.toFixed(2)}` : `Employee: ${employeeName.value}`}</p>
      `,
      confirmButtonText: 'OK'
    });
  });

  populateProductDropdown();
  updateCartTable();
});
