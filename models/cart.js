const fs = require("fs");
const path = require("path");

const p = path.join(
	path.dirname(process.mainModule.filename),
	"data",
	"cart.json"
);
module.exports = class Cart {
	static addProduct(id, productPrice) {
		//fetch products
		fs.readFile(p, (err, fileContent) => {
			let cart = { products: [], totalPrice: 0 };
			if (!err) {
				cart = JSON.parse(fileContent);
			}
			//analyze the cart
			let updatedProduct;
			const exsistingProductIndex = cart.products.findIndex(
				prod => prod.id === id
			);
			const exsistingProduct = cart.products[exsistingProductIndex];
			if (exsistingProduct) {
				updatedProduct = { ...exsistingProduct };
				updatedProduct.qty = updatedProduct.qty + 1;
				cart.products = [...cart.products];
				cart.products[exsistingProductIndex] = updatedProduct;
			} else {
				updatedProduct = { id: id, qty: 1 };
				cart.products = [...cart.products, updatedProduct];
			}
			cart.totalPrice = cart.totalPrice + +productPrice;
			fs.writeFile(p, JSON.stringify(cart), err => {
				console.log(err);
			});
		});
		//update and add new product
	}
};
