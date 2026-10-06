function checkXtralifeStock() {
    console.log("Stock Watcher: comprobando stock de Xtralife...");

    // Busca botón de compra en Xtralife
    const buyButton = document.querySelector(".pre-order");
    const outOfStockBadge = document.querySelector(".sin-stock");

    // Comprueba que el texto en esos dos divs contenga "No disponible"
    if (outOfStockBadge) {
        return {
            status: "OUT_OF_STOCK",
            message: "Agotado en Xtralife.com"
        };
    }

    if (buyButton) {
        return { status: "IN_STOCK", message: "Disponible en Xtralife" };
    }

    return { status: "UNKNOWN", message: "No se pudo determinar el stock" };
}

setTimeout(() => {
    const result = checkXtralifeStock();
    console.log("Xtralife Stock Result:", result);

    if (chrome.runtime && chrome.runtime.id) {
        chrome.runtime.sendMessage({
            type: "STOCK_RESULT",
            result: result
        }).catch(err => console.warn(err));
    }
}, 2000);