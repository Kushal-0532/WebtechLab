const products = [
    { id: 1, name: 'Laptop', price: 999.00, category: 'Electronics', stock: 10 },
    { id: 2, name: 'Headphones', price: 199.50, category: 'Electronics', stock: 15 },
    { id: 3, name: 'Coffee Maker', price: 89.99, category: 'Home', stock: 8 },
    { id: 4, name: 'Running Shoes', price: 120.00, category: 'Fashion', stock: 20 },
    { id: 5, name: 'Smart Watch', price: 250.00, category: 'Electronics', stock: 12 },
    { id: 6, name: 'Blender', price: 45.00, category: 'Home', stock: 5 },
    { id: 7, name: 'T-Shirt', price: 25.00, category: 'Fashion', stock: 50 },
    { id: 8, name: 'Book: JS Guide', price: 30.00, category: 'Books', stock: 100 }
];

let cart = [];
let appliedCoupon = null;

// DOM Elements
const productList = document.getElementById('product-list');
const cartItems = document.getElementById('cart-items');
const subtotalEl = document.getElementById('subtotal');
const discountEl = document.getElementById('discount-amount');
const totalEl = document.getElementById('total-price');
const couponInput = document.getElementById('coupon-code');
const couponMsg = document.getElementById('coupon-msg');

// Initialize
function init() {
    renderProducts();
    renderCart();
}

// Render Products
function renderProducts() {
    productList.innerHTML = products.map(product => `
        <div class="product-card">
            <div>
                <div class="category">${product.category}</div>
                <h3>${product.name}</h3>
                <div class="price">$${product.price.toFixed(2)}</div>
            </div>
            <button class="add-btn" onclick="addToCart(${product.id})">Add to Cart</button>
        </div>
    `).join('');
}

// Add Item to Cart
window.addToCart = function (id) {
    const product = products.find(p => p.id === id);
    const existingItem = cart.find(item => item.id === id);

    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    renderCart();
};

// Update Quantity
window.updateQuantity = function (id, change) {
    const itemIndex = cart.findIndex(item => item.id === id);
    if (itemIndex > -1) {
        cart[itemIndex].quantity += change;
        if (cart[itemIndex].quantity <= 0) {
            cart.splice(itemIndex, 1);
        }
    }
    renderCart();
};

// Apply Coupon
window.applyCoupon = function () {
    const code = couponInput.value.trim().toUpperCase();
    const currentHour = new Date().getHours();

    couponMsg.className = '';

    if (!code) {
        appliedCoupon = null;
        couponMsg.textContent = "Coupon removed.";
        renderCart();
        return;
    }

    // Validation Logic
    if (code === "WELCOME10") {
        appliedCoupon = { type: 'percent', value: 0.10, code: "WELCOME10" };
        couponMsg.textContent = "10% Welcome Discount Applied!";
        couponMsg.style.color = "green";
    } else if (code === "SAVE20" && (currentHour >= 12 && currentHour <= 14)) {
        // Time-based discount: Happy Hour 12PM-2PM
        appliedCoupon = { type: 'percent', value: 0.20, code: "SAVE20" };
        couponMsg.textContent = "Happy Hour! 20% Discount Applied!";
        couponMsg.style.color = "green";
    } else if (code === "SAVE20") {
        appliedCoupon = null;
        couponMsg.textContent = "Coupon valid only between 12 PM and 2 PM.";
        couponMsg.style.color = "red";
    } else if (code.startsWith("FLAT") && code.length > 4) {
        // Parse dynamic amount e.g., FLAT50 -> $50 off
        const amount = parseInt(code.substring(4));
        if (!isNaN(amount) && amount > 0) {
            appliedCoupon = { type: 'fixed', value: amount, code: code };
            couponMsg.textContent = `$${amount} Flat Discount Applied!`;
            couponMsg.style.color = "green";
        } else {
            couponMsg.textContent = "Invalid Flat Discount Code.";
            couponMsg.style.color = "red";
            appliedCoupon = null;
        }
    } else {
        appliedCoupon = null;
        couponMsg.textContent = "Invalid Coupon Code.";
        couponMsg.style.color = "red";
    }
    renderCart();
};

// Calculate and Render Cart
function renderCart() {
    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="empty-msg">Your cart is empty</p>';
        subtotalEl.textContent = '$0.00';
        discountEl.textContent = '-$0.00';
        totalEl.textContent = '$0.00';
        return;
    }

    let subtotal = 0;
    let totalDiscount = 0;

    // Render Items
    cartItems.innerHTML = cart.map(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;

        // Rule 1: Bulk Discount (Buy 5+ of same item get 10% off that item)
        if (item.quantity >= 5) {
            totalDiscount += itemTotal * 0.10;
        }

        // Rule 2: Category Discount (Electronics get extra 5% off)
        if (item.category === 'Electronics') {
            totalDiscount += itemTotal * 0.05;
        }

        return `
            <div class="cart-item">
                <div class="cart-item-info">
                    <strong>${item.name}</strong>
                    <div style="font-size:0.85em; color:#666;">$${item.price.toFixed(2)} x ${item.quantity}</div>
                </div>
                <div class="cart-controls">
                    <button class="qty-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                    <span>${item.quantity}</span>
                    <button class="qty-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                </div>
            </div>
        `;
    }).join('');

    // Rule 3: Apply Coupon Discount on remaining total
    let discountedSubtotal = subtotal - totalDiscount;
    let couponDiscountAmount = 0;

    if (appliedCoupon) {
        if (appliedCoupon.type === 'percent') {
            couponDiscountAmount = discountedSubtotal * appliedCoupon.value;
        } else if (appliedCoupon.type === 'fixed') {
            couponDiscountAmount = appliedCoupon.value;
        }
    }

    // Ensure total doesn't go negative
    totalDiscount += couponDiscountAmount;
    let finalTotal = subtotal - totalDiscount;
    if (finalTotal < 0) finalTotal = 0;

    // Update Totals Display
    subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
    discountEl.textContent = `-$${totalDiscount.toFixed(2)}`;
    totalEl.textContent = `$${finalTotal.toFixed(2)}`;
}

// Start app
init();