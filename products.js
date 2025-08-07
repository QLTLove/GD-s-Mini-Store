document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("productForm");
  const tableBody = document.querySelector("#productTable tbody");

  let products = JSON.parse(localStorage.getItem("products")) || [];

  function saveToLocalStorage() {
    localStorage.setItem("products", JSON.stringify(products));
  }

  function renderProducts() {
    tableBody.innerHTML = "";
    products.forEach((product, index) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${product.name}</td>
        <td>${product.category}</td>
        <td>₱${product.price}</td>
        <td>${product.stock}</td>
        <td>
          <button onclick="editProduct(${index})">✏️ Edit</button>
          <button onclick="deleteProduct(${index})">🗑️ Delete</button>
        </td>
      `;
      tableBody.appendChild(row);
    });
  }

  window.editProduct = function(index) {
    const product = products[index];
    document.getElementById("name").value = product.name;
    document.getElementById("category").value = product.category;
    document.getElementById("price").value = product.price;
    document.getElementById("stock").value = product.stock;

    products.splice(index, 1); // remove it temporarily
    renderProducts();
  };

  window.deleteProduct = function(index) {
    if (confirm("Delete this product?")) {
      products.splice(index, 1);
      saveToLocalStorage();
      renderProducts();
    }
  };

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const newProduct = {
      name: form.name.value,
      category: form.category.value,
      price: parseFloat(form.price.value),
      stock: parseInt(form.stock.value)
    };
    products.push(newProduct);
    saveToLocalStorage();
    renderProducts();
    form.reset();
  });

  renderProducts();
});
