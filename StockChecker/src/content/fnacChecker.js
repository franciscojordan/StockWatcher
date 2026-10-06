function checkFnacStock() {
    console.log("Stock Watcher: comprobando stock de FNAC...");

    // Busca botón de compra en FNAC
    const buyButton = document.querySelector(".js-ProductBuy-add, .mi-boton-reserva");
    const onlineDeliveryBox = document.querySelector("#identrega, .f-buyBox");

    // Comprueba que el texto en esos dos divs contenga "No disponible"
    if (onlineDeliveryBox && onlineDeliveryBox.innerText.includes("No disponible")) {
        return {
            status: "OUT_OF_STOCK",
            message: "Agotado en Fnac.es"
        };
    }

    if (buyButton) {
        return { status: "IN_STOCK", message: "Disponible en FNAC" };
    }

    return { status: "UNKNOWN", message: "No se pudo determinar el stock" };
}

setTimeout(() => {
    const result = checkFnacStock();
    console.log("FNAC Stock Result:", result);

    if (chrome.runtime && chrome.runtime.id) {
        chrome.runtime.sendMessage({
            type: "STOCK_RESULT",
            result: result
        }).catch(err => console.warn(err));
    }
}, 2000);