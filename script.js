/* ==========================================================================
   FANTALAUREA ODONTOIATRIA 2026 — script.js
   FIX: dashboard vuota, tab, missioni, persistenza, membri idempotente
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

/* ------------------------------------------------------------------ */
/*  DATI COSTANTI                                                       */
/* ------------------------------------------------------------------ */

export const CAPITANI = ["Fabrizio", "Lorenzo", "Riccardo", "Sveva", "Ferrantini", "Giada", "Federica", "Adriano"];

export const CATEGORIE = {
    capitano:  "🎓 Prove del Capitano",
    foto:      "📸 Prove Fotografiche",
    goliardia: "🎉 Goliardia Universitaria",
    social:    "📱 Social",
    speciali:  "🌋 Speciali",
    malus:     "💀 Malus"
};

export const MISSIONS = [
    { id: "oratore",                category: "capitano",  name: "Oratore",                    points:  8,  desc: "Fai pronunciare al tuo capitano un discorso davanti ai presenti per celebrare il grande traguardo raggiunto" },
    { id: "canto",                  category: "capitano",  name: "Esame di Canto",              points:  8,  desc: "Il capitano deve intonare una canzone scelta dagli invitati, da solo insieme al resto della squadra" },
    { id: "gloria110",              category: "capitano",  name: "110 e Gloria",                points: 20,  desc: "Il capitano consegue il voto di laurea più alto tra i festeggiati della giornata." },
    { id: "lacrime",                category: "capitano",  name: "Lacrime di Laurea",           points: 10,  desc: "Riuscite a far emozionaee il vostro capitano fino a fargli versare almeno una lacrima" },
    { id: "ovazione",               category: "capitano",  name: "Ovazione Accademica",         points:  8,  desc: "Ottenete almeno 10 secondi consecutivi di applausi per il vostro capitano." },
    { id: "giglio",                 category: "capitano",  name: "Giglio di Barra",             points: 12,  desc: "Il vostro capitano viene sollevato e portato sulle spalle dai presenti duranre la festa" },
    { id: "saluti",                 category: "capitano",  name: "Saluti da Casa",              points:  6,  desc: "Fate ricevere al vostro capitano una telefonata o una videochiamata di congratulazioni dal un vostro familiare." },
    { id: "prescelto",              category: "capitano",  name: "Il Prescelto",                points:  8,  desc: "Convincete una persona estranea alla vostra squadra a gridare ad alta voce il nome del vostro capitano" },
    { id: "classe_completa",        category: "foto",      name: "La Classe al Completo",       points:  8,  desc: "Scattate una foto che ritragga contemporaneamente tutti i membri della vostra squadra" },
    { id: "magnifici_otto",         category: "foto",      name: "I Magnifici Otto",            points: 20,  desc: "Realizzate una foto nella quale siano presenti tutti e otto i capitani" },
    { id: "proclamazione_ufficiale",category: "foto",      name: "Proclamazione Ufficiale",     points: 10,  desc: "Qualcuno ha una foto del vostro capitano durante la proclamazione" },
    { id: "calvizie",               category: "foto",      name: "Calvizie Honoris Causa",      points:  5,  desc: "Trovate una persona calva e scattategli una foto." },
    { id: "brindisi",               category: "goliardia", name: "Il Brindisi",                 points:  5,  desc: "Brindisi collettivo urlato a gran voce per il capitano." },
    { id: "brindisi_rima",          category: "goliardia", name: "Bonus brindisi in rima",      points:  3,  desc: "Richiedi questo bonus se il brindisi è in rima." },
    { id: "curva_sud",              category: "goliardia", name: "Curva Sud",                   points:  8,  desc: "Fate partire un coro dedicato al vostro capitano e coinvolgete più persone possibili" },
    { id: "celebrita",              category: "goliardia", name: "Momento Celebrità",           points:  4,  desc: "Ottenete l'autografo di uno dei capitani sul braccio di un membro della vostra squadra." },
    { id: "scrocco",                category: "goliardia", name: "Campioni nello Scrocco",      points:  2,  desc: "Fatevi offrire una sigaretta o una terea da un capitano avversario senza rivelare la missione (+1 per ogni sigaretta scroccata).", cumulable: true },
    { id: "furto_corona",           category: "goliardia", name: "Furto della Corona",          points: 15,  desc: "Nascondete temporaneamente la corona d'alloro di un capirano avversario." },
    { id: "amici_sempre",           category: "goliardia", name: "Amici da Sempre",             points:  5,  desc: "Presentatevi a un capitano che non vi conosce fingendo cin naturalezza di essere amici da moltissimi anni." },
    { id: "assemblea",              category: "goliardia", name: "Assemblea Straordinaria",     points: 15,  desc: "Riunire tutte le squadre per partecipare a un brindisi collettivo." },
    { id: "cronaca_gloria",         category: "social",    name: "Cronaca della Gloria",        points:  5,  desc: "Pubblicate una storia instagram in cui siano visibili il capitano la corona e la tesi." },
    { id: "risposte_auguri",        category: "social",    name: "Ogni risposta agli auguri",   points:  1,  desc: "Ottenete +1punto per ogni risposta alla storia per fare gli auguri", cumulable: true },
    { id: "just_dance",             category: "social",    name: "Just Dance",                  points:  8,  desc: "Video TikTok/Reel di un ballo di gruppo coreografato." },
    { id: "ambasciatore",           category: "speciali",  name: "Ambasciatore Partenopeo",     points:  5,  desc: "Registrare un video in cui Fabrizio pronuncia la frase Forza Napoli." },
    { id: "no_vabbe",               category: "speciali",  name: "No Vabbè",                    points:  8,  desc: "Fate pronunciare a Riccardo l'esclamazione "no vabbè" per 5 volte senza fargli capire la missione" },
    { id: "cuozzo",                 category: "speciali",  name: "Modalità Cuozzo",             points:  6,  desc: "Registrate un video in cui Lorenzo dice spontaneamente la parola cucciola." },
    { id: "bocciato_orale",         category: "malus",     name: "Bocciato all'Orale",          points:-10,  desc: "il vostro capitano rifiuta di partecipare a una sfida proposta dalla squadra" },
    { id: "politico18",             category: "malus",     name: "18 Politico",                 points:-15,  desc: "Il vostro capitano consegue il voto più basso tra i festeggiati" },
    { id: "ringraziamento_dimenticato", category: "malus", name: "Ringraziamento Dimenticato",  points: -3,  desc: "un membro della squadra non viene nominato nei ringraziamenti! (-1 per ogni persona della squadra dimenticata).", cumulable: true },
    { id: "fuori_programma",        category: "malus",     name: "Fuori Programma",             points:-10,  desc: "un membro della squadra vomita durante i festeggiamenti" },
    { id: "distrazione",            category: "malus",     name: "Distrazione",                 points: -5,  desc: "il vostro capitano utilizza il telefono durante lo svolgimento di una prova." },
    { id: "disastro_mensa",         category: "malus",     name: "Disastro in Mensa",           points: -4,  desc: "un membro della squadra rovescia accidentalmente cibo o bevande durante la festa.", cumulable: true },
    { id: "ritardatari",            category: "malus",     name: "Ritardatari",                 points: -2,  desc: "un membro della squadra arriva in ritardo alla festa (-1 per ogni persona che arriva in ritardo).", cumulable: true },
    { id: "creativita_insufficiente",category:"malus",     name: "Creatività Insufficiente",    points: -5,  desc: "la squadra sceglie un nome poco originale o privo di fantasia." },
    { id: "tradimento",             category: "malus",     name: "Tradimento Accademico",       points: -8,  desc: "un membro della squadra compare nella foto ufficiale di una squadra avversaria" },
    { id: "crisi_diplomatica",      category: "malus",     name: "Crisi Diplomatica",           points:-10,  desc: "un membro della squadra da origine a una discussione o litigio durante i festeggiamenti" },
    { id: "assente_annuario",       category: "malus",     name: "Assente all'Annuario",        points: -8,  desc: "la squadra dimentics di scattare la foto di gruppo insieme al proprio capitano." }
];

