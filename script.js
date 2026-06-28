/* ==========================================================================
 /* ==========================================================================
   FANTALAUREA ODONTOIATRIA 2026 - SCRIPT.JS DEFINITIVO (PLAYER APP)
   ========================================================================== */

import {
    inizializzaConfigurazione,
    autenticaUtenteAnonimo,
    caricaSquadrePerCapitano,
    creaNuovaSquadra,
    uniscitiASquadraEsistente,
    ascoltaDatiSquadra,
    inviaRichiestaMissione,
    ascoltaFeedApprovazioni,
    ascoltaStatoGiocoFinale
} from './firebase.js';

export const CAPITANI = ["Fabrizio", "Lorenzo", "Riccardo", "Sveva", "Ferrantini", "Giada", "Federica", "Adriano"];

export const CATEGORIE = {
    capitano: "🎓 Prove del Capitano",
    foto: "📸 Prove Fotografiche",
    goliardia: "🎉 Goliardia Universitaria",
    social: "📱 Social",
    speciali: "🌋 Speciali",
    malus: "💀 Malus"
};

export const MISSIONS = [
    { id: "oratore", category: "capitano", name: "Oratore", points: 8, desc: "Discorso di laurea epico o ringraziamento commovente." },
    { id: "canto", category: "capitano", name: "Esame di Canto", points: 8, desc: "Il capitano deve intonare una canzone scelta dagli invitati." },
    { id: "gloria110", category: "capitano", name: "110 e Gloria", points: 20, desc: "Il capitano ottiene il massimo dei voti." },
    { id: "lacrime", category: "capitano", name: "Lacrime di Laurea", points: 10, desc: "Commozione pubblica e visibile del capitano durante la giornata." },
    { id: "ovazione", category: "capitano", name: "Ovazione Accademica", points: 8, desc: "Boato e applausi scroscianti alla proclamazione." },
    { id: "giglio", category: "capitano", name: "Giglio di Barra", points: 12, desc: "Festeggiamento folkloristico degno di nota." },
    { id: "saluti", category: "capitano", name: "Saluti da Casa", points: 6, desc: "Videochiamata di auguri con parenti lontani che non sono potuti venire." },
    { id: "prescelto", category: "capitano", name: "Il Prescelto", points: 8, desc: "Il docente fa un complimento personalizzato e fuori copione." },
    { id: "classe_completa", category: "foto", name: "La Classe al Completo", points: 8, desc: "Foto di gruppo con almeno 15 compagni di corso." },
    { id: "magnifici_otto", category: "foto", name: "I Magnifici Otto", points: 20, desc: "Foto di gruppo che ritrae contemporaneamente tutti gli 8 Capitani." },
    { id: "proclamazione_ufficiale", category: "foto", name: "Proclamazione Ufficiale", points: 10, desc: "Foto scattata nell'esatto istante della proclamazione." },
    { id: "calvizie", category: "foto", name: "Calvizie Honoris Causa", points: 5, desc: "Foto di gruppo con un professore o invitato palesemente calvo." },
    { id: "brindisi", category: "goliardia", name: "Il Brindisi", points: 5, desc: "Brindisi collettivo urlato a gran voce per il capitano." },
    { id: "brindisi_rima", category: "goliardia", name: "Bonus brindisi in rima", points: 3, desc: "Discorso di brindisi improvvisato interamente in rima baciata." },
    { id: "curva_sud", category: "goliardia", name: "Curva Sud", points: 8, desc: "Cori da stadio e saltelli coordinati per il festeggiato." },
    { id: "celebrita", category: "goliardia", name: "Momento Celebrità", points: 4, desc: "Selfie del capitano con un perfetto sconosciuto fuori dalla sessione." },
    { id: "scrocco", category: "goliardia", name: "Campioni nello Scrocco", points: 2, desc: "Bevi o mangi a sbafo da un vassoio di un'altra laurea.", cumulable: true },
    { id: "furto_corona", category: "goliardia", name: "Furto della Corona", points: 15, desc: "Indossare la corona d'alloro del capitano senza farsi scoprire per 5 minuti." },
    { id: "amici_sempre", category: "goliardia", name: "Amici da Sempre", points: 5, desc: "Abbraccio di gruppo con lacrimuccia tra vecchi compagni di scuola." },
    { id: "assemblea", category: "goliardia", name: "Assemblea Straordinaria", points: 15, desc: "Riunire almeno 20 persone in cerchio per cantare l'inno della facoltà." },
    { id: "cronaca_gloria", category: "social", name: "Cronaca della Gloria", points: 5, desc: "Pubblicazione di una storia Instagram con tag ufficiale dell'evento." },
    { id: "risposte_auguri", category: "social", name: "Ogni risposta agli auguri", points: 1, desc: "Ogni storia ricondivisa dal capitano con ringraziamento.", cumulable: true },
    { id: "just_dance", category: "social", name: "Just Dance", points: 8, desc: "Video TikTok o Reel di un ballo di gruppo coreografato durante la festa." },
    { id: "ambasciatore", category: "speciali", name: "Ambasciatore Partenopeo", points: 5, desc: "Insegnare un'espressione dialettale napoletana a un invitato non campano." },
    { id: "no_vabbe", category: "speciali", name: "No Vabbè", points: 8, desc: "Esclamazione di stupore collettivo per una sorpresa inaspettata." },
    { id: "cuozzo", category: "speciali", name: "Modalità Cuozzo", points: 6, desc: "Atteggiamento o abbigliamento goliardico marcatamente tamarro sfoggiato alla festa." },
    { id: "bocciato_orale", category: "malus", name: "Bocciato all'Orale", points: -10, desc: "Scena muta o gaffe clamorosa del capitano durante i festeggiamenti." },
    { id: "politico18", category: "malus", name: "18 Politico", points: -15, desc: "Il capitano fa un brindisi sotto tono o si rifiuta di bere quando richiesto." },
    { id: "ringraziamento_dimenticato", category: "malus", name: "Ringraziamento Dimenticato", points: -3, desc: "Dimenticare di salutare o ringraziare un invitato importante nei discorsi.", cumulable: true },
    { id: "fuori_programma", category: "malus", name: "Fuori Programma", points: -10, desc: "Incidente logistico (es. torta rovesciata, vestito macchiato, spumante che non si apre)." },
    { id: "distrazione", category: "malus", name: "Distrazione", points: -5, desc: "Perdere temporaneamente un oggetto personale (telefono, bomboniera, corona)." },
    { id: "disastro_mensa", category: "malus", name: "Disastro in Mensa", points: -4, desc: "Rovesciare un intero bicchiere o piatto sul tavolo del buffet." },
    { id: "ritardatari", category: "malus", name: "Ritardatari", points: -2, desc: "Arrivare al ristorante o al punto di ritrovo dopo l'orario stabilito.", cumulable: true },
    { id: "creativita_insufficiente", category: "malus", name: "Creatività Insufficiente", points: -5, desc: "Canto o coro goliardico palesemente stonato o interrotto a metà." },
    { id: "tradimento", category: "malus", name: "Tradimento Accademico", points: -8, desc: "Parlare di argomenti di studio o esami futuri durante il momento del ballo." },
    { id: "crisi_diplomatica", category: "malus", name: "Crisi Diplomatica", points: -10, desc: "Discussione accesa o malinteso tra invitati che richiede l'intervento del festeggiato." },
    { id: "assente_annuario", category: "malus", name: "Assente all'Annuario", points: -8, desc: "Andarsene dalla festa prima di aver fatto la foto ufficiale con il capitano." }
];

