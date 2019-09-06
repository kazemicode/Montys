# Monty's Pontificating Firefly Bazaar
## Overview
Monty’s is a whimsical  e-commerce website that currently supports authenticated admin login using bcrypt. Once authenticated, the administrator has access to a dynamic form on the frontend that utilizes several API endpoints that expose actions to update, insert, and delete products from the products table in the ClearDB schema. In addition to this, the administrator is able to view a report that shows the total number of orders completed, the total amount of products sold, and the total revenue earned. These metrics are grouped by product category with rollup. 

In version 1.0, user account generation is not supported. Rather, guest shopping carts and checkouts are tracked using sessions through the express-sessions package. The front page uses an API endpoint that fetches three random products in order to display them to the user. The user can also search for products through a text field by name or through a populated dropdown by category.

Upon adding a product to the cart, a new record is added to the cart table with the session id, product id, (unit) price, quantity, and category. If the user views their cart, they are able to see the name of each product, the quantity of each product, and the unit price of each product. As a summary, they can see how many total products they are purchasing as well as the total cost. Users can also remove items from their cart, which removes the record from the cart table as well.

When a user checks out, all the records associated with the user’s session id are copied to the orders table and those records are purged from the cart table. The user is then shown a checkout success page confirming the transaction has been completed.

## API Documentation
### Products
`POST  /products/add`
Add product to the database. 

param | Description
------------ | -------------
category |Product category (Required)
name |Product name (Required)
description | Product description (Required)
price | Product price (Required)
imgURL | URL of product image (Required)


`POST /products/:productId/update`
Update product from product id.

param | Description
------------ | -------------
category | Product category (Optional)
name | Product name (Optional) 
description | Product description (Optional)
price | Product price (Optional)
imgURL | URL of product image (Optional)


`DELETE  /products/:productId/remove`
Delete product from table based on product id.

param | Description
------------ | -------------
productId | Product id (Required)

`GET  /products/:productId`
Retrieve product description, product price, product category, product name, URL of product’s image, and description of product’s image. 

param | Description
------------ | -------------
productId | Product id (Required)

`GET  /products/random`
Retrieve random three products

### Cart
`POST  /cart/:productId/add`
Add item to cart session.

param| Description
------------ | -------------
sessionId | Session id (Required)
productId | Product id (Required)
quantity | Quantity of product (Required)
category | Product category (Required)


`DELETE  /cart/:productId/remove`
Remove product from cart session.

param | Description
------------ | -------------
sessionId | Session id (Required)
productId | Product id (Required)


`GET  /cart`
Retrieve cart contents based on session id.

param | Description
------------ | -------------
sessionId | Session id (Required)

### Orders
`POST  /orders/:sessionId/add`
Add list of items associated with cart session id to order.

param | Description
------------ | -------------
sessionId | Session id (Required)

### Sales Report
`GET /report`
Retrieve breakdown of orders: total number of orders, total quantity of products ordered, total revenue -- grouped by product category with rollup.
