const state = {
    menu: [],
    cart: JSON.parse(localStorage.getItem("food-order-cart") || "{}"),
    category: "All",
};

const menuGrid = document.getElementById("menu-grid");
const categoryFilters = document.getElementById("category-filters");
const searchInput = document.getElementById("search-input");
const cartItems = document.getElementById("cart-items");
const cartTotal = document.getElementById("cart-total");
const cartCount = document.getElementById("cart-count");
const orderForm = document.getElementById("order-form");
const orderMessage = document.getElementById("order-message");
const menuError = document.getElementById("menu-error");

document.addEventListener("DOMContentLoaded", loadMenu);
searchInput.addEventListener("input", renderMenu);
orderForm.addEventListener("submit", submitOrder);

async function loadMenu() {
    try {
        const response = await fetch("api.php?action=menu");
        const result = await response.json();
        if (!response.ok || !result.success) {
            throw new Error(result.error || "The menu could not be loaded.");
        }
        state.menu = result.items;
        renderFilters();
        renderMenu();
        renderCart();
    } catch (error) {
        menuGrid.innerHTML = "";
        menuError.textContent = `${error.message} Make sure Apache and MySQL are running.`;
        menuError.classList.remove("hidden");
    }
}

function renderFilters() {
    const categories = ["All", ...new Set(state.menu.map((item) => item.category))];
    categoryFilters.innerHTML = categories.map((category) => `
        <button class="filter ${category === state.category ? "active" : ""}"
                type="button" data-category="${escapeHtml(category)}">
            ${escapeHtml(category)}
        </button>
    `).join("");

    categoryFilters.querySelectorAll(".filter").forEach((button) => {
        button.addEventListener("click", () => {
            state.category = button.dataset.category;
            renderFilters();
            renderMenu();
        });
    });
}

function renderMenu() {
    const search = searchInput.value.trim().toLowerCase();
    const visibleItems = state.menu.filter((item) => {
        const matchesCategory = state.category === "All" || item.category === state.category;
        const matchesSearch = `${item.name} ${item.description} ${item.category}`
            .toLowerCase()
            .includes(search);
        return matchesCategory && matchesSearch;
    });

    if (visibleItems.length === 0) {
        menuGrid.innerHTML = '<p class="empty-state">No dishes match your search.</p>';
        return;
    }

    menuGrid.innerHTML = visibleItems.map((item, index) => `
        <article class="food-card">
            <div class="food-art" style="--card-color: ${artColor(index)}">${artLetter(item.name)}</div>
            <div class="food-content">
                <h3>${escapeHtml(item.name)}</h3>
                <p class="food-description">${escapeHtml(item.description)}</p>
                <div class="food-bottom">
                    <span class="price">${formatMoney(item.price)}</span>
                    <button class="add-button" type="button" data-add="${item.id}">Add to cart</button>
                </div>
            </div>
        </article>
    `).join("");

    menuGrid.querySelectorAll("[data-add]").forEach((button) => {
        button.addEventListener("click", () => addToCart(Number(button.dataset.add)));
    });
}

function addToCart(id) {
    state.cart[id] = (state.cart[id] || 0) + 1;
    saveCart();
    renderCart();
    document.getElementById("cart").scrollIntoView({ behavior: "smooth", block: "start" });
}

function changeQuantity(id, change) {
    state.cart[id] = (state.cart[id] || 0) + change;
    if (state.cart[id] <= 0) {
        delete state.cart[id];
    }
    saveCart();
    renderCart();
}

function renderCart() {
    const cartEntries = Object.entries(state.cart)
        .map(([id, quantity]) => ({
            item: state.menu.find((menuItem) => menuItem.id === Number(id)),
            quantity,
        }))
        .filter((entry) => entry.item);

    if (cartEntries.length === 0) {
        cartItems.innerHTML = '<p class="empty-state">Your cart is empty. Add something delicious from the menu.</p>';
    } else {
        cartItems.innerHTML = cartEntries.map(({ item, quantity }) => `
            <div class="cart-row">
                <div>
                    <strong>${escapeHtml(item.name)}</strong>
                    <small>${formatMoney(item.price)} each</small>
                </div>
                <div class="quantity">
                    <button type="button" aria-label="Decrease ${escapeHtml(item.name)} quantity" data-change="${item.id}" data-amount="-1">−</button>
                    <span>${quantity}</span>
                    <button type="button" aria-label="Increase ${escapeHtml(item.name)} quantity" data-change="${item.id}" data-amount="1">+</button>
                </div>
                <strong>${formatMoney(Number(item.price) * quantity)}</strong>
            </div>
        `).join("");

        cartItems.querySelectorAll("[data-change]").forEach((button) => {
            button.addEventListener("click", () => {
                changeQuantity(Number(button.dataset.change), Number(button.dataset.amount));
            });
        });
    }

    const totalQuantity = cartEntries.reduce((sum, entry) => sum + entry.quantity, 0);
    const total = cartEntries.reduce((sum, entry) => sum + Number(entry.item.price) * entry.quantity, 0);
    cartCount.textContent = totalQuantity;
    cartTotal.textContent = formatMoney(total);
}

async function submitOrder(event) {
    event.preventDefault();
    const items = Object.entries(state.cart).map(([menu_item_id, quantity]) => ({
        menu_item_id: Number(menu_item_id),
        quantity,
    }));

    if (items.length === 0) {
        showOrderMessage("Add at least one item before placing your order.", "error");
        return;
    }

    const payload = {
        customer_name: document.getElementById("customer-name").value.trim(),
        customer_phone: document.getElementById("customer-phone").value.trim(),
        delivery_address: document.getElementById("delivery-address").value.trim(),
        items,
    };

    try {
        const response = await fetch("api.php?action=order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        const result = await response.json();
        if (!response.ok || !result.success) {
            throw new Error(result.error || "The order could not be placed.");
        }

        showOrderMessage(`Order #${result.order_id} placed successfully. Total: ${formatMoney(result.total)}`, "success");
        state.cart = {};
        saveCart();
        renderCart();
        orderForm.reset();
    } catch (error) {
        showOrderMessage(error.message, "error");
    }
}

function showOrderMessage(message, type) {
    orderMessage.textContent = message;
    orderMessage.className = `message ${type}`;
}

function saveCart() {
    localStorage.setItem("food-order-cart", JSON.stringify(state.cart));
}

function formatMoney(value) {
    return `₹${Number(value).toFixed(2)}`;
}

function artLetter(name) {
    return escapeHtml(name.charAt(0));
}

function artColor(index) {
    return ["#df9950", "#da7256", "#7c9c78", "#8b6f9a", "#d58645"][index % 5];
}

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}