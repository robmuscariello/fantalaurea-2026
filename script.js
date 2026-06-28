/* ==========================================================================
   FANTALAUREA ODONTOIATRIA 2026 - SCRIPT.JS DEFINITIVO E ANTI-BLOCCO
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

// --- 1. INIZIALIZZAZIONE E GESTIONE GLOBALE CLICK ---
document.addEventListener("DOMContentLoaded", () => {
    inizializzaConfigurazione();
    impostaAscoltatoriGlobali();
    avviaFlussoApplicazione();
});

function cambiaVista(idVista) {
    document.querySelectorAll('.view').forEach(v => {
        v.classList.remove('active');
        v.classList.add('hidden');
    });
    const vistaAttiva = document.getElementById(idVista);
    if (vistaAttiva) {
        vistaAttiva.classList.remove('hidden');
        // Piccolo ritardo per permettere al browser di renderizzare
        setTimeout(() => vistaAttiva.classList.add('active'), 50);
    }
}

// QUESTA FUNZIONE RISOLVE I PROBLEMI DEI TASTI CHE NON FUNZIONANO (Tab, Cambia Capitano, ecc)
function impostaAscoltatoriGlobali() {
    document.body.addEventListener('click', (e) => {
        
        // GESTIONE NAVIGAZIONE TAB IN BASSO (Problema 4)
        const navBtn = e.target.closest('.nav-btn');
        if (navBtn) {
            const targetTabId = navBtn.getAttribute('data-target');
            if (targetTabId) {
                // Rimuove active da tutti i bottoni e lo mette a quello cliccato
                document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
                navBtn.classList.add('active');
                
                // Nasconde tutte le tab e mostra quella giusta
                document.querySelectorAll('.tab-content').forEach(tc => {
                    tc.classList.remove('active');
                    tc.classList.add('hidden');
                });
                
                const tabDaMostrare = document.getElementById(targetTabId);
                if (tabDaMostrare) {
                    tabDaMostrare.classList.remove('hidden');
                    tabDaMostrare.classList.add('active');
                }
            }
        }

        // TASTO CAMBIA CAPITANO (Problema 5)
        const btnCambiaCap = e.target.closest('#btn-back-captains') || e.target.closest('.btn-cambia-capitano');
        if (btnCambiaCap) {
            localStorage.removeItem("fantalaurea_2026_capitano");
            statoUtente.capitanoSelezionato = null;
            generaGrigliaCapitani();
            cambiaVista('view-captains');
        }

        // TASTO INIZIA
        if (e.target.closest('#btn-start')) cambiaVista('view-rules');
        
        // TASTO CONTINUA DOPO REGOLE
        if (e.target.closest('#btn-continue-rules')) {
            generaGrigliaCapitani();
            cambiaVista('view-captains');
        }

        // TASTO CREA SQUADRA
        if (e.target.closest('#btn-create-team')) {
            gestisciCreazioneSquadra(e.target.closest('#btn-create-team'));
        }

        // AZIONI MISSIONI (+, -, Richiedi)
        if (e.target.closest('.btn-richiedi')) {
            eseguiRichiesta(e.target.closest('.btn-richiedi').getAttribute('data-id'), 1);
        }
        if (e.target.closest('.plus')) {
            eseguiRichiesta(e.target.closest('.plus').getAttribute('data-id'), 1);
        }
        if (e.target.closest('.minus')) {
            const id = e.target.closest('.minus').getAttribute('data-id');
            const inAttesa = statoUtente.missioniInAttesa[id] || 0;
            if (inAttesa > 0) eseguiRichiesta(id, -1);
            else alert("Non hai richieste in attesa da annullare per questa missione.");
        }
    });
}

// --- 2. AVVIO APP E MEMORIA ---
async function avviaFlussoApplicazione() {
    try {
        const u = await autenticaUtenteAnonimo();
        if(u) statoUtente.uid = u.uid;
        
        const salvataggioSquadra = localStorage.getItem("fantalaurea_2026_team");
        const salvataggioCapitano = localStorage.getItem("fantalaurea_2026_capitano");

        if (salvataggioSquadra) {
            const dati = JSON.parse(salvataggioSquadra);
            statoUtente.idSquadra = dati.idSquadra;
            statoUtente.nomeSquadra = dati.nomeSquadra;
            statoUtente.capitanoSelezionato = dati.capitano || salvataggioCapitano;
            
            // Imposta subito dati base per evitare pagina vuota (Problema 3)
            aggiornaInterfacciaDashboardBase(statoUtente.nomeSquadra, 0, statoUtente.capitanoSelezionato);
            
            cambiaVista('view-dashboard');
            agganciaAscoltatoreSquadra(dati.idSquadra);
            attivaFeedEStatoGlobale();
        } else if (salvataggioCapitano) {
            selezionaCapitano(salvataggioCapitano);
        } else {
            cambiaVista('view-welcome');
        }
    } catch (e) { 
        console.error("Errore autenticazione:", e);
        cambiaVista('view-welcome'); 
    }
}

// --- 3. GESTIONE CAPITANI E SQUADRE ---
function generaGrigliaCapitani() {
    const griglia = document.getElementById('captains-grid');
    if (!griglia) return;
    griglia.innerHTML = '';
    CAPITANI.forEach(c => {
        const div = document.createElement('div');
        div.className = 'captain-card';
        div.innerHTML = `<div class="captain-avatar">🎓</div><div class="captain-name">${c}</div>`;
        // Usiamo un listener diretto qui perché è generato dinamicamente
        div.addEventListener('click', () => selezionaCapitano(c));
        griglia.appendChild(div);
    });
}

function selezionaCapitano(nome) {
    statoUtente.capitanoSelezionato = nome;
    localStorage.setItem("fantalaurea_2026_capitano", nome);
    
    const elName = document.getElementById('selected-captain-name');
    if(elName) elName.innerText = nome;
    
    cambiaVista('view-teams');
    caricaTutteLeSquadreDelCapitano(nome);
}

function caricaTutteLeSquadreDelCapitano(nome) {
    const contenitore = document.getElementById('teams-list');
    if (!contenitore) return;
    contenitore.innerHTML = '<p class="text-center text-chiaro mt-1">Cerco le squadre...</p>';
    
    caricaSquadrePerCapitano(nome, (squadre) => {
        contenitore.innerHTML = '';
        if(!squadre || squadre.length === 0) {
            contenitore.innerHTML = '<p class="text-center text-chiaro mt-1">Nessuna squadra presente. Creane una tu!</p>';
            return;
        }
        squadre.forEach(sq => {
            const el = document.createElement('div');
            el.className = 'team-item';
            el.innerHTML = `<div>🔥 ${sq.nome}</div><div>${sq.membri} membri</div>`;
            el.addEventListener('click', () => gestisciAdesioneSquadra(sq.id, sq.nome));
            contenitore.appendChild(el);
        });
    });
}

// --- 4. ADESIONE/CREAZIONE VELOCI (Risolve Problema 2 e 7) ---
async function gestisciAdesioneSquadra(id, nome) {
    // 1. Salva subito e cambia vista in un millisecondo
    localStorage.setItem("fantalaurea_2026_team", JSON.stringify({
        idSquadra: id, 
        nomeSquadra: nome, 
        capitano: statoUtente.capitanoSelezionato
    }));
    
    statoUtente.idSquadra = id;
    statoUtente.nomeSquadra = nome;
    
    aggiornaInterfacciaDashboardBase(nome, "...", statoUtente.capitanoSelezionato);
    cambiaVista('view-dashboard');
    
    // 2. Lavora in background con Firebase
    try {
        await uniscitiASquadraEsistente(id);
        agganciaAscoltatoreSquadra(id);
        attivaFeedEStatoGlobale();
    } catch (e) {
        console.error("Errore adesione background:", e);
    }
}

async function gestisciCreazioneSquadra(btnElement) {
    const input = document.getElementById('new-team-name');
    if (!input) return;
    const nome = input.value.trim();
    
    if (!nome) {
        alert("Scrivi un nome per la squadra!");
        return;
    }
    
    // Blocca il bottone e cambia vista subito
    if(btnElement) btnElement.disabled = true;
    
    try {
        const id = await creaNuovaSquadra(nome, statoUtente.capitanoSelezionato, statoUtente.uid);
        localStorage.setItem("fantalaurea_2026_team", JSON.stringify({
            idSquadra: id, 
            nomeSquadra: nome, 
            capitano: statoUtente.capitanoSelezionato
        }));
        
        statoUtente.idSquadra = id;
        statoUtente.nomeSquadra = nome;
        
        aggiornaInterfacciaDashboardBase(nome, "...", statoUtente.capitanoSelezionato);
        cambiaVista('view-dashboard');
        
        agganciaAscoltatoreSquadra(id);
        attivaFeedEStatoGlobale();
        input.value = ''; 
    } catch (e) { 
        alert("Errore creazione: " + e.message); 
    } finally {
        if(btnElement) btnElement.disabled = false;
    }
}

// --- 5. AGGIORNAMENTO DASHBOARD (Risolve Problema 3) ---
function aggiornaInterfacciaDashboardBase(nomeSquadra, punteggio, capitano) {
    const elNomeSq = document.getElementById('dash-team-name');
    const elPunti = document.getElementById('dash-team-score');
    const elCapitano = document.getElementById('dash-captain-name');
    
    if (elNomeSq) elNomeSq.innerText = nomeSquadra || "La tua Squadra";
    if (elPunti) elPunti.innerText = punteggio !== undefined ? punteggio : "0";
    if (elCapitano) elCapitano.innerText = capitano || "Capitano";
}

function agganciaAscoltatoreSquadra(idSquadra) {
    ascoltaDatiSquadra(idSquadra, (dati) => {
        if (!dati) return;
        
        // Aggiorna interfaccia con dati reali da Firebase
        aggiornaInterfacciaDashboardBase(dati.nome, dati.punteggio || 0, dati.capitano || statoUtente.capitanoSelezionato);
        
        statoUtente.missioniApprovate = dati.missioniApprovate || {};
        statoUtente.missioniInAttesa = dati.missioniInAttesa || {};
        
        // Calcolo missioni completate
        const totaleCompletate = Object.values(statoUtente.missioniApprovate).reduce((a, b) => a + b, 0);
        const elMissCompletate = document.getElementById('dash-missions-completed');
        if(elMissCompletate) elMissCompletate.innerText = totaleCompletate;

        renderizzaPannelloMissioni();
    });
}

// --- 6. RENDER MISSIONI E FEED ---
function renderizzaPannelloMissioni() {
    const contenitore = document.getElementById('missions-container');
    if(!contenitore) return;
    contenitore.innerHTML = '';

    Object.keys(CATEGORIE).forEach(chiave => {
        const sezione = document.createElement('div');
        sezione.className = 'category-section';
        sezione.innerHTML = `<h3 class="category-title">${CATEGORIE[chiave]}</h3>`;
        
        const missioniCat = MISSIONS.filter(m => m.category === chiave);
        
        missioniCat.forEach(m => {
            const card = document.createElement('div');
            card.className = `mission-card category-${chiave}`;
            
            const completate = statoUtente.missioniApprovate[m.id] || 0;
            const inAttesa = statoUtente.missioniInAttesa[m.id] || 0;
            const segno = m.points > 0 ? `+${m.points}` : `${m.points}`;
            
            let bloccoAzioni = '';
            
            if (m.cumulable) {
                bloccoAzioni = `
                    <div class="cumulable-counter">
                        <button class="counter-btn minus" data-id="${m.id}">-</button>
                        <span class="counter-value">${completate}</span>
                        <button class="counter-btn plus" data-id="${m.id}">+</button>
                    </div>
                    ${inAttesa > 0 ? `<span class="status-badge waiting">Attesa (+${inAttesa}) ⏳</span>` : ''}
                `;
            } else {
                if (completate > 0) {
                    bloccoAzioni = `<span class="status-badge approved">Completata ✅</span>`;
                } else if (inAttesa > 0) {
                    bloccoAzioni = `<span class="status-badge waiting">In attesa ⏳</span>`;
                } else {
                    bloccoAzioni = `<button class="btn btn-primary btn-small btn-richiedi" data-id="${m.id}">Richiedi</button>`;
                }
            }

            card.innerHTML = `
                <div class="mission-header">
                    <span class="mission-name">${m.name}</span>
                    <span class="mission-points">${segno} pt</span>
                </div>
                <div class="mission-desc">${m.desc}</div>
                <div class="mission-footer">${bloccoAzioni}</div>
            `;
            sezione.appendChild(card);
        });
        contenitore.appendChild(sezione);
    });
}

async function eseguiRichiesta(idMissione, qta) {
    if (!statoUtente.idSquadra) return alert("Errore: Nessuna squadra trovata.");
    try {
        await inviaRichiestaMissione(statoUtente.idSquadra, statoUtente.nomeSquadra, statoUtente.capitanoSelezionato, idMissione, qta);
    } catch (e) { 
        alert("Errore invio richiesta: " + e.message); 
    }
}

function attivaFeedEStatoGlobale() {
    ascoltaFeedApprovazioni((notifiche) => {
        const c = document.getElementById('feed-container');
        if(!c) return;
        c.innerHTML = '';
        if (!notifiche || notifiche.length === 0) {
            c.innerHTML = `<p class="text-center text-chiaro mt-2">Nessuna attività recente. Sii il primo!</p>`;
            return;
        }
        notifiche.forEach((n, i) => {
            if (i === 0 && (Date.now() - n.timestamp) < 10000) creaToastNotifica(n.squadra, n.missione);
            const el = document.createElement('div');
            el.className = 'feed-item';
            el.innerHTML = `🏆 <strong>"${n.squadra}"</strong> ha completato <strong>"${n.missione}"</strong>!`;
            c.appendChild(el);
        });
    });
}

function creaToastNotifica(nomeSq, nomeMis) {
    const c = document.getElementById('toast-container');
    if(!c) return;
    const b = document.createElement('div');
    b.className = 'toast-banner';
    b.innerHTML = `🏆 "${nomeSq}" ha completato "${nomeMis}"!`;
    c.appendChild(b);
    setTimeout(() => b.remove(), 4000);
}
