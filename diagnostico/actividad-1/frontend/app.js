const API = "http://localhost:3000/materiales";

/* =========================
   CARGAR MATERIALES
========================= */
async function cargarMateriales() {
  const res = await fetch(API);
  const data = await res.json();

  const tabla = document.getElementById("tabla-materiales");
  tabla.innerHTML = "";

  data.forEach(mat => {
    tabla.innerHTML += `
      <tr>
        <td>${mat.nombre}</td>
        <td>${mat.tipo_unidad}</td>
        <td>${mat.cantidad}</td>
        <td>
          <button onclick="comprar(${mat.id})">+ Compra</button>
          <button onclick="vender(${mat.id})">- Venta</button>
        </td>
      </tr>
    `;
  });
}

/* =========================
   CREAR MATERIAL
========================= */
async function crearMaterial() {
  const nombre = document.getElementById("nombre").value;
  const tipo = document.getElementById("tipo").value;
  const cantidad = document.getElementById("cantidad").value;

  await fetch(API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      nombre,
      tipo_unidad: tipo,
      cantidad: Number(cantidad)
    })
  });

  cargarMateriales();
}

/* =========================
   COMPRA
========================= */
async function comprar(id) {
  const cantidad = prompt("Cantidad a comprar:");

  await fetch(`${API}/${id}/compra`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ cantidad: Number(cantidad) })
  });

  cargarMateriales();
}

/* =========================
   VENTA
========================= */
async function vender(id) {
  const cantidad = prompt("Cantidad a vender:");

  const res = await fetch(`${API}/${id}/venta`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ cantidad: Number(cantidad) })
  });

  const data = await res.json();

  if (data.error) {
    alert(data.error);
  }

  cargarMateriales();
}

/* =========================
   INICIO
========================= */
cargarMateriales();