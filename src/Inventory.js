// import React, { useEffect, useState } from "react";
// import "./Inventory.css";
// const Inventory = () => {
//   const [products, setProducts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     fetchProducts();
//   }, []);

//   const fetchProducts = async () => {
//     try {
//       const response = await fetch("http://localhost:5000/api/products"); // Fetch all products
//       if (!response.ok) throw new Error(`Error: ${response.statusText}`);
//       const data = await response.json();

//       // Fetch quantity for each product and update state
//       const updatedProducts = await Promise.all(
//         data.products.map(async (product) => {
//           const quantity = await fetchProductQuantity(product.productId);
//           return { ...product, quantity };
//         })
//       );

//       setProducts(updatedProducts);
//       setError("");
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchProductQuantity = async (id) => {
//     try {
//       const response = await fetch(`http://localhost:5000/api/products/${id}/quantity`);
//       if (!response.ok) throw new Error(`Error: ${response.statusText}`);
//       const data = await response.json();
//       return data.quantity;
//     } catch (err) {
//       console.error(`Error fetching quantity for product ${id}:`, err);
//       return "Error";
//     }
//   };

//   return (
//     <div className="inventory-container">
//       <h2>Inventory</h2>
//       {loading ? (
//         <p>Loading...</p>
//       ) : error ? (
//         <p className="error">{error}</p>
//       ) : (
//         <table className="inventory-table">
//           <thead>
//             <tr>
//               <th>Product ID</th>
//               <th>Quantity</th>
//             </tr>
//           </thead>
//           <tbody>
//             {products.map((product) => (
//               <tr key={product.productId}>
//                 <td>{product.productId}</td>
//                 <td>{product.quantity}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       )}
//     </div>
//   );
// };

// export default Inventory;








import React, { useEffect, useState } from "react";
import "./Inventory.css";

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState(""); 
  const [quantityInputs, setQuantityInputs] = useState({});
  const [newProduct, setNewProduct] = useState({ productId: "", quantity: "" });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/products");
      if (!response.ok) throw new Error(`Error: ${response.statusText}`);
      const data = await response.json();
      setProducts(data.products);
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId) => {
    const quantityToAdd = parseInt(quantityInputs[productId] || 0, 10);

    try {
      const response = await fetch("http://localhost:5000/api/products/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity: quantityToAdd }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage(data.message);
        fetchProducts(); 
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError("Error updating quantity");
    }
  };

  const addProduct = async () => {
    const { productId, quantity } = newProduct;
    if (!productId || !quantity) {
      setError("Both fields are required.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/products/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity: parseInt(quantity, 10) }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage(data.message);
        fetchProducts();
        setNewProduct({ productId: "", quantity: "" });
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError("Error adding product");
    }
  };

  return (
    <div className="inventory-container">
      <h2>Inventory</h2>

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : (
        <>
          {/* Add New Product Form */}
          <div className="add-product-form">
            <h3>Add New Product</h3>
            <input
              type="text"
              placeholder="Product ID"
              value={newProduct.productId}
              onChange={(e) => setNewProduct({ ...newProduct, productId: e.target.value })}
            />
            <input
              type="number"
              placeholder="Quantity"
              value={newProduct.quantity}
              onChange={(e) => setNewProduct({ ...newProduct, quantity: e.target.value })}
            />
            <button onClick={addProduct}>Add Product</button>
          </div>

          {/* Inventory Table */}
          <table className="inventory-table">
            <thead>
              <tr>
                <th>Product ID</th>
                <th>Quantity</th>
                <th>Enter Quantity</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.productId}>
                  <td>{product.productId}</td>
                  <td>{product.quantity}</td>
                  <td>
                    <input
                      type="number"
                      value={quantityInputs[product.productId] || ""}
                      onChange={(e) =>
                        setQuantityInputs({
                          ...quantityInputs,
                          [product.productId]: e.target.value,
                        })
                      }
                    />
                  </td>
                  <td>
                    <button onClick={() => updateQuantity(product.productId)}>
                      Update
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {message && <p className="success-message">{message}</p>}
        </>
      )}
    </div>
  );
};

export default Inventory;
