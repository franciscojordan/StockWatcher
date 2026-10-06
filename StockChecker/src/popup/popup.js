const STORAGE_KEY = "products";


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

const btnGlobalPause = document.getElementById("btnToggleGlobalPause");

async function updateGlobalPauseUI() {
    const { globalPaused } = await chrome.storage.local.get("globalPaused");
    const icon = document.getElementById("globalPauseIcon");

    if (icon) {
        // Cambia la ruta a la imagen que corresponda
        icon.src = globalPaused ? "../../icons/play.png" : "../../icons/pause.png";
    }
}

if (btnGlobalPause) {
    btnGlobalPause.addEventListener("click", async () => {
        const { globalPaused } = await chrome.storage.local.get("globalPaused");
        const newState = !globalPaused;

        // Guardamos el nuevo estado booleano
        await chrome.storage.local.set({ globalPaused: newState });
        
        // Actualizamos la interfaz
        await updateGlobalPauseUI();
        
        console.log("Pausa global cambiada a:", newState);
    });
}

// 4. Cargar el estado correcto al abrir el sidepanel
document.addEventListener("DOMContentLoaded", updateGlobalPauseUI);

// ==============================
// EXTRAER NOMBRE DEL SERVICIO
// ==============================

function getServiceName(url) {
    try {
        let formattedUrl = url.trim();
        
        // Si no empieza por http:// o https://, se lo añade para que URL() no lance un error
        if (!/^https?:\/\//i.test(formattedUrl)) {
            formattedUrl = "https://" + formattedUrl;
        }

        // Extrae el hostname y quita "www."
        const hostname = new URL(formattedUrl).hostname.replace(/^www\./i, "");
        
        // Obtiene "amazon.es" de "amazon.es/"
        const rawName = hostname.split("/")[0];
        
        // Cambia los nombres para páginas que tienen mayúsculas entre medio
        if (rawName === "pccomponentes.com") {
            return "PcComponentes.com";
        }
        else if (rawName === "elcorteingles.es") {
            return "ElCorteIngles.es";
        }
        else if (rawName === "mediamarkt.es") {
            return "MediaMarkt.es";
        }

        // Capitaliza la primera letra
        return rawName.charAt(0).toUpperCase() + rawName.slice(1);
    } catch (error) {
        return "Unknown";
    }
}


// ==============================
// MOSTRAR PRODUCTOS
// ==============================

async function renderProducts() {
    const container = document.getElementById("products");
    const products = await getProducts();

    container.innerHTML = "";

    if (products.length === 0) {
        container.textContent = "No hay productos monitorizados.";
        return;
    }

    products.forEach(product => {
        const element = document.createElement("div");
        
        // 1. Asignamos la clase base y la clase de color según el estado
        const statusClass = getStatusClass(product.status);
        element.className = `product ${statusClass}`;

        const name = document.createElement("div");
        name.className = "product-name";
        name.textContent = product.name;

        const storeName = product.service?.name ? ` ➔ ${product.service.name}` : "";

        const status = document.createElement("div");
        status.className = "status";
        status.textContent = `${getStatusText(product.status)}${storeName}`;

        const buttonContainer = document.createElement("div");
        buttonContainer.className = "button-container";

        const deleteButton = document.createElement("button");
        deleteButton.className = "delete";
        deleteButton.textContent = "Eliminar";

        deleteButton.addEventListener("click", async () => {
            await deleteProduct(product.id);
            renderProducts();
        });

        const openButton = document.createElement("button");
        openButton.className = "open";
        openButton.textContent = "Abrir web";

        openButton.addEventListener("click", async () => {
            await chrome.tabs.create({ url: product.url, active: true });
        });

        buttonContainer.appendChild(deleteButton);
        buttonContainer.appendChild(openButton);

        element.appendChild(name);
        element.appendChild(status);
        element.appendChild(buttonContainer);

        container.appendChild(element);
    });
}

// ==============================
// ESTADO
// ==============================

