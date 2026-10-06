function checkCarrefourStock() {
    console.log("Stock Watcher: comprobando stock de Carrefour...");

    // Busca botón de compra en Carrefour
    const buyButton = document.querySelector(".add-to-cart-button__full-button , .add-to-cart-button__button");
    // const outOfStockBadge = document.querySelector(); // Carrefour cuando no hay stock simplemente borra toda la parte de compra

    /*if (outOfStockBadge) {
        return { status: "OUT_OF_STOCK", message: "Agotado en MediaMarkt" }; // Carrefour cuando no hay stock simplemente borra toda la parte de compra
    }*/

    if (buyButton) {
        return { status: "IN_STOCK", message: "Disponible en Carrefour" };
    } 
    
    else {
        return { status: "OUT_OF_STOCK", message: "Agotado en Carrefour" };
    }

    return { status: "UNKNOWN", message: "No se pudo determinar el stock" };
}

setTimeout(() => {
    const result = checkCarrefourStock();
    console.log("Carrefour Stock Result:", result);

    if (chrome.runtime && chrome.runtime.id) {
        chrome.runtime.sendMessage({
            type: "STOCK_RESULT",
            result: result
        }).catch(err => console.warn(err));
    }
}, 2000);