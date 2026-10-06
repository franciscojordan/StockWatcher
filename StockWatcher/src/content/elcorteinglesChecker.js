function checkElCorteInglesStock() {
    console.log("Stock Watcher: comprobando stock de El Corte Inglés...");

    // Busca botón de compra en El Corte Inglés
    const buyButton = document.querySelector("#add_to_cart_main_button");

    if (buyButton) {
        const buttonText = buyButton.innerText ? buyButton.innerText.toUpperCase() : "";
        const isDisabled = buyButton.getAttribute("aria-disabled") === "true" || 
                           buyButton.disabled ||
                           buyButton.classList.contains("disabled") ||
                           buttonText.includes("AGOTADO");

        if (isDisabled) {

             return { status: "OUT_OF_STOCK", message: "Agotado en El Corte Inglés" };

        }

        return { status: "IN_STOCK", message: "Disponible en El Corte Inglés" };
       
    }

    return { status: "UNKNOWN", message: "No se pudo determinar el stock" };
}

setTimeout(() => {
    const result = checkElCorteInglesStock();
    console.log("El Corte Inglés Stock Result:", result);

    if (chrome.runtime && chrome.runtime.id) {
        chrome.runtime.sendMessage({
            type: "STOCK_RESULT",
            result: result
        }).catch(err => console.warn(err));
    }
}, 2000);