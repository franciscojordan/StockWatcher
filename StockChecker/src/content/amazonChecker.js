function checkAmazonStock() {

    console.log("Stock Watcher: comprobando stock de Amazon...");

    // Comprueba primero si Amazon indica explícitamente
    // que el producto no está disponible.

    const outOfStock = document.querySelector("#outOfStock");

    if (outOfStock) {

        const text = outOfStock.textContent
            .trim()
            .toLowerCase();

        const outOfStockPhrases = [
            // Español
            "no disponible", "agotado", "actualmente no disponible",
            // Inglés (co.uk)
            "currently unavailable", "out of stock", "temporarily out of stock",
            // Alemán (de)
            "derzeit nicht verfügbar", "nicht auf lager", "ausverkauft",
            // Francés (fr)
            "actuellement indisponible", "en rupture de stock", "non disponible",
            // Italiano (it)
            "attualmente non disponibile", "non disponibile", "esaurito", "temporaneamente non disponibile"
        ];

        const isOutOfStock = outOfStockPhrases.some(phrase => text.includes(phrase));

        if (isOutOfStock) {
            return {
                status: "OUT_OF_STOCK",
                message: "Agotado en Amazon"
            };
        }
    }

    // Comprobamos si existen botones de compra.

    const addToCart = document.querySelector("#add-to-cart-button");
    const buyNow = document.querySelector("#buy-now-button");

    if (addToCart || buyNow) {
        return {
            status: "IN_STOCK",
            message: "Producto disponible en Amazon"
        };
    }

    // Si no ha podido determinar el estado:

    return {
        status: "UNKNOWN",
        message: "No se ha podido determinar el stock"
    };
}


// Espera un poco porque Amazon puede terminar de cargar
// algunos elementos después de document_idle.

setTimeout(() => {

    const result = checkAmazonStock();

    console.log(
        "Stock Watcher:",
        result
    );

    chrome.runtime.sendMessage({
        type: "STOCK_RESULT",
        result: result
    });

}, 2000);