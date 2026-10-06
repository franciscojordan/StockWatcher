const STORAGE_KEY = "products";

async function getProducts() {
    const result = await chrome.storage.local.get(STORAGE_KEY);

    return result[STORAGE_KEY] || [];
}

async function saveProducts(products) {
    await chrome.storage.local.set({
        [STORAGE_KEY]: products
    });
}

async function addProduct(product) {
    const products = await getProducts();

    products.push(product);

    await saveProducts(products);

    return product;
}

async function removeProduct(id) {
    const products = await getProducts();

    const filteredProducts = products.filter(
        product => product.id !== id
    );

    await saveProducts(filteredProducts);
}