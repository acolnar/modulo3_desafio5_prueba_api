const montoInput = document.getElementById("monto");
const monedaSelect = document.getElementById("moneda");
const btnBuscar = document.getElementById("btnBuscar");
const resultado = document.getElementById("resultado");
const errorDOM = document.getElementById("error");

let miGrafico = null;

// Obtiene los datos de la API según la moneda elegida
const getIndicador = async (moneda) => {
  const url = `https://mindicador.cl/api/${moneda}`;

  try {
    const res = await fetch(url);

    if (!res.ok) {
      throw new Error("No se pudo obtener información desde la API.");
    }

    const data = await res.json();
    return data;
  } catch (error) {
    throw error;
  }
};

// Convierte el monto de CLP a la moneda elegida
const convertirMoneda = async () => {
  errorDOM.textContent = "";
  resultado.textContent = "Resultado: $0";

  try {
    const monto = Number(montoInput.value);
    const moneda = monedaSelect.value;

    if (!monto || monto <= 0) {
      throw new Error("Debes ingresar un monto válido en pesos chilenos.");
    }

    if (!moneda) {
      throw new Error("Debes seleccionar una moneda.");
    }

    const data = await getIndicador(moneda);

    const valorMoneda = data.serie[0].valor;
    const conversion = monto / valorMoneda;

    resultado.textContent = `Resultado: ${conversion.toLocaleString("es-CL", {
      style: "currency",
      currency: moneda === "dolar" ? "USD" : "EUR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

    renderGrafico(data);
  } catch (error) {
    errorDOM.textContent = error.message;
  }
};

// Prepara los datos para el gráfico
const prepararDatosGrafico = (data) => {
  const ultimos10Dias = data.serie.slice(0, 10).reverse();

  const labels = ultimos10Dias.map((item) => {
    return new Date(item.fecha).toLocaleDateString("es-CL");
  });

  const valores = ultimos10Dias.map((item) => item.valor);

  return {
    labels,
    datasets: [
      {
        label: `Historial últimos 10 días (${data.nombre})`,
        data: valores,
        borderColor: "rgb(255, 99, 132)",
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        borderWidth: 2,
        tension: 0.3,
        fill: false,
      },
    ],
  };
};

// Dibuja o actualiza el gráfico
const renderGrafico = (data) => {
  const ctx = document.getElementById("grafico").getContext("2d");
  const config = {
    type: "line",
    data: prepararDatosGrafico(data),
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: true,
        },
      },
      scales: {
        y: {
          beginAtZero: false,
        },
      },
    },
  };

  if (miGrafico) {
    miGrafico.destroy();
  }

  miGrafico = new Chart(ctx, config);
};

btnBuscar.addEventListener("click", convertirMoneda);