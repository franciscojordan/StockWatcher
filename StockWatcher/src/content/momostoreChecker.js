function checkMomostoreStock() {
    console.log("Stock Watcher: comprobando stock de MomoStore...");

    // Busca botón de compra en MomoStore
    const buyButton = document.querySelector(".pre-order");
    const outOfStockBadge = document.querySelector(".sin-stock");

    // Comprueba que el texto en esos dos divs contenga "No disponible"
    if (outOfStockBadge) {
        return {
            status: "OUT_OF_STOCK",
            message: "Agotado en Momostore.es"
        };
    }

    if (buyButton) {
        return { status: "IN_STOCK", message: "Disponible en MomoStore" };
    }

    return { status: "UNKNOWN", message: "No se pudo determinar el stock" };
}

setTimeout(() => {
    const result = checkMomostoreStock();
    console.log("MomoStore Stock Result:", result);

    if (chrome.runtime && chrome.runtime.id) {
        chrome.runtime.sendMessage({
            type: "STOCK_RESULT",
            result: result
        }).catch(err => console.warn(err));
    }
}, 2000);