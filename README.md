# Simple HTML + MySQL Food Ordering Project

This is a beginner-friendly food ordering website built with:

- HTML for the page structure
- CSS for the design
- JavaScript for search, cart, and checkout interactions
- PHP as the small bridge between the website and MySQL
- MySQL for menu items and customer orders

HTML cannot connect directly to MySQL from a browser. The small `api.php` file
handles that database connection safely.

## Files to explain

- `index.html` — website layout, menu area, cart, and delivery form.
- `style.css` — colors, spacing, responsive layout, and visual design.
- `script.js` — loads menu data, searches dishes, manages the cart, and submits orders.
- `config.php` — MySQL connection settings.
- `api.php` — returns menu items and saves submitted orders.
- `db.sql` — creates the database, tables, and sample Indian menu items.

## Run with XAMPP

1. Install XAMPP.
2. Start **Apache** and **MySQL** from the XAMPP Control Panel.
3. Copy this folder into XAMPP's `htdocs` folder:

   ```text
   C:\xampp\htdocs\html-mysql-food-ordering
   ```

4. Open `http://localhost/phpmyadmin`.
5. Select the **Import** tab and import `db.sql`.
6. Open the website:

   ```text
   http://localhost/html-mysql-food-ordering/
   ```

The default XAMPP MySQL settings are already supported:

```text
Host: 127.0.0.1
Port: 3306
Database: food_ordering
Username: root
Password: empty
```

If your MySQL password is not empty, edit the values in `config.php`.

## Run with PHP's local server

If PHP and MySQL are installed separately:

```bash
cd html-mysql-food-ordering
php -S localhost:8000
```

Then open `http://localhost:8000` in your browser. MySQL must still be running.