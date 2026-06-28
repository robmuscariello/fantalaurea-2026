/* ==========================================================================
   FANTALAUREA ODONTOIATRIA 2026 - LOGICA DI GIOCO & INTERFACCIA UTENTE
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

// --- CONFIGURAZIONE CENTRALIZZATA DEL REGOLAMENTO ---
export const CAPITANI = [
    "Fabrizio", "Lorenzo", "Riccardo", "Sveva", 
    "Ferrantini", "Giada", "Federica", "Adriano"
];

export const CATEGORIE = {
    capitano: "🎓 Prove del Capitano",
    foto: "📸 Prove Fotografiche",
    goliardia: "🎉 Goliardia Universitaria",
    social: "📱 Social",
    speciali: "🌋 Speciali",
    malus: "💀 Malus"
};

export const MISSIONS = [
    // 🎓 PROVE DEL CAPITANO
    { id: "oratore", category: "capitano", name: "Oratore", points: 8, desc: "Discorso di laurea epico o ringraziamento commovente." },
    { id: "canto", category: "capitano", name: "Esame di Canto", points: 8, desc: "Il capitano deve intonare una canzone scelta dagli invitati." },
    { id: "gloria110", category: "capitano", name: "110 e Gloria", points: 20, desc: "Il capitano ottiene il massimo dei voti." },
    { id: "lacrime", category: "capitano", name: "Lacrime di Laurea", points: 10, desc: "Commozione pubblica e visibile del capitano durante la giornata." },
    { id: "ovazione", category: "capitano", name: "Ovazione Accademica", points: 8, desc: "Boato e applausi scroscianti alla proclamazione." },
    { id: "giglio", category: "capitano", name: "Giglio di Barra", points: 12, desc: "Festeggiamento folkloristico degno di nota." },
    { id: "saluti", category: "capitano", name: "Saluti da Casa", points: 6, desc: "Videochiamata di auguri con parenti lontani che non sono potuti venire." },
    { id: "prescelto", category: "capitano", name: "Il Prescelto", points: 8, desc: "Il docente fa un complimento personalizzato e fuori copione." },

    // 📸 PROVE FOTOGRAFICHE
    { id: "classe_completa", category: "foto", name: "La Classe al Completo", points: 8, desc: "Foto di gruppo con almeno 15 compagni di corso." },
    { id: "magnifici_otto", category: "foto", name: "I Magnifici Otto", points: 20, desc: "Foto di gruppo che ritrae contemporaneamente tutti gli 8 Capitani." },
    { id: "proclamazione_ufficiale", category: "foto", name: "Proclamazione Ufficiale", points: 10, desc: "Foto scattata nell'esatto istante della proclamazione." },
    { id: "calvizie", category: "foto", name: "Calvizie Honoris Causa", points: 5, desc: "Foto di gruppo con un professore o invitato palesemente calvo." },

    // 🎉 GOLIARDIA UNIVERSITARIA
    { id: "brindisi", category: "goliardia", name: "Il Brindisi", points: 5, desc: "Brindisi collettivo urlato a gran voce per il capitano." },
    { id: "brindisi_rima", category: "goliardia", name: "Bonus brindisi in rima", points: 3, desc: "Discorso di brindisi improvvisato interamente in rima baciata." },
    { id: "curva_sud", category: "goliardia", name: "Curva Sud", points: 8, desc: "Cori da stadio e saltelli coordinati per il festeggiato." },
    { id: "celebrita", category: "goliardia", name: "Momento Celebrità", points: 4, desc: "Selfie del capitano con un perfetto sconosciuto fuori dalla sessione." },
    { id: "scrocco", category: "goliardia", name: "Campioni nello Scrocco", points: 2, desc: "Bevi o mangi a sbafo da un vassoio di un'altra laurea.", cumulable: true },
    { id: "furto_corona", category: "goliardia", name: "Furto della Corona", points: 15, desc: "Indossare la corona d'alloro del capitano senza farsi scoprire per 5 minuti." },
    { id: "amici_sempre", category: "goliardia", name: "Amici da Sempre", points: 5, desc: "Abbraccio di gruppo con lacrimuccia tra vecchi compagni di scuola." },
    { id: "assemblea", category: "goliardia", name: "Assemblea Straordinaria", points: 15, desc: "Riunire almeno 20 persone in cerchio per cantare l'inno della facoltà." },

    // 📱 SOCIAL
    { id: "cronaca_gloria", category: "social", name: "Cronaca della Gloria", points: 5, desc: "Pubblicazione di una storia Instagram con tag ufficiale dell'evento." },
    { id: "risposte_auguri", category: "social", name: "Ogni risposta agli auguri", points: 1, desc: "Ogni storia ricondivisa dal capitano con ringraziamento.", cumulable: true },
    { id: "just_dance", category: "social", name: "Just Dance", points: 8, desc: "Video TikTok o Reel di un ballo di gruppo coreografato durante la festa." },

    // 🌋 SPECIALI
    { id: "ambasciatore", category: "speciali", name: "Ambasciatore Partenopeo", points: 5, desc: "Insegnare un'espressione dialettale napoletana a un invitato non campano." },
    { id: "no_vabbe", category: "speciali", name: "No Vabbè", points: 8, desc: "Esclamazione di stupore collettivo per una sorpresa inaspettata." },
    { id: "cuozzo", category: "speciali", name: "Modalità Cuozzo", points: 6, desc: "Atteggiamento o abbigliamento goliardico marcatamente tamarro sfoggiato alla festa." },

    // 💀 MALUS
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

// --- STATO DELL'APPLICAZIONE LOCALE ---
let statoUtente = {
    uid: null,
    capitanoSelezionato: null,
    idSquadra: null,
    nomeSquadra: null,
    missioniApprovate: {},  // Struttura: { idMissione: quantita }
    missioniInAttesa: {}    // Struttura: { idMissione: quantita }
};

// --- INIZIALIZZAZIONE AL CARICAMENTO ---
document.addEventListener("DOMContentLoaded", () => {
    // Controlla se siamo nell'index (l'utente) o nell'admin
    if (document.getElementById('view-splash')) {
        inizializzaConfigurazione();
        avviaFlussoApplicazione();
    }
});


// --- CONTROLLO DEL FLUSSO E NAVIGAZIONE (SPA) ---
// --- CONTROLLO DEL FLUSSO E NAVIGAZIONE (SPA) ---
function cambiaVista(idVista) {
    console.log("Cambio vista verso:", idVista);
    const vistaAttiva = document.getElementById(idVista);
    
    // Se non trova la vista, interrompe l'esecuzione e ti avvisa
    if (!vistaAttiva) {
        alert("Errore: Impossibile trovare la vista " + idVista);
        return;
    }

    // Nasconde tutte le altre
    document.querySelectorAll('.view').forEach(v => {
        v.classList.remove('active');
        v.classList.add('hidden');
    });

    // Mostra quella corretta
    vistaAttiva.classList.remove('hidden');
    // Piccolo ritardo per assicurare che il display flex venga resettato correttamente dal CSS
    setTimeout(() => vistaAttiva.classList.add('active'), 50);
}


function avviaFlussoApplicazione() {
    // 1. Gestione Splash Screen iniziale (2 secondi)
    setTimeout(async () => {
        try {
            // Autenticazione Anonima immediata in background
            const utenteAnonimo = await autenticaUtenteAnonimo();
            statoUtente.uid = utenteAnonimo.uid;

            // Controlla se l'utente possiede già una sessione/squadra salvata localmente nel browser
            const salvataggioLocale = localStorage.getItem("fantalaurea_2026_team");
            if (salvataggioLocale) {
                const datiSalvati = JSON.parse(salvataggioLocale);
                statoUtente.idSquadra = datiSalvati.idSquadra;
                statoUtente.nomeSquadra = datiSalvati.nomeSquadra;
                statoUtente.capitanoSelezionato = datiSalvati.capitano;
                
                // Salta direttamente alla Dashboard e aggancia l'ascoltatore in tempo reale
                agganciaAscoltatoreSquadra(statoUtente.idSquadra);
                attivaFeedEStatoGlobale();
                cambiaVista('view-dashboard');
            } else {
                // Primo accesso assoluto: procedi al Benvenuto
                cambiaVista('view-welcome');
            }
        } catch (errore) {
            console.error("Errore durante il setup dell'applicazione:", errore);
            cambiaVista('view-welcome');
        }
    }, 2000);

    // --- ASSOCIAZIONE EVENTI AI PULSANTI ---
    document.getElementById('btn-start').addEventListener('click', () => cambiaVista('view-rules'));
    
    document.getElementById('btn-continue-rules').addEventListener('click', () => {
        generaGrigliaCapitani();
        cambiaVista('view-captains');
    });

    document.getElementById('btn-back-captains').addEventListener('click', () => cambiaVista('view-captains'));
    
    document.getElementById('btn-create-team').addEventListener('click', gestisciCreazioneSquadra);

    // Navigazione a Tab della Dashboard
    document.querySelectorAll('.bottom-nav .nav-btn').forEach(bottone => {
        bottone.addEventListener('click', (e) => {
            document.querySelectorAll('.bottom-nav .nav-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(tc => {
                tc.classList.remove('active');
                tc.classList.add('hidden');
            });

            const targetTab = e.currentTarget.getAttribute('data-target');
            e.currentTarget.classList.add('active');
            
            const tabAttiva = document.getElementById(targetTab);
            tabAttiva.classList.remove('hidden');
            tabAttiva.classList.add('active');
        });
    });
}

// --- GENERAZIONE INTERFACCIA: SCELTA CAPITANO ---
function generaGrigliaCapitani() {
    const griglia = document.getElementById('captains-grid');
    griglia.innerHTML = '';

    CAPITANI.forEach(capitano => {
        const card = document.createElement('div');
        card.className = 'captain-card';
        card.innerHTML = `
            <div class="captain-avatar">🎓</div>
            <div class="captain-name">${capitano}</div>
        `;
        card.addEventListener('click', () => selezionaCapitano(capitano));
        griglia.appendChild(card);
    });
}

async function selezionaCapitano(nomeCapitano) {
    statoUtente.capitanoSelezionato = nomeCapitano;
    document.getElementById('selected-captain-name').innerText = nomeCapitano;
    cambiaVista('view-teams');
    
    // Caricamento in tempo reale delle squadre esistenti associate a quel capitano
    caricaSquadrePerCapitano(nomeCapitano, (squadre) => {
        const contenitoreListe = document.getElementById('teams-list');
        contenitoreListe.innerHTML = '';

        if (squadre.length === 0) {
            contenitoreListe.innerHTML = `<p class="text-center text-chiaro mt-1">Nessuna squadra presente per questo capitano. Creane una tu!</p>`;
            return;
        }

        squadre.forEach(squadra => {
            const elementoSquadra = document.createElement('div');
            elementoSquadra.className = 'team-item';
            elementoSquadra.innerHTML = `
                <div class="team-item-name">🔥 ${squadra.nome}</div>
                <div class="team-item-count">${squadra.membri} membri</div>
            `;
            elementoSquadra.onclick = () => gestisciAdesioneSquadra(squadra.id, squadra.nome));
            contenitoreListe.appendChild(elementoSquadra);
        });
    });
}

// --- OPERAZIONI DI CREAZIONE E ADESIONE SQUADRA ---
async function gestisciCreazioneSquadra() {
    const inputNome = document.getElementById('new-team-name');
    const nomeSquadra = inputNome.value.trim();

    if (!nomeSquadra) {
        alert("Inserisci un nome valido per la tua squadra!");
        return;
    }

    try {
        const idNuovaSquadra = await creaNuovaSquadra(nomeSquadra, statoUtente.capitanoSelezionato, statoUtente.uid);
        salvaSessioneUtente(idNuovaSquadra, nomeSquadra, statoUtente.capitanoSelezionato);
        
        agganciaAscoltatoreSquadra(idNuovaSquadra);
        attivaFeedEStatoGlobale();
        cambiaVista('view-dashboard');
    } catch (errore) {
        alert(errore.message);
    }
}

async function gestisciAdesioneSquadra(idSquadra, nomeSquadra) {
    console.log("Tentativo unione: " + nomeSquadra);

    // 1. Salvataggio immediato sul dispositivo (così non lo perdiamo)
    const datiUtente = { idSquadra: idSquadra, nomeSquadra: nomeSquadra };
    localStorage.setItem("fantalaurea_2026_team", JSON.stringify(datiUtente));

    // 2. Chiamata a Firebase
    try {
        await uniscitiASquadraEsistente(idSquadra);
        
        // 3. Caricamento forzato della Dashboard
        // Usiamo un piccolo timeout per dare tempo al browser di processare
        setTimeout(() => {
            cambiaVista('view-dashboard');
            agganciaAscoltatoreSquadra(idSquadra); // Questa funzione gestisce i dati in tempo reale
            attivaFeedEStatoGlobale();
        }, 100);

    } catch (e) {
        alert("Errore di connessione: " + e.message);
    }
}


function salvaSessioneUtente(idSquadra, nomeSquadra, capitano) {
    statoUtente.idSquadra = idSquadra;
    statoUtente.nomeSquadra = nomeSquadra;
    const datiSessione = { idSquadra, nomeSquadra, capitano };
    localStorage.setItem("fantalaurea_2026_team", JSON.stringify(datiSessione));
}

// --- AGGANCIO FLUSSI SINCRONIZZATI CON FIRESTORE ---
function agganciaAscoltatoreSquadra(idSquadra) {
    ascoltaDatiSquadra(idSquadra, (datiSquadra) => {
        if (!datiSquadra) return;
        
        // Aggiorna l'interfaccia dell'header fisso della dashboard
        document.getElementById('dash-team-name').innerText = datiSquadra.nome;
        document.getElementById('dash-captain-name').innerText = datiSquadra.capitano;
        document.getElementById('dash-team-score').innerText = datiSquadra.punteggio || 0;
        
        // Sincronizza lo stato locale delle missioni approvate e in attesa
        statoUtente.missioniApprovate = datiSquadra.missioniApprovate || {};
        statoUtente.missioniInAttesa = datiSquadra.missioniInAttesa || {};
        
        // Calcola il numero di missioni completate univoche o totali
        const totaleCompletate = Object.values(statoUtente.missioniApprovate).reduce((a, b) => a + b, 0);
        document.getElementById('dash-missions-completed').innerText = totaleCompletate;

        // Rigenera la lista delle missioni per riflettere i nuovi stati grafici
        renderizzaPannelloMissioni();
    });
}

function attivaFeedEStatoGlobale() {
    // Sincronizzazione del feed dei Toast di notifica in diretta
    ascoltaFeedApprovazioni((notifiche) => {
        const contenitoreFeed = document.getElementById('feed-container');
        contenitoreFeed.innerHTML = '';

        if (notifiche.length === 0) {
            contenitoreFeed.innerHTML = `<p class="text-center text-chiaro mt-2">Nessuna attività registrata. Il feed si aggiornerà in diretta!</p>`;
        }

        notifiche.forEach((notifica, index) => {
            // Mostra un banner Toast a comparsa solo per l'ultimo evento registrato in tempo reale
            if (index === 0 && (Date.now() - notifica.timestamp) < 10000) {
                creaToastNotifica(notifica.squadra, notifica.missione);
            }

            const elementoFeed = document.createElement('div');
            elementoFeed.className = 'feed-item';
            elementoFeed.innerHTML = `🏆 La squadra <strong>"${notifica.squadra}"</strong> ha completato con successo la missione <strong>"${notifica.missione}"</strong>!`;
            contenitoreFeed.appendChild(elementoFeed);
        });
    });

    // Controllo pubblicazione della classifica da parte dell'Admin
    ascoltaStatoGiocoFinale((statoGioco) => {
        if (statoGioco && statoGioco.classificaPubblica) {
            mostraClassificaFinale(statoGioco.classificaCapitani, statoGioco.classificaSquadre);
        }
    });

    // Copia statica delle regole all'interno della dashboard
    document.getElementById('dashboard-rules-container').innerHTML = document.querySelector('.rules-list').innerHTML;
}

// --- RENDERING DINAMICO PANNELLO MISSIONI UTENTE ---
function renderizzaPannelloMissioni() {
    const contenitoreMissions = document.getElementById('missions-container');
    contenitoreMissions.innerHTML = '';

    // Raggruppa le missioni per categoria di appartenenza
    Object.keys(CATEGORIE).forEach(chiaveCategoria => {
        const sezioneCategoria = document.createElement('div');
        sezioneCategoria.className = 'category-section';
        sezioneCategoria.innerHTML = `<h3 class="category-title">${CATEGORIE[chiaveCategoria]}</h3>`;

        const missioniFiltrate = MISSIONS.filter(m => m.category === chiaveCategoria);
        
        missioniFiltrate.forEach(missione => {
            const cardMissione = document.createElement('div');
            cardMissione.className = `mission-card category-${chiaveCategoria}`;
            
            const countApprovati = statoUtente.missioniApprovate[missione.id] || 0;
            const countInAttesa = statoUtente.missioniInAttesa[missione.id] || 0;

            // Header della Card con Punteggio
            const segnoPunti = missione.points > 0 ? `+${missione.points}` : `${missione.points}`;
            
            let bloccoAzione = '';

            if (missione.cumulable) {
                // Layout per missioni con contatore incrementale cumulabile
                bloccoAzione = `
                    <div class="cumulable-counter">
                        <button class="counter-btn minus" data-id="${missione.id}">-</button>
                        <span class="counter-value">${countApprovati}</span>
                        <button class="counter-btn plus" data-id="${missione.id}">+</button>
                    </div>
                    ${countInAttesa > 0 ? `<span class="status-badge waiting">In attesa (+${countInAttesa}) ⏳</span>` : ''}
                `;
            } else {
                // Layout standard (Approvata, In Attesa o Disponibile)
                if (countApprovati > 0) {
                    bloccoAzione = `<span class="status-badge approved">Completata ✅</span>`;
                } else if (countInAttesa > 0) {
                    bloccoAzione = `<span class="status-badge waiting">In attesa ⏳</span>`;
                } else {
                    bloccoAzione = `<button class="btn btn-primary btn-small btn-richiedi" data-id="${missione.id}">Richiedi approvazione</button>`;
                }
            }

            cardMissione.innerHTML = `
                <div class="mission-header">
                    <span class="mission-name">${missione.name}</span>
                    <span class="mission-points">${segnoPunti} pt</span>
                </div>
                <div class="mission-desc">${missione.desc}</div>
                <div class="mission-footer">
                    ${bloccoAzione}
                </div>
            `;

            // Aggancio eventi ai controlli generati all'interno della card
            if (!missione.cumulable && countApprovati === 0 && countInAttesa === 0) {
                cardMissione.querySelector('.btn-richiedi').addEventListener('click', () => {
                    eseguiRichiestaApprovazione(missione.id, 1);
                });
            } else if (missione.cumulable) {
                cardMissione.querySelector('.plus').addEventListener('click', () => {
                    eseguiRichiestaApprovazione(missione.id, 1); // Richiede un incremento (+1)
                });
                cardMissione.querySelector('.minus').addEventListener('click', () => {
                    if (countInAttesa > 0) {
                        eseguiRichiestaApprovazione(missione.id, -1); // Annulla una richiesta in attesa (-1)
                    } else {
                        alert("Non hai richieste in attesa da poter rimuovere.");
                    }
                });
            }

            sezioneCategoria.appendChild(cardMissione);
        });

        contenitoreMissions.appendChild(sezioneCategoria);
    });
}

async function eseguiRichiestaApprovazione(idMisione, variazione) {
    try {
        await inviaRichiestaMissione(statoUtente.idSquadra, statoUtente.nomeSquadra, statoUtente.capitanoSelezionato, idMisione, variazione);
    } catch (errore) {
        alert("Errore nell'invio della richiesta: " + errore.message);
    }
}

// --- CREAZIONE NOTIFICHE TOAST BANNER IN TEMPO REALE ---
function creaToastNotifica(nomeSquadra, nomeMissione) {
    const contenitoreToast = document.getElementById('toast-container');
    const banner = document.createElement('div');
    banner.className = 'toast-banner';
    banner.innerHTML = `🏆 La squadra <strong>"${nomeSquadra}"</strong><br>ha completato <strong>"${nomeMissione}"</strong>!`;
    
    contenitoreToast.appendChild(banner);
    
    // Auto-rimozione dal DOM al termine delle animazioni CSS
    setTimeout(() => {
        banner.remove();
    }, 5000);
}

// --- MOSTRA SCHERMATA FINALE CON CLASSIFICHE ---
function mostraClassificaFinale(classificaCapitani, classificaSquadre) {
    cambiaVista('view-final-leaderboard');
    
    // Renderizzazione della Classifica dei Capitani (dal punteggio minore al maggiore)
    const containerCapitani = document.getElementById('final-captains-list');
    containerCapitani.innerHTML = '';
    classificaCapitani.forEach((cap, index) => {
        const item = document.createElement('div');
        item.className = 'team-item';
        item.innerHTML = `<span>${index + 1}. 🎓 <strong>${cap.nome}</strong></span> <span class="text-gold font-bold">${cap.punteggio} pt</span>`;
        containerCapitani.appendChild(item);
    });

    // Renderizzazione della Classifica delle Squadre (dal punteggio minore al maggiore)
    const containerSquadre = document.getElementById('final-teams-list');
    containerSquadre.innerHTML = '';
    classificaSquadre.forEach((sq, index) => {
        const item = document.createElement('div');
        item.className = 'team-item';
        item.innerHTML = `<span>${index + 1}. 🔥 <strong>${sq.nome}</strong> (${sq.capitano})</span> <span class="text-gold font-bold">${sq.punteggio} pt</span>`;
        containerSquadre.appendChild(item);
    });
}
