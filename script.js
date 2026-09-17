// --- 1. CONNECT TO SUPABASE ---
const SUPABASE_URL = 'https://phzcdsftwmjjzmtyeqps.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBoemNkc2Z0d21qanptdHllcXBzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk2NjQ2NjgsImV4cCI6MjEwNTI0MDY2OH0.Oz4uYKQSOYitRe8yu27za_Zziif9xLgeTHd0hkpG6eM';

const { createClient } = supabase;
const _supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let currentCart = [];

document.addEventListener('DOMContentLoaded', () => {
    loadMenu();
});

// Load food items from Supabase
async function loadMenu() {
    const menuContainer = document.getElementById('menu-container');
    
    const { data: food_items, error } = await _supabase.from('food_items').select('*');

    if (error) {
        console.error('Error loading menu:', error);
        menuContainer.innerHTML = '<p style="color: red;">Failed to load menu items.</p>';
        return;
    }

    if (!food_items || food_items.length === 0) {
        menuContainer.innerHTML = '<p>No food items available right now.</p>';
        return;
    }

    menuContainer.innerHTML = '';
    food_items.forEach(item => {
        menuContainer.innerHTML += `
            <div class="food-item">
                <div>
                    <h3>${item.name}</h3>
                    <p>${item.description || 'Freshly prepared and delicious.'}</p>
                </div>
                <div>
                    <div class="price">₹${item.price}</div>
                    <button onclick="addToCart('${item.name}', ${item.price})">+ Add to Cart</button>
                </div>
            </div>
        `;
    });
}

// Add to Cart
function addToCart(name, price) {
    currentCart.push({ name, price });
    updateCartUI();
}

// Update Cart Display
function updateCartUI() {
    const cartCount = document.getElementById('cart-count');
    const cartSummary = document.getElementById('cart-summary');
    
    cartCount.innerText = currentCart.length;

    if (currentCart.length === 0) {
        cartSummary.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
        return;
    }

    let html = '';
    let total = 0;
    
    currentCart.forEach(item => {
        total += item.price;
        html += `<div class="cart-item-row"><span>${item.name}</span> <strong>₹${item.price}</strong></div>`;
    });

    html += `<div style="margin-top: 10px; border-top: 1px dashed #dfe4ea; padding-top: 8px; display: flex; justify-content: space-between;"><strong>Total:</strong> <strong style="color: #ff4757;">₹${total}</strong></div>`;
    
    cartSummary.innerHTML = html;
}

// Place Order
async function placeOrder() {
    const name = document.getElementById('customer-name').value.trim();
    const address = document.getElementById('customer-address').value.trim();
    const phone = document.getElementById('customer-phone').value.trim();

    if (!name || !address || !phone) {
        alert('Please fill in all details (Name, Address, and Phone Number).');
        return;
    }

    if (currentCart.length === 0) {
        alert('Your cart is empty! Add some food items first.');
        return;
    }

    const totalPrice = currentCart.reduce((sum, item) => sum + item.price, 0);

    const { error } = await _supabase.from('orders').insert([
        {
            customer_name: `${name} (Phone: ${phone})`,
            address: address,
            items: currentCart,
            total_price: totalPrice
        }
    ]);

    if (error) {
        console.error('Error placing order:', error);
        alert('Something went wrong. Please try again.');
    } else {
        alert('🎉 Order Placed Successfully! Your food will be delivered soon.');
        currentCart = [];
        document.getElementById('customer-name').value = '';
        document.getElementById('customer-address').value = '';
        document.getElementById('customer-phone').value = '';
        updateCartUI();
    }
}
