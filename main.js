// REFERENCIAS AL DOM
const movieSelect = document.getElementById("movieSelect");
const timeSelect = document.getElementById("timeSelect");
const seatsContainer = document.getElementById("seats");
const confirmBtn = document.getElementById("confirmBtn");
const ticketContainer = document.getElementById("ticket-container");
const roomSelect = document.getElementById("roomSelect");

let peliculas = [];
let seleccionadas = [];


// CARGAR PELÍCULAS
fetch("data.json")
  .then(res => res.json())
  .then(data => {
    peliculas = data;

    // Rellenar select
    peliculas.forEach(pelicula => {
      const option = document.createElement("option");
      option.value = pelicula.titulo;
      option.textContent = pelicula.titulo;
      movieSelect.appendChild(option);
    });

    renderSeats();
    cargarReservasPrevias();
  });


// CONFIGURACIÓN SALA
const filas = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K"];
const columnas = 8;


// RENDERIZAR BUTACAS
function renderSeats() {
  seatsContainer.innerHTML = "";

  filas.forEach(fila => {
    for (let i = 1; i <= columnas; i++) {
      const seat = document.createElement("div");
      seat.classList.add("seat");
      seat.dataset.id = `${fila}${i}`;
      seat.addEventListener("click", seleccionarButaca);
      seatsContainer.appendChild(seat);
    }
  });
}


// SELECCIÓN DE BUTACAS
function seleccionarButaca(e) {
  const seat = e.target;

  if (seat.classList.contains("occupied")) return;

  seat.classList.toggle("selected");

  const id = seat.dataset.id;

  if (seleccionadas.includes(id)) {
    seleccionadas = seleccionadas.filter(s => s !== id);
  } else {
    seleccionadas.push(id);
  }
}


// CONFIRMAR RESERVA
confirmBtn.addEventListener("click", () => {
  const movieName = movieSelect.value;
  const time = timeSelect.value;
  const roomMultiplier = parseFloat(roomSelect.value);

  if (seleccionadas.length === 0) {
    Swal.fire({
      icon: "warning",
      title: "Seleccioná al menos una butaca",
    });
    return;
  }

  const movieData = peliculas.find(p => p.titulo === movieName);
  const precioFinal = movieData.precio * roomMultiplier * seleccionadas.length;

  const reservas = JSON.parse(localStorage.getItem("reservas")) || [];

  const nuevaReserva = {
    id: Date.now(),
    movie: movieName,
    time,
    seats: [...seleccionadas],
    sala: roomSelect.options[roomSelect.selectedIndex].text,
    precio: precioFinal
  };

  reservas.push(nuevaReserva);
  localStorage.setItem("reservas", JSON.stringify(reservas));

  marcarOcupadas(nuevaReserva.seats);
  mostrarTicket(nuevaReserva);

  Swal.fire({
    icon: "success",
    title: "Reserva confirmada",
    html: `
      <p>Entradas: ${seleccionadas.length}</p>
      <p>Película: <strong>${movieName}</strong></p>
      <p>Sala: <strong>${nuevaReserva.sala}</strong></p>
      <h3>Total: $${precioFinal}</h3>
    `
  }).then(() => resetReserva());
});


// MOSTRAR TICKET
function mostrarTicket(reserva) {
  ticketContainer.innerHTML = `
    <h3>${reserva.movie}</h3>
    <p><strong>Horario:</strong> ${reserva.time}</p>
    <p><strong>Sala:</strong> ${reserva.sala}</p>
    <p><strong>Butacas:</strong> ${reserva.seats.join(", ")}</p>
    <p><strong>Total:</strong> $${reserva.precio}</p>
    <p><em>ID: ${reserva.id}</em></p>
  `;
}


// MARCAR OCUPADAS
function marcarOcupadas(seats) {
  document.querySelectorAll(".seat").forEach(s => {
    if (seats.includes(s.dataset.id)) {
      s.classList.add("occupied");
      s.classList.remove("selected");
    }
  });
}



// CARGAR RESERVAS PREVIAS
function cargarReservasPrevias() {
  const reservas = JSON.parse(localStorage.getItem("reservas")) || [];
  reservas.forEach(r => marcarOcupadas(r.seats));
}


// RESET RESERVA
function resetReserva() {
  seleccionadas = [];

  document.querySelectorAll(".seat.selected")
    .forEach(seat => seat.classList.remove("selected"));
}


// RESETEAR ASIENTOS AL CAMBIAR PELÍCULA / SALA / HORARIO
function refrescarButacas() {
    // Quitar TODAS las clases
    document.querySelectorAll(".seat").forEach(seat => {
      seat.classList.remove("selected");
      seat.classList.remove("occupied");
    });
  
    // Recargar reservas reales desde localStorage
    cargarReservasPrevias();
  
    // Vaciar array de seleccionadas
    seleccionadas = [];
  }
  
  // Escuchar cambios
  movieSelect.addEventListener("change", refrescarButacas);
  timeSelect.addEventListener("change", refrescarButacas);
  roomSelect.addEventListener("change", refrescarButacas);
  