/* ------------------------------------------------------------------ */
/*  STATO GLOBALE                                                       */
/* ------------------------------------------------------------------ */

let statoUtente = {
    uid: null,
    capitanoSelezionato: null,
    idSquadra: null,
    nomeSquadra: null,
    missioniApprovate: {},
    missioniInAttesa: {}
};

let unsubscribeSquadra = null;
let unsubscribeFeed = null;
let unsubscribeStatoGioco = null;

/* ------------------------------------------------------------------ */
/*  AVVIO                                                               */
/* ------------------------------------------------------------------ */

// --- 1. INIZIALIZZAZIONE E GESTIONE GLOBALE CLICK ---
document.addEventListener("DOMContentLoaded", () => {
    // PROTEZIONE: se siamo nella pagina admin, blocchiamo lo script giocatore
    if (window.location.pathname.includes("admin.html")) {
        console.log("Script giocatore disattivato: siamo nel pannello Admin.");
        return; // Esce e non esegue nient'altro
    }

    // Se non siamo in admin, avviamo normalmente
    inizializzaConfigurazione();
    impostaAscoltatoriGlobali();
    avviaFlussoApplicazione();

    
    // Il resto del tuo codice originale rimane INVARIATO qui sotto
    inizializzaConfigurazione();
    // ... (il resto del tuo codice)
});

