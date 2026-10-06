function checkMediamarktStock() {
    console.log("Stock Watcher: comprobando stock de MediaMarkt...");

    // Busca botón de compra en MediaMarkt
    const buyButton = document.querySelector(
        '[data-sctrack="add-to-basket-btn"], ' +
        '[data-test*="add-to-basket-button"], ' +
        '[data-test="mms-pdp-add-to-cart-button"]'
    );
    const outOfStockBadge = document.querySelector(
        '[data-product-online-status="NOT_IN_ASSORTMENT"]'
    );

    console.log("DEBUG MM -> buyButton:", buyButton, "Tipo:", typeof buyButton);
    console.log("DEBUG MM -> outOfStockBadge:", outOfStockBadge);

    if (outOfStockBadge || buyButton === null) {
        return { status: "OUT_OF_STOCK", message: "Agotado en MediaMarkt" };
    }

    if (buyButton) {
        return { status: "IN_STOCK", message: "Disponible en MediaMarkt" };
    }

    return { status: "UNKNOWN", message: "No se pudo determinar el stock" };
}

setTimeout(() => {
    const result = checkMediamarktStock();
    console.log("MediaMarkt Stock Result:", result);

    if (chrome.runtime && chrome.runtime.id) {
        chrome.runtime.sendMessage({
            type: "STOCK_RESULT",
            result: result
        }).catch(err => console.warn(err));
    }
}, 3000);