const API = "https://pokeapi.co/api/v2/pokemon?limit=2000&offset=0";
const grid = document.querySelector("#pokemonGrid");
const searchInput = document.querySelector("#searchInput");
const sortSelect = document.querySelector("#sortSelect");
const countLabel = document.querySelector("#countLabel");
const statusLabel = document.querySelector("#status");
const alphabet = document.querySelector("#alphabet");
const loadMoreBtn = document.querySelector("#loadMoreBtn");
const installBtn = document.querySelector("#installBtn");
const pokemonDialog = document.querySelector("#pokemonDialog");
const pokemonDetails = document.querySelector("#pokemonDetails");
const closeDialogBtn = document.querySelector("#closeDialogBtn");

let allPokemon = [];
let activeLetter = "";
let visibleLimit = 50;
let installPrompt = null;

const colors = ["#ef4444", "#f59e0b", "#22c55e", "#3b82f6", "#8b5cf6", "#ec4899"];

function titleCase(name) {
  return name.replaceAll("-", " ").replace(/\b\w/g, letter => letter.toUpperCase());
}

function getId(url) {
  const match = url.match(/\/pokemon\/(\d+)\/?$/);
  return match ? Number(match[1]) : 0;
}

function makeAlphabet() {
  const letters = ["Todos", ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"];
  alphabet.innerHTML = "";
  letters.forEach(letter => {
    const button = document.createElement("button");
    button.className = "letter-btn" + ((letter === "Todos" && !activeLetter) || letter === activeLetter ? " active" : "");
    button.textContent = letter === "Todos" ? "★" : letter;
    button.title = letter === "Todos" ? "Mostrar todos" : `Pokémon con ${letter}`;
    button.setAttribute("aria-label", button.title);
    button.addEventListener("click", () => {
      activeLetter = letter === "Todos" ? "" : letter;
      visibleLimit = 50;
      makeAlphabet();
      renderPokemon();
    });
    alphabet.appendChild(button);
  });
}

function filteredPokemon() {
  const query = searchInput.value.trim().toLocaleLowerCase("es");
  const direction = sortSelect.value;
  return allPokemon
    .filter(pokemon => !activeLetter || pokemon.name.toUpperCase().startsWith(activeLetter))
    .filter(pokemon => pokemon.name.replaceAll("-", " ").includes(query) || pokemon.name.includes(query))
    .sort((a, b) => direction === "az"
      ? a.name.localeCompare(b.name, "en", { sensitivity: "base" })
      : b.name.localeCompare(a.name, "en", { sensitivity: "base" }));
}

function renderPokemon() {
  const filtered = filteredPokemon();
  const shown = filtered.slice(0, visibleLimit);
  grid.innerHTML = "";
  countLabel.textContent = `${filtered.length.toLocaleString("es-MX")} Pokémon encontrados`;
  statusLabel.textContent = filtered.length ? "" : "No se encontraron Pokémon con esa búsqueda.";
  statusLabel.hidden = Boolean(filtered.length);

  if (!shown.length) {
    grid.innerHTML = '<div class="empty">Prueba con otro nombre o selecciona otra letra.</div>';
  }

  shown.forEach((pokemon, index) => {
    const id = getId(pokemon.url);
    const card = document.createElement("article");
    card.className = "pokemon-card";
    card.style.setProperty("--accent", colors[index % colors.length]);
    const number = id ? `#${String(id).padStart(4, "0")}` : "#----";
    const imageUrl = id
      ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`
      : "";
    card.tabIndex = 0;
    card.setAttribute("role", "button");
    card.setAttribute("aria-label", `Ver detalles de ${titleCase(pokemon.name)}`);
    card.innerHTML = `
      <span class="pokemon-number">${number}</span>
      <img class="pokemon-image" loading="lazy" alt="${titleCase(pokemon.name)}"
        src="${imageUrl}" onerror="this.onerror=null;this.src='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png'">
      <h3 class="pokemon-name">${titleCase(pokemon.name)}</h3>
      <span class="pokemon-letter">${pokemon.name.charAt(0).toUpperCase()}</span>
    `;
    card.addEventListener("click", () => showPokemonDetails(id, pokemon.name));
    card.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        showPokemonDetails(id, pokemon.name);
      }
    });
    grid.appendChild(card);
  });

  loadMoreBtn.hidden = filtered.length <= visibleLimit;
  loadMoreBtn.textContent = `Mostrar más (${Math.min(50, filtered.length - visibleLimit)} siguientes)`;
}


const statNames = { hp: "PS", attack: "Ataque", defense: "Defensa", "special-attack": "At. especial", "special-defense": "Def. especial", speed: "Velocidad" };

async function showPokemonDetails(id, name) {
  pokemonDetails.innerHTML = '<div class="detail-loading">Cargando detalles del Pokémon...</div>';
  if (!pokemonDialog.open) pokemonDialog.showModal();
  try {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}/`);
    if (!response.ok) throw new Error("No se pudieron cargar los detalles.");
    const pokemon = await response.json();
    const artwork = pokemon.sprites.other?.["official-artwork"]?.front_default || pokemon.sprites.front_default || "";
    const types = pokemon.types.map(item => `<span class="type-chip">${item.type.name}</span>`).join("");
    const abilities = pokemon.abilities.map(item => `<span class="ability-chip">${item.ability.name.replaceAll("-", " ")}${item.is_hidden ? " · oculta" : ""}</span>`).join("");
    const stats = pokemon.stats.map(item => {
      const value = item.base_stat;
      const percent = Math.min(100, Math.round(value / 180 * 100));
      return `<div class="stat-row"><span class="stat-label">${statNames[item.stat.name] || item.stat.name}</span><div class="stat-track"><div class="stat-fill" style="width:${percent}%"></div></div><span class="stat-value">${value}</span></div>`;
    }).join("");
    pokemonDetails.innerHTML = `
      <section class="detail-hero"><span class="detail-number">N.º ${String(pokemon.id).padStart(4,"0")}</span>
        <img class="detail-artwork" src="${artwork}" alt="${titleCase(name)}" onerror="this.style.visibility='hidden'">
        <h2 class="detail-name" id="detailName">${titleCase(pokemon.name)}</h2><div class="detail-types">${types}</div>
      </section>
      <section class="detail-content">
        <div class="detail-facts">
          <div class="detail-fact"><strong>${(pokemon.height / 10).toFixed(1)} m</strong><span>Altura</span></div>
          <div class="detail-fact"><strong>${(pokemon.weight / 10).toFixed(1)} kg</strong><span>Peso</span></div>
          <div class="detail-fact"><strong>${pokemon.base_experience ?? "—"}</strong><span>Experiencia base</span></div>
        </div>
        <h3 class="detail-section-title">Habilidades</h3><div class="ability-list">${abilities || "No hay habilidades disponibles."}</div>
        <h3 class="detail-section-title">Estadísticas base</h3><div>${stats}</div>
      </section>`;
  } catch (error) {
    pokemonDetails.innerHTML = `<div class="detail-loading"><p>No se pudieron cargar los detalles de ${titleCase(name)}.</p><button class="load-more" id="retryDetailsBtn">Intentar de nuevo</button></div>`;
    document.querySelector("#retryDetailsBtn")?.addEventListener("click", () => showPokemonDetails(id, name));
  }
}

closeDialogBtn.addEventListener("click", () => pokemonDialog.close());
pokemonDialog.addEventListener("click", event => { if (event.target === pokemonDialog) pokemonDialog.close(); });

async function loadPokemon() {
  try {
    statusLabel.hidden = false;
    statusLabel.textContent = "Cargando datos desde PokéAPI...";
    const response = await fetch(API);
    if (!response.ok) throw new Error("La API respondió con un error.");
    const data = await response.json();
    allPokemon = data.results.filter(item => getId(item.url) > 0);
    allPokemon.sort((a, b) => a.name.localeCompare(b.name, "en", { sensitivity: "base" }));
    makeAlphabet();
    renderPokemon();
  } catch (error) {
    statusLabel.hidden = false;
    statusLabel.textContent = "No se pudo conectar con PokéAPI. Revisa tu conexión e inténtalo de nuevo.";
    countLabel.textContent = "No se pudieron cargar los datos";
    grid.innerHTML = "";
  }
}

searchInput.addEventListener("input", () => { visibleLimit = 50; renderPokemon(); });
sortSelect.addEventListener("change", () => { visibleLimit = 50; renderPokemon(); });
loadMoreBtn.addEventListener("click", () => { visibleLimit += 50; renderPokemon(); });

window.addEventListener("beforeinstallprompt", event => {
  event.preventDefault();
  installPrompt = event;
  installBtn.hidden = false;
});
installBtn.addEventListener("click", async () => {
  if (!installPrompt) return;
  installPrompt.prompt();
  await installPrompt.userChoice;
  installPrompt = null;
  installBtn.hidden = true;
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js").catch(error => {
      console.error("No se pudo registrar el service worker:", error);
    });
  });
}

loadPokemon();