/* ------------------------------------------------------------------ */
/*  CAMBIO VISTA                                                        */
/* ------------------------------------------------------------------ */

function cambiaVista(idVista) {
    document.querySelectorAll('.view').forEach(v => {
        v.classList.remove('active');
        v.classList.add('hidden');
    });
    const el = document.getElementById(idVista);
    if (el) {
        el.classList.remove('hidden');
        // Micro-delay per permettere il repaint prima dell'animazione CSS
        requestAnimationFrame(() => setTimeout(() => el.classList.add('active'), 30));
    }
}

/* ------------------------------------------------------------------ */
/*  EVENT DELEGATION GLOBALE                                            */
/* ------------------------------------------------------------------ */

function impostaAscoltatoriGlobali() {
    document.body.addEventListener('click', (e) => {

        // ── NAVIGAZIONE TAB DASHBOARD ──────────────────────────────
        const navBtn = e.target.closest('.nav-btn');
        if (navBtn && navBtn.dataset.target) {
            document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
            navBtn.classList.add('active');
            mostraTab(navBtn.dataset.target);
            return;
        }

        // ── PULSANTI FLUSSO PRINCIPALE ─────────────────────────────
        if (e.target.closest('#btn-start'))           { cambiaVista('view-welcome-rules'); return; }
        if (e.target.closest('#btn-continue-rules'))  { generaGrigliaCapitani(); cambiaVista('view-captains'); return; }
        if (e.target.closest('#btn-back-captains') || e.target.closest('.btn-cambia-capitano')) {
            localStorage.removeItem("fantalaurea_2026_capitano");
            statoUtente.capitanoSelezionato = null;
            generaGrigliaCapitani();
            cambiaVista('view-captains');
            return;
        }
        if (e.target.closest('#btn-create-team')) {
            gestisciCreazioneSquadra();
            return;
        }

        // ── MISSIONI ───────────────────────────────────────────────
        const btnRichiedi = e.target.closest('.btn-richiedi');
        if (btnRichiedi) { eseguiRichiesta(btnRichiedi.dataset.id, 1); return; }

        const btnPlus = e.target.closest('.btn-plus');
        if (btnPlus) { eseguiRichiesta(btnPlus.dataset.id, 1); return; }

        const btnMinus = e.target.closest('.btn-minus');
        if (btnMinus) {
            const inAttesa = statoUtente.missioniInAttesa[btnMinus.dataset.id] || 0;
            if (inAttesa > 0) eseguiRichiesta(btnMinus.dataset.id, -1);
            else mostraToast("Nessuna richiesta in attesa da annullare.");
            return;
        }
    });
}

/* ------------------------------------------------------------------ */
/*  GESTIONE TAB NELLA DASHBOARD                                        */
/* ------------------------------------------------------------------ */

function mostraTab(idTab) {
    document.querySelectorAll('#dashboard-content .tab-content').forEach(tc => {
        tc.style.display = 'none';
    });
    const tab = document.getElementById(idTab);
    if (tab) tab.style.display = 'block';

    // Popola il regolamento quando viene aperto
    if (idTab === 'tab-rules') renderizzaRegolamentiTab();
}

/* ------------------------------------------------------------------ */
/*  AVVIO APP E PERSISTENZA                                             */
/* ------------------------------------------------------------------ */

