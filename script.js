// Initialize data if not exists
        function initializeData() {
            if (!localStorage.getItem('users')) {
                const users = [
                    { id: "u1", username: "admin", password: "admin123", role: "admin", name: "Admin User" },
                    { id: "u2", username: "cashier", password: "cashier123", role: "cashier", name: "Cashier User" }
                ];
                localStorage.setItem('users', JSON.stringify(users));
            }
            
            if (!localStorage.getItem('products')) {
                const products = [
                    { id: "p1", name: "Wireless Headphones", category: "Electronics", price: 89.99, stock: 15 },
                    { id: "p2", name: "Smart Watch", category: "Electronics", price: 199.99, stock: 8 },
                    { id: "p3", name: "Cotton T-Shirt", category: "Clothing", price: 24.99, stock: 50 },
                    { id: "p4", name: "Coffee Maker", category: "Home & Kitchen", price: 59.99, stock: 12 },
                    { id: "p5", name: "JavaScript Book", category: "Books", price: 39.99, stock: 23 },
                    { id: "p6", name: "Bluetooth Speaker", category: "Electronics", price: 45.99, stock: 3 },
                    { id: "p7", name: "Desk Lamp", category: "Home & Kitchen", price: 29.99, stock: 18 }
                ];
                localStorage.setItem('products', JSON.stringify(products));
            }
            
            if (!localStorage.getItem('sales')) {
                localStorage.setItem('sales', JSON.stringify([]));
            }
            
            if (!localStorage.getItem('currentCart')) {
                localStorage.setItem('currentCart', JSON.stringify([]));
            }
        }
        
        // Show notification
        function showNotification(message, type) {
            const notification = document.getElementById('notification');
            notification.textContent = message;
            notification.className = `notification ${type} show`;
            
            setTimeout(() => {
                notification.classList.remove('show');
            }, 3000);
        }
        
        // Login functionality
        document.getElementById('login-btn').addEventListener('click', () => {
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            if (!username || !password) {
                showNotification('Please enter both username and password', 'error');
                document.querySelector('.auth-card').classList.add('shake');
                setTimeout(() => {
                    document.querySelector('.auth-card').classList.remove('shake');
                }, 500);
                return;
            }
            
            const users = JSON.parse(localStorage.getItem('users'));
            const user = users.find(u => u.username === username && u.password === password);
            
            if (user) {
                // Store current user
                localStorage.setItem('currentUser', JSON.stringify(user));
                
                // Animate login exit
                document.querySelector('.auth-card').classList.add('zoom-out');
                
                setTimeout(() => {
                    document.getElementById('login-screen').style.display = 'none';
                    document.getElementById('dashboard').style.display = 'block';
                    
                    // Update UI based on user role
                    updateUIForUser(user);
                    
                    // Load dashboard data
                    loadDashboardData();
                }, 500);
            } else {
                showNotification('Invalid username or password', 'error');
                document.querySelector('.auth-card').classList.add('shake');
                setTimeout(() => {
                    document.querySelector('.auth-card').classList.remove('shake');
                }, 500);
            }
        });
        
        // Update UI based on user role
        function updateUIForUser(user) {
            document.getElementById('user-name').textContent = user.name;
            document.getElementById('user-role').textContent = user.role === 'admin' ? 'Administrator' : 'Cashier';
            document.getElementById('user-avatar').textContent = user.name.charAt(0);
            
            // Hide admin-only tabs for cashier
            if (user.role === 'cashier') {
                const tabs = document.querySelectorAll('.tab-btn');
                tabs.forEach(tab => {
                    if (tab.dataset.tab !== 'dashboard-tab' && tab.dataset.tab !== 'pos-tab') {
                        tab.style.display = 'none';
                    }
                });
            }
        }
        
        // Load dashboard data
        function loadDashboardData() {
            const products = JSON.parse(localStorage.getItem('products')) || [];
            const sales = JSON.parse(localStorage.getItem('sales')) || [];
            
            // Calculate stats
            const totalSales = sales.reduce((sum, sale) => sum + sale.total, 0);
            const today = new Date().toISOString().split('T')[0];
            const todaySales = sales
                .filter(sale => sale.date.split('T')[0] === today)
                .reduce((sum, sale) => sum + sale.total, 0);
            
            const lowStockItems = products.filter(p => p.stock < 5).length;
            
            // Update dashboard stats
            document.getElementById('total-sales').textContent = `GH₵${totalSales.toFixed(2)}`;
            document.getElementById('today-sales').textContent = `GH₵${todaySales.toFixed(2)}`;
            document.getElementById('total-products').textContent = products.length;
            document.getElementById('low-stock').textContent = lowStockItems;
            
            // Load recent sales
            const recentSalesTable = document.querySelector('#recent-sales-table tbody');
            recentSalesTable.innerHTML = '';
            
            const recentSales = sales.slice(-5).reverse();
            recentSales.forEach(sale => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${sale.id}</td>
                    <td>${new Date(sale.date).toLocaleString()}</td>
                    <td>${sale.items.length} items</td>
                    <td>GH₵${sale.total.toFixed(2)}</td>
                    <td>${sale.paymentMethod}</td>
                `;
                recentSalesTable.appendChild(row);
            });
            
            // Load POS products
            loadPOSProducts();
            
            // Load products table
            loadProductsTable();
            
            // Load sales table
            loadSalesTable();
            
            // Load inventory
            loadInventory();
            
            // Load current cart
            loadCart();
        }
        
        // Load POS products
        function loadPOSProducts() {
            const productsGrid = document.getElementById('products-grid');
            productsGrid.innerHTML = '';
            
            const products = JSON.parse(localStorage.getItem('products')) || [];
            
            products.forEach(product => {
                let stockStatus = '';
                let statusClass = '';
                
                if (product.stock <= 0) {
                    stockStatus = 'Out of Stock';
                    statusClass = 'stock-out';
                } else if (product.stock < 5) {
                    stockStatus = 'Low Stock';
                    statusClass = 'stock-low';
                } else {
                    stockStatus = `${product.stock} in stock`;
                }
                
                const productCard = document.createElement('div');
                productCard.className = 'product-card';
                productCard.innerHTML = `
                    <div class="product-image">
                        <i class="fas fa-box"></i>
                    </div>
                    <div class="product-info">
                        <div class="product-name">${product.name}</div>
                        <div class="product-price">GH₵${product.price.toFixed(2)}</div>
                        <div class="product-stock ${statusClass}">${stockStatus}</div>
                    </div>
                `;
                
                if (product.stock > 0) {
                    productCard.addEventListener('click', () => addToCart(product));
                }
                
                productsGrid.appendChild(productCard);
            });
        }
        
        // Add to cart
        function addToCart(product) {
            const currentCart = JSON.parse(localStorage.getItem('currentCart')) || [];
            
            // Check if product already in cart
            const existingItem = currentCart.find(item => item.id === product.id);
            
            if (existingItem) {
                // Check stock
                if (existingItem.quantity < product.stock) {
                    existingItem.quantity++;
                } else {
                    showNotification('Not enough stock available', 'error');
                    return;
                }
            } else {
                if (product.stock > 0) {
                    currentCart.push({
                        id: product.id,
                        name: product.name,
                        price: product.price,
                        quantity: 1
                    });
                } else {
                    showNotification('Product is out of stock', 'error');
                    return;
                }
            }
            
            localStorage.setItem('currentCart', JSON.stringify(currentCart));
            loadCart();
            showNotification(`${product.name} added to cart`, 'success');
        }
        
        // Load cart
        function loadCart() {
            const cartItems = document.getElementById('cart-items');
            cartItems.innerHTML = '';
            
            const currentCart = JSON.parse(localStorage.getItem('currentCart')) || [];
            
            if (currentCart.length === 0) {
                cartItems.innerHTML = '<div style="text-align: center; padding: 20px; color: var(--text-secondary);">Cart is empty</div>';
                document.getElementById('cart-total').textContent = '$0.00';
                return;
            }
            
            let total = 0;
            
            currentCart.forEach(item => {
                const itemTotal = item.price * item.quantity;
                total += itemTotal;
                
                const cartItem = document.createElement('div');
                cartItem.className = 'cart-item';
                cartItem.innerHTML = `
                    <div class="cart-item-info">
                        <div class="cart-item-name">${item.name}</div>
                        <div class="cart-item-price">GH₵${item.price.toFixed(2)} × ${item.quantity}</div>
                    </div>
                    <div class="cart-item-total">GH₵${itemTotal.toFixed(2)}</div>
                `;
                
                cartItems.appendChild(cartItem);
            });

            document.getElementById('cart-total').textContent = `GH₵${total.toFixed(2)}`;
        }
        
        // Load products table
        function loadProductsTable() {
            const productsTable = document.querySelector('#products-table tbody');
            productsTable.innerHTML = '';
            
            const products = JSON.parse(localStorage.getItem('products')) || [];
            
            products.forEach(product => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${product.name}</td>
                    <td>${product.category}</td>
                    <td>GH₵${product.price.toFixed(2)}</td>
                    <td>${product.stock}</td>
                    <td>
                        <button class="btn btn-danger delete-product" data-id="${product.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                `;
                productsTable.appendChild(row);
            });
            
            // Add event listeners to delete buttons
            document.querySelectorAll('.delete-product').forEach(button => {
                button.addEventListener('click', (e) => {
                    const productId = e.target.closest('.delete-product').dataset.id;
                    deleteProduct(productId);
                });
            });
        }
        
        // Delete product
        function deleteProduct(productId) {
            const products = JSON.parse(localStorage.getItem('products')) || [];
            const updatedProducts = products.filter(p => p.id !== productId);
            
            localStorage.setItem('products', JSON.stringify(updatedProducts));
            loadProductsTable();
            loadPOSProducts();
            loadInventory();
            showNotification('Product deleted', 'success');
        }
        
        // Load sales table
        function loadSalesTable() {
            const salesTable = document.querySelector('#sales-table tbody');
            salesTable.innerHTML = '';
            
            const sales = JSON.parse(localStorage.getItem('sales')) || [];
            
            sales.reverse().forEach(sale => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${sale.id}</td>
                    <td>${new Date(sale.date).toLocaleString()}</td>
                    <td>${sale.items.length} items</td>
                    <td>GH₵${sale.total.toFixed(2)}</td>
                    <td>${sale.paymentMethod}</td>
                `;
                salesTable.appendChild(row);
            });
        }
        
        // Load inventory
        function loadInventory() {
            const inventoryTable = document.querySelector('#inventory-table tbody');
            inventoryTable.innerHTML = '';
            
            const products = JSON.parse(localStorage.getItem('products')) || [];
            
            // Update stats
            document.getElementById('total-items').textContent = products.length;
            document.getElementById('out-of-stock').textContent = products.filter(p => p.stock <= 0).length;
            document.getElementById('low-stock-count').textContent = products.filter(p => p.stock > 0 && p.stock < 5).length;
            
            products.forEach(product => {
                let status = '';
                let statusClass = '';
                
                if (product.stock <= 0) {
                    status = 'Out of Stock';
                    statusClass = 'stock-out';
                } else if (product.stock < 5) {
                    status = 'Low Stock';
                    statusClass = 'stock-low';
                } else {
                    status = 'In Stock';
                }
                
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${product.name}</td>
                    <td>${product.category}</td>
                    <td>${product.stock}</td>
                    <td class="${statusClass}">${status}</td>
                    <td>
                        <button class="btn btn-primary restock-product" data-id="${product.id}">
                            <i class="fas fa-plus"></i> Restock
                        </button>
                    </td>
                `;
                inventoryTable.appendChild(row);
            });
            
            // Add event listeners to restock buttons
            document.querySelectorAll('.restock-product').forEach(button => {
                button.addEventListener('click', (e) => {
                    const productId = e.target.closest('.restock-product').dataset.id;
                    const quantity = parseInt(prompt('Enter restock quantity:', '10'));
                    
                    if (quantity && quantity > 0) {
                        restockProduct(productId, quantity);
                    }
                });
            });
        }
        
        // Restock product
        function restockProduct(productId, quantity) {
            const products = JSON.parse(localStorage.getItem('products')) || [];
            const product = products.find(p => p.id === productId);
            
            if (product) {
                product.stock += quantity;
                localStorage.setItem('products', JSON.stringify(products));
                loadInventory();
                loadPOSProducts();
                showNotification(`${quantity} units added to ${product.name} stock`, 'success');
            }
        }
        
        // Tab navigation
        document.querySelectorAll('.tab-btn').forEach(tab => {
            tab.addEventListener('click', () => {
                // Remove active class from all tabs
                document.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
                
                // Add active class to clicked tab
                tab.classList.add('active');
                
                // Show corresponding section
                const sectionId = tab.dataset.tab;
                document.getElementById(sectionId).classList.add('active');
            });
        });
        
        // Add product
        document.getElementById('add-product').addEventListener('click', () => {
            const name = document.getElementById('product-name').value;
            const category = document.getElementById('product-category').value;
            const price = parseFloat(document.getElementById('product-price').value);
            const stock = parseInt(document.getElementById('product-stock').value);
            
            if (!name || !price || !stock) {
                showNotification('Please fill all fields', 'error');
                return; 0
            }
            
            const products = JSON.parse(localStorage.getItem('products')) || [];
            
            const newProduct = {
                id: 'p' + Date.now(),
                name,
                category,
                price,
                stock
            };
            
            products.push(newProduct);
            localStorage.setItem('products', JSON.stringify(products));
            
            // Clear form
            document.getElementById('product-name').value = '';
            document.getElementById('product-price').value = '';
            document.getElementById('product-stock').value = '';
            
            // Reload data
            loadProductsTable();
            loadPOSProducts();
            loadInventory();
            showNotification('Product added successfully', 'success');
        });
        
        // Payment method selection
        document.querySelectorAll('.payment-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.payment-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
        
        // Complete sale
        document.getElementById('complete-sale').addEventListener('click', () => {
            const currentCart = JSON.parse(localStorage.getItem('currentCart')) || [];
            const paymentBtn = document.querySelector('.payment-btn.active');
            
            if (currentCart.length === 0) {
                showNotification('Cart is empty', 'error');
                return;
            }
            
            if (!paymentBtn) {
                showNotification('Please select a payment method', 'error');
                return;
            }
            
            const paymentMethod = paymentBtn.dataset.method;
            const total = currentCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            
            // Create sale record
            const sales = JSON.parse(localStorage.getItem('sales')) || [];
            const newSale = {
                id: 'INV-' + Date.now(),
                date: new Date().toISOString(),
                items: currentCart,
                paymentMethod,
                total
            };
            
            sales.push(newSale);
            localStorage.setItem('sales', JSON.stringify(sales));
            
            // Update product stock
            const products = JSON.parse(localStorage.getItem('products')) || [];
            
            currentCart.forEach(cartItem => {
                const product = products.find(p => p.id === cartItem.id);
                if (product) {
                    product.stock -= cartItem.quantity;
                }
            });
            
            localStorage.setItem('products', JSON.stringify(products));
            
            // Clear cart
            localStorage.setItem('currentCart', JSON.stringify([]));
            
            // Reload data
            loadCart();
            loadPOSProducts();
            loadDashboardData();
            loadSalesTable();
            loadInventory();
            
            showNotification('Sale completed successfully!', 'success');
        });
        
        // Logout
        document.getElementById('logout-btn').addEventListener('click', () => {
            localStorage.removeItem('currentUser');
            document.getElementById('dashboard').style.display = 'none';
            document.getElementById('login-screen').style.display = 'flex';
            document.querySelector('.auth-card').classList.remove('zoom-out');
        });
        
        // Initialize the app
        initializeData();
        
        // Enter key for login
        document.getElementById('password').addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                document.getElementById('login-btn').click();
            }
        });