let statoUtente = {
    uid: null,
    capitanoSelezionato: null,
    idSquadra: null,
    nomeSquadra: null,
    missioniApprovate: {},
    missioniInAttesa: {}
};

// --- INIZIO APP E GESTIONE VISTE ---
document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById('view-splash')) {
        inizializzaConfigurazione();
        avviaFlussoApplicazione();
    }
});

function cambiaVista(idVista) {
    const vistaAttiva = document.getElementById(idVista);
    if (!vistaAttiva) return;
    document.querySelectorAll('.view').forEach(v => {
        v.classList.remove('active');
        v.classList.add('hidden');
    });
    vistaAttiva.classList.remove('hidden');
    setTimeout(() => vistaAttiva.classList.add('active'), 50);
}

// RIPRISTINO NAVIGAZIONE TAB IN DASHBOARD (Risolve Problema 6)
function inizializzaTabDashboard() {
    document.querySelectorAll('.bottom-nav .nav-btn').forEach(bottone => {
        bottone.addEventListener('click', (e) => {
            // Rimuove stato attivo dai bottoni e nasconde i contenuti
            document.querySelectorAll('.bottom-nav .nav-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(tc => {
                tc.classList.remove('active');
                tc.classList.add('hidden');
            });

            // Attiva tab cliccata
            const targetTab = e.currentTarget.getAttribute('data-target');
            e.currentTarget.classList.add('active');
            const tabAttiva = document.getElementById(targetTab);
            if(tabAttiva) {
                tabAttiva.classList.remove('hidden');
                tabAttiva.classList.add('active');
            }
        });
    });
}