async function avviaFlussoApplicazione() {
    // Mostra splash 1.5s
    setTimeout(async () => {
        try {
            const u = await autenticaUtenteAnonimo();
            if (u) statoUtente.uid = u.uid;
        } catch(e) {
            console.warn("Auth fallita, continuo offline.");
        }

        const salvataggioSquadra   = localStorage.getItem("fantalaurea_2026_team");
        const salvataggioCapitano  = localStorage.getItem("fantalaurea_2026_capitano");

        if (salvataggioSquadra) {
            try {
                const dati = JSON.parse(salvataggioSquadra);
                statoUtente.idSquadra          = dati.idSquadra;
                statoUtente.nomeSquadra        = dati.nomeSquadra;
                statoUtente.capitanoSelezionato = dati.capitano || salvataggioCapitano;

                cambiaVista('view-dashboard');
                // Prima mostra tab missioni
                mostraTab('tab-missions');
                aggiornaInterfacciaDashboardBase(
                    statoUtente.nomeSquadra,
                    '…',
                    statoUtente.capitanoSelezionato
                );
                // Poi aggiorna con dati reali
                agganciaAscoltatoreSquadra(dati.idSquadra);
                attivaFeedEStatoGlobale();
            } catch(e) {
                localStorage.clear();
                cambiaVista('view-welcome');
            }
        } else if (salvataggioCapitano) {
            selezionaCapitano(salvataggioCapitano);
        } else {
            cambiaVista('view-welcome');
        }
    }, 1500);
}

/* ------------------------------------------------------------------ */
/*  CAPITANI E SQUADRE                                                  */
/* ------------------------------------------------------------------ */

function generaGrigliaCapitani() {
    const griglia = document.getElementById('captains-grid');
    if (!griglia) return;
    griglia.innerHTML = '';
    CAPITANI.forEach(c => {
        const div = document.createElement('div');
        div.className = 'captain-card';
        div.innerHTML = `<div class="captain-avatar">🎓</div><div class="captain-name">${c}</div>`;
        div.addEventListener('click', () => selezionaCapitano(c));
        griglia.appendChild(div);
    });
}

function selezionaCapitano(nome) {
    statoUtente.capitanoSelezionato = nome;
    localStorage.setItem("fantalaurea_2026_capitano", nome);
    const el = document.getElementById('selected-captain-name');
    if (el) el.innerText = nome;
    cambiaVista('view-teams');
    caricaSquadreDelCapitano(nome);
}

function caricaSquadreDelCapitano(nome) {
    const contenitore = document.getElementById('teams-list');
    if (!contenitore) return;
    contenitore.innerHTML = '<p class="text-center text-chiaro mt-1">Carico le squadre…</p>';

    caricaSquadrePerCapitano(nome, (squadre) => {
        contenitore.innerHTML = '';
        if (!squadre || squadre.length === 0) {
            contenitore.innerHTML = '<p class="text-center text-chiaro mt-1">Nessuna squadra ancora. Creane una!</p>';
            return;
        }
        squadre.forEach(sq => {
            const el = document.createElement('div');
            el.className = 'team-item';
            el.innerHTML = `
                <div class="team-item-name">🔥 ${sq.nome}</div>
                <div class="team-item-count">${sq.membri} membri</div>
            `;
            el.addEventListener('click', () => gestisciAdesioneSquadra(sq.id, sq.nome));
            contenitore.appendChild(el);
        });
    });
}

/* ------------------------------------------------------------------ */
/*  ADESIONE / CREAZIONE SQUADRA                                        */
/* ------------------------------------------------------------------ */

async function gestisciAdesioneSquadra(id, nome) {
    statoUtente.idSquadra   = id;
    statoUtente.nomeSquadra = nome;

    localStorage.setItem("fantalaurea_2026_team", JSON.stringify({
        idSquadra: id,
        nomeSquadra: nome,
        capitano: statoUtente.capitanoSelezionato
    }));

    aggiornaInterfacciaDashboardBase(nome, '…', statoUtente.capitanoSelezionato);
    cambiaVista('view-dashboard');
    mostraTab('tab-missions');

    try {
        // FIX PROBLEMA 3: idempotente — non incrementa se già membro
        await uniscitiASquadraEsistente(id, statoUtente.uid);
        agganciaAscoltatoreSquadra(id);
        attivaFeedEStatoGlobale();
    } catch(e) {
        console.error("Errore adesione:", e);
    }
}

async function gestisciCreazioneSquadra() {
    const input = document.getElementById('new-team-name');
    if (!input) return;
    const nome = input.value.trim();
    if (!nome) { alert("Scrivi un nome per la squadra!"); return; }

    const btn = document.getElementById('btn-create-team');
    if (btn) btn.disabled = true;

    try {
        const id = await creaNuovaSquadra(nome, statoUtente.capitanoSelezionato, statoUtente.uid);

        statoUtente.idSquadra   = id;
        statoUtente.nomeSquadra = nome;

        localStorage.setItem("fantalaurea_2026_team", JSON.stringify({
            idSquadra: id,
            nomeSquadra: nome,
            capitano: statoUtente.capitanoSelezionato
        }));

        aggiornaInterfacciaDashboardBase(nome, 0, statoUtente.capitanoSelezionato);
        cambiaVista('view-dashboard');
        mostraTab('tab-missions');

        agganciaAscoltatoreSquadra(id);
        attivaFeedEStatoGlobale();
        input.value = '';
    } catch(e) {
        alert("Errore: " + e.message);
    } finally {
        if (btn) btn.disabled = false;
    }
}

