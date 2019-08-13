$(document).ready(function() {

    // Called when clicking on the "Add to cart" button (product page)
    // Sends the productId, quantity specified, and price to the server
    $(".add-to-cart").on("click", function() {

        // Get the product ID from the current URL
        var productId = window.location.pathname.split("/").pop();
        var price = $("#product-price b").text().split(" ").pop().replace('g', '');
        var quantity = $(".product-quantity").val();

        console.log(price);
        console.log(quantity);

        $.ajax({
            method: "POST",
            url: "/cart/add",
            data: {
                productId,
                price,
                quantity
            },
            success: function() {
                window.location.replace("cart.ejs");
            }
        });

    });

});