// --- FLUSSO PRINCIPALE (Risolve Problemi 3 e 4) ---
async function avviaFlussoApplicazione() {
    inizializzaTabDashboard(); // Riattiva la navigazione in basso

    setTimeout(async () => {
        try {
            const u = await autenticaUtenteAnonimo();
            statoUtente.uid = u.uid;
            
            const salvataggioSquadra = localStorage.getItem("fantalaurea_2026_team");
            const salvataggioCapitano = localStorage.getItem("fantalaurea_2026_capitano");

            if (salvataggioSquadra) {
                const dati = JSON.parse(salvataggioSquadra);
                statoUtente.idSquadra = dati.idSquadra;
                statoUtente.nomeSquadra = dati.nomeSquadra;
                statoUtente.capitanoSelezionato = dati.capitano || salvataggioCapitano;
                
                agganciaAscoltatoreSquadra(dati.idSquadra);
                attivaFeedEStatoGlobale();
                cambiaVista('view-dashboard');
            } else if (salvataggioCapitano) {
                statoUtente.capitanoSelezionato = salvataggioCapitano;
                document.getElementById('selected-captain-name').innerText = salvataggioCapitano;
                caricaTutteLeSquadreDelCapitano(salvataggioCapitano);
            } else {
                cambiaVista('view-welcome');
            }
        } catch (e) { 
            console.error(e);
            cambiaVista('view-welcome'); 
        }
    }, 1000);

    // GESTIONE BOTTONI BASE
    document.getElementById('btn-start').addEventListener('click', () => cambiaVista('view-rules'));
    document.getElementById('btn-continue-rules').addEventListener('click', () => { 
        generaGrigliaCapitani(); 
        cambiaVista('view-captains'); 
    });
    document.getElementById('btn-create-team').addEventListener('click', gestisciCreazioneSquadra);

    // TASTO CAMBIA CAPITANO (Risolve Problema 1)
    // Cerca un bottone specifico o il primo bottone dentro la vista squadre
    const btnCambiaCap = document.getElementById('btn-back-captains') || document.querySelector('#view-teams .btn-secondary');
    if (btnCambiaCap) {
        btnCambiaCap.addEventListener('click', () => {
            localStorage.removeItem("fantalaurea_2026_capitano"); // Dimentica la scelta
            generaGrigliaCapitani();
            cambiaVista('view-captains'); // Torna alla griglia
        });
    }
}

// --- CREAZIONE E CARICAMENTO SQUADRE (Risolve Problema 2) ---
function generaGrigliaCapitani() {
    const griglia = document.getElementById('captains-grid');
    griglia.innerHTML = '';
    CAPITANI.forEach(c => {
        const div = document.createElement('div');
        div.className = 'captain-card';
        div.innerHTML = `<div class="captain-avatar">🎓</div><div class="captain-name">${c}</div>`;
        div.onclick = () => selezionaCapitano(c);
        griglia.appendChild(div);
    });
}

async function selezionaCapitano(nome) {
    statoUtente.capitanoSelezionato = nome;
    localStorage.setItem("fantalaurea_2026_capitano", nome); // Salva memoria
    document.getElementById('selected-captain-name').innerText = nome;
    caricaTutteLeSquadreDelCapitano(nome);
}

function caricaTutteLeSquadreDelCapitano(nome) {
    cambiaVista('view-teams');
    const contenitore = document.getElementById('teams-list');
    contenitore.innerHTML = '<p class="text-center text-chiaro mt-1">Caricamento squadre in corso...</p>';
    
    caricaSquadrePerCapitano(nome, (squadre) => {
        contenitore.innerHTML = '';
        if(squadre.length === 0) {
            contenitore.innerHTML = '<p class="text-center text-chiaro mt-1">Nessuna squadra presente. Creane una tu!</p>';
            return;
        }
        squadre.forEach(sq => {
            const el = document.createElement('div');
            el.className = 'team-item';
            el.innerHTML = `<div>🔥 ${sq.nome}</div><div>${sq.membri} membri</div>`;
            el.onclick = () => gestisciAdesioneSquadra(sq.id, sq.nome);
            contenitore.appendChild(el);
        });
    });
}