/* ------------------------------------------------------------------ */
/*  DASHBOARD                                                           */
/* ------------------------------------------------------------------ */

function aggiornaInterfacciaDashboardBase(nomeSquadra, punteggio, capitano) {
    const elNome     = document.getElementById('dash-team-name');
    const elPunti    = document.getElementById('dash-team-score');
    const elCapitano = document.getElementById('dash-captain-name');

    if (elNome)     elNome.innerText     = nomeSquadra || "La tua Squadra";
    if (elPunti)    elPunti.innerText    = (punteggio !== undefined && punteggio !== null) ? punteggio : "0";
    if (elCapitano) elCapitano.innerText = capitano   || "Capitano";
}

function agganciaAscoltatoreSquadra(idSquadra) {
    // Rimuovi eventuale listener precedente
    if (unsubscribeSquadra) unsubscribeSquadra();

    unsubscribeSquadra = ascoltaDatiSquadra(idSquadra, (dati) => {
        if (!dati) return;

        aggiornaInterfacciaDashboardBase(
            dati.nome,
            dati.punteggio || 0,
            dati.capitano || statoUtente.capitanoSelezionato
        );

        statoUtente.missioniApprovate = dati.missioniApprovate || {};
        statoUtente.missioniInAttesa  = dati.missioniInAttesa  || {};

        // Conta totale missioni completate (somma di tutte le quantità approvate)
        const totMissioni = Object.values(statoUtente.missioniApprovate)
            .reduce((acc, v) => acc + (v || 0), 0);
        const elM = document.getElementById('dash-missions-completed');
        if (elM) elM.innerText = totMissioni;

        // FIX PROBLEMA 5 & 6: ri-renderizza le missioni ad ogni aggiornamento Firebase
        renderizzaPannelloMissioni();
    });
}

/* ------------------------------------------------------------------ */
/*  RENDER MISSIONI (FIX PROBLEMI 5 & 6)                               */
/* ------------------------------------------------------------------ */

