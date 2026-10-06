function checkGameStock() {
    console.log("Stock Watcher: comprobando stock de GAME...");

    const isVisible = (elem) => {
        if (!elem) return false;
        const style = window.getComputedStyle(elem);
        return style.display !== "none" && 
               style.visibility !== "hidden" && 
               style.opacity !== "0" && 
               (elem.offsetWidth > 0 || elem.offsetHeight > 0);
    };

    const buyButton = document.querySelector("#btnNEW, .btn-buy, .buy-button, .btn-primary-add, .buy--btn");
    
    const productPageLoaded = document.querySelector("#btnNotify, .product-cover, .buy-actions");

    // Si hay botón de compra y es visible
    if (buyButton && isVisible(buyButton)) {
        return { status: "IN_STOCK", message: "Disponible en GAME" };
    }

    // Si la página carga pero NO existe el botón de compra
    if (productPageLoaded) {
        return { status: "OUT_OF_STOCK", message: "Agotado en GAME" };
    }

    return { status: "UNKNOWN", message: "No se pudo determinar el stock" };
}

setTimeout(() => {
    const result = checkGameStock();
    console.log("GAME Stock Result:", result);

    if (chrome.runtime && chrome.runtime.id) {
        chrome.runtime.sendMessage({
            type: "STOCK_RESULT",
            result: result
        }).catch(err => console.warn(err));
    }
}, 2500);