// --- ADESIONE E CREAZIONE CON BLOCCO CARICAMENTO (Risolve Problema 7) ---
async function gestisciAdesioneSquadra(id, nome) {
    const salvataggio = localStorage.getItem("fantalaurea_2026_team");
    const datiSalvati = salvataggio ? JSON.parse(salvataggio) : null;

    // Se è già la tua squadra, entra subito senza interrogare Firebase
    if (datiSalvati && datiSalvati.idSquadra === id) {
        agganciaAscoltatoreSquadra(id);
        attivaFeedEStatoGlobale();
        cambiaVista('view-dashboard');
        return; 
    }

    // Blocca visivamente la lista per impedire click multipli
    const lista = document.getElementById('teams-list');
    lista.style.pointerEvents = "none";
    lista.style.opacity = "0.5";

    localStorage.setItem("fantalaurea_2026_team", JSON.stringify({
        idSquadra: id, 
        nomeSquadra: nome, 
        capitano: statoUtente.capitanoSelezionato
    }));
    
    try {
        await uniscitiASquadraEsistente(id);
        agganciaAscoltatoreSquadra(id);
        attivaFeedEStatoGlobale();
        cambiaVista('view-dashboard');
    } catch (e) { 
        alert("Errore di connessione: " + e.message); 
        lista.style.pointerEvents = "auto";
        lista.style.opacity = "1";
    }
}

async function gestisciCreazioneSquadra() {
    const btn = document.getElementById('btn-create-team');
    const input = document.getElementById('new-team-name');
    const nome = input.value.trim();
    
    if (!nome) return alert("Inserisci un nome valido per la tua squadra!");
    
    // Blocca il bottone e cambia testo ("Ci mette 100 anni")
    btn.disabled = true;
    const testoOriginale = btn.innerText;
    btn.innerText = "Creazione in corso...";

    try {
        const id = await creaNuovaSquadra(nome, statoUtente.capitanoSelezionato, statoUtente.uid);
        localStorage.setItem("fantalaurea_2026_team", JSON.stringify({
            idSquadra: id, 
            nomeSquadra: nome, 
            capitano: statoUtente.capitanoSelezionato
        }));
        
        agganciaAscoltatoreSquadra(id);
        attivaFeedEStatoGlobale();
        cambiaVista('view-dashboard');
        input.value = ''; // Pulisce il campo
    } catch (e) { 
        alert(e.message); 
        btn.disabled = false;
        btn.innerText = testoOriginale;
    }
}

// --- SINCRONIZZAZIONE DASHBOARD (Risolve Problema 4) ---
function agganciaAscoltatoreSquadra(idSquadra) {
    ascoltaDatiSquadra(idSquadra, (dati) => {
        if (!dati) return;
        
        document.getElementById('dash-team-name').innerText = dati.nome;
        
        // Recupera il nome del capitano sicuro da mostrare
        const nomeCapitanoReale = dati.capitano || statoUtente.capitanoSelezionato || localStorage.getItem("fantalaurea_2026_capitano");
        const elementoCapitano = document.getElementById('dash-captain-name');
        if (elementoCapitano) elementoCapitano.innerText = nomeCapitanoReale;
        
        document.getElementById('dash-team-score').innerText = dati.punteggio || 0;
        
        statoUtente.missioniApprovate = dati.missioniApprovate || {};
        statoUtente.missioniInAttesa = dati.missioniInAttesa || {};
        
        // Aggiorna totale missioni
        const totaleCompletate = Object.values(statoUtente.missioniApprovate).reduce((a, b) => a + b, 0);
        const elementoMissioni = document.getElementById('dash-missions-completed');
        if(elementoMissioni) elementoMissioni.innerText = totaleCompletate;

        renderizzaPannelloMissioni();
    });
}

