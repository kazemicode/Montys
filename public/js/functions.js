$(document).ready(function() {

    $(".loading-image").hide();

    $("button[name=search]").on("click", function() {

        var itemName = $("input[name=search-name]").val();
        var cat = $("select[name=search-category]").val();
        var minRange = $("select[name=search-min-price]").val();
        var maxRange = $("select[name=search-max-price]").val();

        if (itemName != "" || cat != "" || minRange != "" || maxRange != "") {

            $.ajax({
                method: "GET",
                url: "/products/search",
                data: {
                    itemName,
                    cat,
                    minRange,
                    maxRange
                },
                success: function(data) {
                    populateSearchResults(data);
                }
            });

        }

        else {

            $.ajax({
                method: "GET",
                url: "/products/searchAll",
                success: {
                    success: function(data) {
                        populateSearchResults(data);
                    }
                }
            });

        }

    });

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

    function populateSearchResults(results) {
        $("#result-table").html("<tr class='dark-content result-labels'><th class='item-icon'></th><th>Item Name</th><th>Category</th><th>Price</th></tr>");
        results.forEach(function(item) {
            $("#result-table").append(`<tr class='light-content cart-contents'><td class='item-icon'><a href='/products/${item.productId}'><img src="${item.imgURL}" alt="product-image"></a></td><td><a href="/products/${item.productId}">${item.name}</a></td><td>${item.category}</td><td>${item.price}</td></tr>`);
        });
    }
 
}); // doc ready