function getStatusText(status) {

    switch (status) {

        case "IN_STOCK":
            return "En stock";

        case "OUT_OF_STOCK":
            return "Sin stock";

        case "UNKNOWN":
            return "Estado desconocido";

        default:
            return "Sin comprobar";
    }
}

function getStatusClass(status) {
    if (status === "IN_STOCK") return "status-in-stock";
    if (status === "OUT_OF_STOCK") return "status-out-of-stock";
    return "status-unknown"; // Para UNKNOWN, NULL o cualquier otro valor
}


// ==============================
// AÑADIR PRODUCTO
// ==============================

document
    .getElementById("addProduct")
    .addEventListener("click", async () => {

        const name =
            document.getElementById("name").value.trim();

        const url =
            document.getElementById("url").value.trim();

        const interval =
            Number(
                document.getElementById("interval").value
            );


        if (!name || !url) {

            alert(
                "Introduce el nombre y la URL."
            );

            return;
        }

        if (!/^https?:\/\//i.test(url)) {
            url = "https://" + url;
        }

        const allowedDomains = [
            // Amazon
            "https://www.amazon.es/", "https://amazon.es/",
            "https://www.amazon.de/", "https://amazon.de/",
            "https://www.amazon.fr/", "https://amazon.fr/",
            "https://www.amazon.it/", "https://amazon.it/",
            "https://www.amazon.co.uk/", "https://amazon.co.uk/",
            // MediaMarkt
            "https://www.mediamarkt.es/", "https://mediamarkt.es/",
            // El Corte Inglés
            "https://www.elcorteingles.es/", "https://elcorteingles.es/",
            // Carrefour
            "https://www.carrefour.es/", "https://carrefour.es/",
            // Fnac
            "https://www.fnac.es/", "https://fnac.es/",
            // PcComponentes
            "https://www.pccomponentes.com/", "https://pccomponentes.com",
            // MomoStore
            "https://www.momostore.es/", "https://momostore.es/"
        ];

        const forbiddenDomains = [
            // Game
            "https://www.game.es/", "https://game.es/",
        ]

        const isValidDomain = allowedDomains.some(domain => url.startsWith(domain));

        const isForbiddenDomain = forbiddenDomains.some(domain => url.startsWith(domain));

        if (!isValidDomain) {

            if (isForbiddenDomain) {
                
                alert("A esos ladrones ni agua");
                return;

            }

            alert("De momento solo aceptamos [Amazon.es, .de, .fr, .it y .co.uk], [MediaMarkt.es], [FNAC.es], [Carrefour.es], [El Corte Inglés], [PcComponentes] y [MomoStore]");
            return;
        }

        const products = await getProducts();


        const product = {

            id: crypto.randomUUID(),

            name: name,

            service: {
                name: getServiceName(url) // Extrae y capitaliza (ej: "Amazon.es" o "Fnac.es")
            },

            url: url,

            interval: interval,

            status: "UNKNOWN",

            lastCheck: null,

            lastMessage: null
        };


        products.push(product);

        await saveProducts(products);


        // Crea una alarma para este producto.

        chrome.alarms.create(
            product.id,
            {
                periodInMinutes: interval
            }
        );


        // Primera comprobación inmediata.

        chrome.runtime.sendMessage({

            type: "CHECK_PRODUCT",

            product: product
        });


        document.getElementById("name").value = "";

        document.getElementById("url").value = "";


        renderProducts();
    });


// ==============================
// ELIMINAR
// ==============================

async function deleteProduct(id) {

    const products = await getProducts();

    const filtered =
        products.filter(
            product => product.id !== id
        );

    await saveProducts(filtered);


    // Elimina la alarma.

    await chrome.alarms.clear(id);
}

// ==============================
// INICIO
// ==============================

renderProducts();

// ==============================
// ACTUALIZACIÓN EN TIEMPO REAL
// ==============================

chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === "local" && changes[STORAGE_KEY]) {
        renderProducts();
    }
});