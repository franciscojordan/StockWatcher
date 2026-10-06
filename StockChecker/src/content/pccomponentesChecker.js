function checkPccomponentesStock() {
    console.log("Stock Watcher: comprobando stock de PcComponentes...");

    const actionButton = document.querySelector("#pdp-add-to-cart-sticky");
    const notAvailableBadge = document.querySelector('[class*="notAvailableText"]');

    if (notAvailableBadge || (actionButton && actionButton.innerText.toUpperCase().includes("AVÍSAME"))) {
        return { status: "OUT_OF_STOCK", message: "Agotado en PcComponentes" };
    }

    if (actionButton) {
        return { status: "IN_STOCK", message: "Disponible en PcComponentes" };
    }

    return { status: "UNKNOWN", message: "No se pudo determinar el stock" };
}

setTimeout(() => {
    const result = checkPccomponentesStock();
    console.log("PcComponentes Stock Result:", result);

    if (chrome.runtime && chrome.runtime.id) {
        chrome.runtime.sendMessage({
            type: "STOCK_RESULT",
            result: result
        }).catch(err => console.warn(err));
    }
}, 2500);