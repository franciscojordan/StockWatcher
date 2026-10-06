const STORAGE_KEY = "products";

// Mapa en memoria para rastrear pestañas activas: Map<productId, tabId>
const activeTabs = new Map();


// ==============================
// STORAGE
// ==============================

async function getProducts() {
    const result = await chrome.storage.local.get(STORAGE_KEY);
    return result[STORAGE_KEY] || [];
}

async function saveProducts(products) {
    await chrome.storage.local.set({
        [STORAGE_KEY]: products
    });
}


// ==============================
// CICLO DE VIDA (INSTALACIÓN Y ARRANQUE)
// ==============================

chrome.runtime.onInstalled.addListener(async () => {
    console.log("Stock Watcher instalado/actualizado.");
    await chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(() => {});
    await restoreAlarms();
});

chrome.runtime.onStartup.addListener(async () => {
    await restoreAlarms();
});


// ==============================
// RESTAURAR Y SINCRONIZAR ALARMAS
// ==============================

async function restoreAlarms() {
    const products = await getProducts();
    
    for (const product of products) {
        const alarm = await chrome.alarms.get(product.id);
        
        if (!alarm) {
            chrome.alarms.create(product.id, {
                periodInMinutes: product.interval
            });
            console.log(`Alarma reactivada para: ${product.name}`);
        }
    }
}

chrome.alarms.onAlarm.addListener(async (alarm) => {
    console.log("Alarma ejecutada:", alarm.name);
    const products = await getProducts();
    const product = products.find(p => p.id === alarm.name);

    if (product) {
        await checkProductStock(product);
    }
});


// ==============================
// COMPROBAR PRODUCTO
// ==============================

async function checkProductStock(product, isManual = false) {
    // 0. Comprobar estado de pausa (se ignora si es una comprobación manual)
    if (!isManual) {
        const { globalPaused } = await chrome.storage.local.get("globalPaused");
        if (globalPaused || product.paused) {
            console.log(`Monitoreo omitido por pausa (Global: ${!!globalPaused}, Producto: ${!!product.paused}): ${product.name}`);
            return;
        }
    }

    console.log("Comprobando:", product.name);

    // 1. Si ya había una pestaña abierta comprobando este producto, la cerramos
    if (activeTabs.has(product.id)) {
        const oldTabId = activeTabs.get(product.id);
        chrome.tabs.remove(oldTabId).catch(() => {});
        activeTabs.delete(product.id);
    }

    // 2. Abrimos la pestaña en segundo plano sin cambiar el foco
    const tab = await chrome.tabs.create({
        url: product.url,
        active: false
    });

    activeTabs.set(product.id, tab.id);

    // 3. Timeout de seguridad (12 segundos) por si la web se cuelga
    setTimeout(() => {
        if (activeTabs.get(product.id) === tab.id) {
            chrome.tabs.remove(tab.id).catch(() => {});
            activeTabs.delete(product.id);
            console.warn(`Timeout de carga alcanzado para: ${product.name}`);
        }
    }, 12000);
}


// ==============================
// MENSAJES Y RESULTADOS
// ==============================

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

    if (message.type === "CHECK_PRODUCT") {
        checkProductStock(message.product, true); // Paso 'true' para forzar la revisión manual
        return;
    }

    if (message.type === "STOCK_RESULT") {
        handleStockResult(message, sender);
    }
});

async function handleStockResult(message, sender) {
    console.log("Resultado recibido:", message.result);

    if (!sender.tab) return;

    // 1. Verificar si la pestaña la abrió la extensión
    let isExtensionTab = false;
    let productId = null;

    for (const [pId, tId] of activeTabs.entries()) {
        if (tId === sender.tab.id) {
            productId = pId;
            isExtensionTab = true;
            activeTabs.delete(pId);
            break;
        }
    }

    // 2. Si NO fue abierta por la extensión, ignoramos el mensaje y NO la cerramos
    if (!isExtensionTab) {
        console.log("Mensaje ignorado: Pestaña abierta manualmente por el usuario.");
        return;
    }

    // 3. Si la abrió la extensión, la cerramos de inmediato
    chrome.tabs.remove(sender.tab.id).catch(() => {});

    const products = await getProducts();
    const product = products.find(p => p.id === productId);

    if (!product) {
        console.warn("No se encontró el producto asociado a la pestaña:", sender.tab.id);
        return;
    }

    const oldStatus = product.status;
    const newStatus = message.result.status;

    product.status = newStatus;
    product.lastMessage = message.result.message;
    product.lastCheck = Date.now();

    await saveProducts(products);

    console.log(`${product.name}: ${oldStatus} → ${newStatus}`);

    // NOTIFICAR: Si cambia a IN_STOCK desde cualquier otro estado
    if (newStatus === "IN_STOCK" && oldStatus !== "IN_STOCK") {
        console.log("Trigger: Enviando notificación para", product.name);
        sendStockNotification(product);
        sendTelegramNotification(product); // Notifica a través de Telegram
    }
}


// ==============================
// NOTIFICACIÓN
// ==============================

function sendStockNotification(product) {
    const storeName = product.service?.name || product.store || "Tienda";
    const iconName = storeName.toLowerCase().replace(/\s+/g, "");
    const iconUrl = chrome.runtime.getURL(`icons/${iconName}.png`);

    console.log(`Creando notificación Chrome con icono: ${iconUrl}`);

    chrome.notifications.create(
        `stock-${product.id}-${Date.now()}`,
        {
            type: "basic",
            title: "¡Producto disponible!",
            message: `${product.name} ya está disponible en ${storeName}.`,
            iconUrl: iconUrl,
            priority: 2
        },
        (notificationId) => {
            if (chrome.runtime.lastError) {
                console.error("Error al crear notificación:", chrome.runtime.lastError.message);
                
                // Fallback si la imagen con el nombre de la tienda no existe
                chrome.notifications.create({
                    type: "basic",
                    title: "¡Producto disponible!",
                    message: `${product.name} ya está disponible.`,
                    iconUrl: chrome.runtime.getURL("icons/icon128.png"),
                    priority: 2
                });
            } else {
                console.log("Notificación mostrada con ID:", notificationId);
            }
        }
    );
}


// ==============================
// CLIC EN LA NOTIFICACIÓN
// ==============================

chrome.notifications.onClicked.addListener(async (notificationId) => {
    console.log("Clic detectado en la notificación:", notificationId);

    if (!notificationId.startsWith("stock-")) return;

    const products = await getProducts();
    const product = products.find(p => p.id && notificationId.includes(String(p.id)));

    if (product && product.url) {
        console.log("Abriendo URL del producto:", product.url);
        await chrome.tabs.create({ url: product.url, active: true });
        chrome.notifications.clear(notificationId);
    } else {
        console.warn("No se encontró la URL para la notificación:", notificationId);
    }
});

// ==============================
// NOTIFICACION POR TELEGRAM
// ==============================

async function sendTelegramNotification(product) {
    const BOT_TOKEN = "8424226874:AAFhKp5-Z2NCVk0HzExvhNPODFHDF_qWrzQ";
    const CHAT_ID = "1814856650";
    const storeName = product.service?.name || product.store || "Tienda";
    
    const mensaje = `🚨 ¡PRODUCTO EN STOCK!\n\n📦 ${product.name}\n🏪 ${storeName}\n🔗 ${product.url}`;
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

    try {
        await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                chat_id: CHAT_ID,
                text: mensaje,
                parse_mode: "HTML"
            })
        });
        console.log("Notificación enviada al móvil vía Telegram.");
    } catch (error) {
        console.error("Error al enviar el Telegram:", error);
    }
}