// --- RENDERING COMPLETO MISSIONI (Risolve Problema 5) ---
function renderizzaPannelloMissioni() {
    const contenitore = document.getElementById('missions-container');
    if(!contenitore) return;
    contenitore.innerHTML = '';

    Object.keys(CATEGORIE).forEach(chiaveCategoria => {
        const sezione = document.createElement('div');
        sezione.className = 'category-section';
        sezione.innerHTML = `<h3 class="category-title">${CATEGORIE[chiaveCategoria]}</h3>`;
        
        const missioniFiltrate = MISSIONS.filter(m => m.category === chiaveCategoria);
        
        missioniFiltrate.forEach(m => {
            const card = document.createElement('div');
            card.className = `mission-card category-${chiaveCategoria}`;
            
            const countApprovati = statoUtente.missioniApprovate[m.id] || 0;
            const countInAttesa = statoUtente.missioniInAttesa[m.id] || 0;
            const segnoPunti = m.points > 0 ? `+${m.points}` : `${m.points}`;
            
            let htmlAzione = '';
            
            // Logica cumulabili vs standard
            if (m.cumulable) {
                htmlAzione = `
                    <div class="cumulable-counter">
                        <button class="counter-btn minus" data-id="${m.id}">-</button>
                        <span class="counter-value">${countApprovati}</span>
                        <button class="counter-btn plus" data-id="${m.id}">+</button>
                    </div>
                    ${countInAttesa > 0 ? `<span class="status-badge waiting">In attesa (+${countInAttesa}) ⏳</span>` : ''}
                `;
            } else {
                if (countApprovati > 0) {
                    htmlAzione = `<span class="status-badge approved">Completata ✅</span>`;
                } else if (countInAttesa > 0) {
                    htmlAzione = `<span class="status-badge waiting">In attesa ⏳</span>`;
                } else {
                    htmlAzione = `<button class="btn btn-primary btn-small btn-richiedi" data-id="${m.id}">Richiedi approvazione</button>`;
                }
            }

            card.innerHTML = `
                <div class="mission-header">
                    <span class="mission-name">${m.name}</span>
                    <span class="mission-points">${segnoPunti} pt</span>
                </div>
                <div class="mission-desc">${m.desc}</div>
                <div class="mission-footer">
                    ${htmlAzione}
                </div>
            `;

            // Aggancio click missioni
            if (!m.cumulable && countApprovati === 0 && countInAttesa === 0) {
                card.querySelector('.btn-richiedi').onclick = () => eseguiRichiesta(m.id, 1);
            } else if (m.cumulable) {
                card.querySelector('.plus').onclick = () => eseguiRichiesta(m.id, 1);
                card.querySelector('.minus').onclick = () => {
                    if (countInAttesa > 0) eseguiRichiesta(m.id, -1);
                    else alert("Non hai richieste in attesa da rimuovere.");
                };
            }
            
            sezione.appendChild(card);
        });
        contenitore.appendChild(sezione);
    });
}

async function eseguiRichiesta(idMissione, qta) {
    try {
        await inviaRichiestaMissione(statoUtente.idSquadra, statoUtente.nomeSquadra, statoUtente.capitanoSelezionato, idMissione, qta);
    } catch (e) { 
        alert("Errore nell'invio: " + e.message); 
    }
}

// --- GESTIONE FEED IN TEMPO REALE ---
function attivaFeedEStatoGlobale() {
    ascoltaFeedApprovazioni((notifiche) => {
        const c = document.getElementById('feed-container');
        if(!c) return;
        c.innerHTML = '';
        if (notifiche.length === 0) {
            c.innerHTML = `<p class="text-center text-chiaro mt-2">Il feed si aggiornerà in diretta!</p>`;
        }
        notifiche.forEach((n, i) => {
            if (i === 0 && (Date.now() - n.timestamp) < 10000) creaToastNotifica(n.squadra, n.missione);
            const el = document.createElement('div');
            el.className = 'feed-item';
            el.innerHTML = `🏆 <strong>"${n.squadra}"</strong> ha completato <strong>"${n.missione}"</strong>!`;
            c.appendChild(el);
        });
    });

    ascoltaStatoGiocoFinale((statoGioco) => {
        if (statoGioco && statoGioco.classificaPubblica) {
            mostraClassificaFinale(statoGioco.classificaCapitani, statoGioco.classificaSquadre);
        }
    });
}

function creaToastNotifica(nomeSq, nomeMis) {
    const c = document.getElementById('toast-container');
    if(!c) return;
    const b = document.createElement('div');
    b.className = 'toast-banner';
    b.innerHTML = `🏆 "${nomeSq}" ha completato "${nomeMis}"!`;
    c.appendChild(b);
    setTimeout(() => b.remove(), 5000);
}

function mostraClassificaFinale(capitani, squadre) {
    cambiaVista('view-final-leaderboard');
    // Rendering classifiche (aggiungi contenitori nel HTML se mancanti)
}
