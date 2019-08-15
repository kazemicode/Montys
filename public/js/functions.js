$(document).ready(function() {

    $(".loading-image").hide();

    // Called when clicking on the "Add to cart" button (product page)
    // Sends the productId, quantity specified, and price to the server
    $(".add-to-cart").on("click", function() {

        // Get the product ID from the current URL
        var productId = window.location.pathname.split("/").pop();
        var price = $("#product-price b").text().split(" ").pop().replace('g', '');
        var quantity = $(".product-quantity").val();
        $(".loading-image").show();

        $.ajax({
            method: "POST",
            url: "/cart/add",
            data: {
                productId,
                price,
                quantity
            },
            success: function(success) {
                if (success) {
                    window.location.replace("/cart");
                    window.onload = function() {
                        $(".loading-image").hide();
                    }
                }
            },
            error: function(error) {
                alert("An unexpected error occured" + error);
                window.location.replace("/products/" + productId);
                window.onload = function() {
                    $(".loading-image").hide();
                }
            }  
            
        }); // ajax

    }); // add-to-cart

    $(".remove-cart-item").on("click", function() {
        
        var productId = $(this).val();

        $.ajax({
            method: "POST",
            url: "/cart/remove",
            data: {
                productId
            },
            success: function(success) {
                if (success) {
                    window.location.reload();
                }      
            }
        }); // ajax

    }); // remove-cart-item
  
  $(".admin-add-item").on("click", function() {
        
        $.ajax({
            method: "POST",
            url: "/products/add",
            data: {
                   name : $("#name").val(),
                   category : $("#category").val(),
                   description : $("#description").val(),
                   price : $("#price").val(), 
                   imgURL: $("#imgURL").val()
            },
            success: function(success) {
                if (success) {
                    window.location.reload();
                }      
            },
          error: function(error) {
                alert("An unexpected error occured" + error);
          }
        }); // ajax

    }); // admin-add-item
  
  $(".admin-remove-item").on("click", function() {
    
        var productId = $(this).val();
        $.ajax({
            type: "DELETE",
            url: "/products/remove",
            data: {
                   productId
            },
            success: function(success) {
                if (success) {
                    window.location.reload();
                }      
            },
          error: function(error) {
                alert("An unexpected error occured" + error);
          }
        }); // ajax

    }); // admin-remove-item
  
  $(".admin-update-item").on("click", function() {
        var productId = $(this).val();
        var name = getAttributeValue($(`.update-name-${productId}`).val(), $(`.update-name-${productId}`).attr("placeholder"));
        var category = getAttributeValue($(`.update-cat-${productId}`).val(), $(`.update-cat-${productId}`).attr("placeholder"));
        var description = getAttributeValue($(`.update-desc-${productId}`).val(), $(`.update-desc-${productId}`).attr("placeholder"));
        var price = getAttributeValue($(`.update-price-${productId}`).val(), $(`.update-price-${productId}`).attr("placeholder"));
        var imgURL = getAttributeValue($(`.update-image-${productId}`).val(), $(`.update-image-${productId}`).attr("placeholder"));
        console.log("imgURL: " + imgURL);

        $.ajax({
            method: "POST",
            url: "/products/update",
            data: {
                   name,
                   category,
                   description,
                   price, 
                   imgURL,
                   productId
            },
            success: function(success) {
                if (success) {
                    window.location.replace("/login");
                }      
            },
            error: function(error) {
                alert("An unexpected error occured" + error);
            }
        }); // ajax

    }); // admin-update-item

    function getAttributeValue(value, placeholder) {
        if (value == "")
            return placeholder;
        else
            return value;
    }
 
}); // doc ready