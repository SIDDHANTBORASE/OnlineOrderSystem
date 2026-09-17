// --- 1. CONNECT TO SUPABASE ---
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

const { createClient } = supabase;
const _supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- 2. LOAD MENU ON PAGE LOAD ---
document.addEventListener('DOMContentLoaded', () => {
    loadMenu();
});

async function loadMenu() {
    const menuContainer = document.getElementById('menu-container');
    menuContainer.innerHTML = '<p>Loading menu...</p>';

    const { data: food_items, error } = await _supabase.from('food_items').select('*');

    if (error) {
        console.error('Error loading menu:', error);
        menuContainer.innerHTML = '<p>Failed to load menu.</p>';
        return;
    }

    menuContainer.innerHTML = '';
    food_items.forEach(item => {
        menuContainer.innerHTML += `
            <div class="food-item">
                <h3>${item.name}</h3>
                <p>${item.description || ''}</p>
                <p><strong>$${item.price}</strong></p>
                <button onclick="addToCart('${item.name}', ${item.price})">Add to Order</button>
            </div>
        `;
    });
}

// Simple cart storage for demo
let currentCart = [];

function addToCart(name, price) {
    currentCart.push({ name, price });
    alert(name + ' added to your order!');
}

// --- 3. PLACE ORDER ---
async function placeOrder() {
    const name = document.getElementById('customer-name').value;
    const address = document.getElementById('customer-address').value;

    if (!name || !address) {
        alert('Please fill in your name and address.');
        return;
    }

    if (currentCart.length === 0) {
        alert('Your cart is empty!');
        return;
    }

    const totalPrice = currentCart.reduce((sum, item) => sum + item.price, 0);

    const { error } = await _supabase.from('orders').insert([
        {
            customer_name: name,
            address: address,
            items: currentCart,
            total_price: totalPrice
        }
    ]);

    if (error) {
        console.error('Error placing order:', error);
        alert('Error placing order. Try again.');
    } else {
        alert('Order placed successfully!');
        currentCart = [];
        document.getElementById('customer-name').value = '';
        document.getElementById('customer-address').value = '';
    }
}