function renderizzaPannelloMissioni() {
    const contenitore = document.getElementById('missions-container');
    if (!contenitore) return;
    contenitore.innerHTML = '';

    Object.keys(CATEGORIE).forEach(chiave => {
        const sezione = document.createElement('div');
        sezione.className = 'category-section';

        const titolo = document.createElement('h3');
        titolo.className = 'category-title';
        titolo.textContent = CATEGORIE[chiave];
        sezione.appendChild(titolo);

        MISSIONS.filter(m => m.category === chiave).forEach(m => {
            const completate = statoUtente.missioniApprovate[m.id] || 0;
            const inAttesa   = statoUtente.missioniInAttesa[m.id]  || 0;
            const segno      = m.points > 0 ? `+${m.points}` : `${m.points}`;

            let bloccoAzioni = '';

            if (m.cumulable) {
                // Missione cumulabile: mostra +/- e stato
                bloccoAzioni = `
                    <div class="cumulable-controls">
                        <div class="cumulable-counter">
                            <button class="counter-btn btn-minus" data-id="${m.id}" aria-label="Rimuovi">−</button>
                            <span class="counter-value">${completate}</span>
                            <button class="counter-btn btn-plus"  data-id="${m.id}" aria-label="Aggiungi">+</button>
                        </div>
                        ${inAttesa > 0 ? `<span class="status-badge waiting">Attesa +${inAttesa} ⏳</span>` : ''}
                    </div>
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

            const card = document.createElement('div');
            card.className = `mission-card category-${chiave}`;
            card.innerHTML = `
                <div class="mission-header">
                    <span class="mission-name">${m.name}</span>
                    <span class="mission-points">${segno} pt</span>
                </div>
                <p class="mission-desc">${m.desc}</p>
                <div class="mission-footer">${bloccoAzioni}</div>
            `;
            sezione.appendChild(card);
        });

        contenitore.appendChild(sezione);
    });
}

/* ------------------------------------------------------------------ */
/*  RENDER REGOLAMENTO NELLA TAB                                        */
/* ------------------------------------------------------------------ */

function renderizzaRegolamentiTab() {
    const c = document.getElementById('dashboard-rules-container');
    if (!c || c.dataset.loaded) return;
    c.dataset.loaded = '1';
    c.innerHTML = `
        <ul class="rules-list">
            <li>Scegli un Capitano e crea o entra in una squadra.</li>
            <li>Completa le missioni durante la giornata.</li>
            <li>Alcune missioni richiedono l'approvazione dell'organizzatore.</li>
            <li>Le missioni cumulabili possono essere completate più volte.</li>
            <li>I Malus decurtano i punti della squadra.</li>
            <li>La classifica resterà nascosta fino alla fine della festa.</li>
        </ul>
    `;
}

/* ------------------------------------------------------------------ */
/*  INVIO RICHIESTE MISSIONE                                            */
/* ------------------------------------------------------------------ */

async function eseguiRichiesta(idMissione, qta) {
    if (!statoUtente.idSquadra) { alert("Errore: nessuna squadra trovata."); return; }
    try {
        await inviaRichiestaMissione(
            statoUtente.idSquadra,
            statoUtente.nomeSquadra,
            statoUtente.capitanoSelezionato,
            idMissione,
            qta
        );
    } catch(e) {
        alert("Errore invio: " + e.message);
    }
}

/* ------------------------------------------------------------------ */
/*  FEED LIVE & STATO GLOBALE                                           */
/* ------------------------------------------------------------------ */

function attivaFeedEStatoGlobale() {
    if (unsubscribeFeed) unsubscribeFeed();

    unsubscribeFeed = ascoltaFeedApprovazioni((notifiche) => {
        const c = document.getElementById('feed-container');
        if (!c) return;
        c.innerHTML = '';

        if (!notifiche || notifiche.length === 0) {
            c.innerHTML = `<p class="text-center text-chiaro mt-2">Nessuna attività recente. Sii il primo!</p>`;
            return;
        }

        notifiche.forEach((n, i) => {
            // Toast solo per l'evento più recente (< 10 secondi)
            if (i === 0 && n.timestamp && (Date.now() - n.timestamp) < 10000) {
                creaToastNotifica(n.squadra, n.missione);
            }
            const el = document.createElement('div');
            el.className = 'feed-item';
            el.innerHTML = `🏆 <strong>"${n.squadra}"</strong> ha completato <strong>"${n.missione}"</strong>!`;
            c.appendChild(el);
        });
    });

    if (unsubscribeStatoGioco) unsubscribeStatoGioco();
    unsubscribeStatoGioco = ascoltaStatoGiocoFinale((stato) => {
        if (stato && stato.classificaPubblica) {
            mostraClassificaFinale(stato);
        }
    });
}

function mostraClassificaFinale(stato) {
    const elCap  = document.getElementById('final-captains-list');
    const elSq   = document.getElementById('final-teams-list');
    if (elCap) {
        elCap.innerHTML = '';
        (stato.classificaCapitani || []).forEach((c, i) => {
            const el = document.createElement('div');
            el.className = 'team-item';
            el.innerHTML = `<span>${medaglia(i)} ${c.nome}</span><span class="text-gold font-bold">${c.punteggio} pt</span>`;
            elCap.appendChild(el);
        });
    }
    if (elSq) {
        elSq.innerHTML = '';
        (stato.classificaSquadre || []).forEach((s, i) => {
            const el = document.createElement('div');
            el.className = 'team-item';
            el.innerHTML = `<span>${medaglia(i)} ${s.nome} <small>(${s.capitano})</small></span><span class="text-gold font-bold">${s.punteggio} pt</span>`;
            elSq.appendChild(el);
        });
    }
    cambiaVista('view-final-leaderboard');
}

function medaglia(i) {
    return ['🥇', '🥈', '🥉'][i] || `${i + 1}.`;
}

/* ------------------------------------------------------------------ */
/*  TOAST                                                               */
/* ------------------------------------------------------------------ */

function creaToastNotifica(nomeSq, nomeMis) {
    const c = document.getElementById('toast-container');
    if (!c) return;
    const b = document.createElement('div');
    b.className = 'toast-banner';
    b.innerHTML = `🏆 <strong>"${nomeSq}"</strong> ha completato <strong>"${nomeMis}"</strong>!`;
    c.appendChild(b);
    setTimeout(() => b.remove(), 5000);
}

function mostraToast(testo) {
    const c = document.getElementById('toast-container');
    if (!c) return;
    const b = document.createElement('div');
    b.className = 'toast-banner';
    b.textContent = testo;
    c.appendChild(b);
    setTimeout(() => b.remove(), 3000);
}
