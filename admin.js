/* ==========================================================================
   FANTALAUREA ODONTOIATRIA 2026 - LOGICA REVERSIBILE PANNELLO REGIA (ADMIN)
   ========================================================================== */

import {
    inizializzaConfigurazione,
    adminAscoltaTutteLeSquadre,
    adminAscoltaRichiesteInAttesa,
    adminEseguiApprovazione,
    adminEseguiRifiuto,
    adminAggiornaPunteggioDiretto,
    adminPubblicaClassifica
} from './firebase.js';

import { MISSIONS } from './script.js';

// --- CONFIGURAZIONE SICUREZZA ---
const ADMIN_PASSWORD_CORRETTA = "Odonto2026"; // Roberta, puoi cambiare questa password a tuo piacimento

// --- STATO LOCALE ADMIN ---
let tutteLeSquadre = [];

// --- INIZIALIZZAZIONE ---
document.addEventListener("DOMContentLoaded", () => {
    inizializzaConfigurazione();
    CONFIGURA_EVENTI_ADMIN();
});

// --- GESTIONE ACCESSO E NAVIGAZIONE TAB ---
function CONFIGURA_EVENTI_ADMIN() {
    const btnLogin = document.getElementById('btn-admin-login');
    const inputPassword = document.getElementById('admin-password');

    // Controllo Password di Accesso
    btnLogin.addEventListener('click', () => {
        if (inputPassword.value === ADMIN_PASSWORD_CORRETTA) {
            document.getElementById('admin-view-login').classList.remove('active');
            document.getElementById('admin-view-login').classList.add('hidden');
            
            const pannelloAdmin = document.getElementById('admin-view-panel');
            pannelloAdmin.classList.remove('hidden');
            setTimeout(() => pannelloAdmin.classList.add('active'), 50);

            // Avvia i flussi di ascolto sincronizzati solo dopo il login superato
            AVVIA_MONITORAGGIO_LIVE();
        } else {
            alert("⚠️ Password errata! Accesso negato.");
            inputPassword.value = "";
        }
    });

    // Navigazione tra le Tab interne del pannello di controllo
    document.querySelectorAll('.admin-nav .btn').forEach(bottone => {
        bottone.addEventListener('click', (e) => {
            document.querySelectorAll('.admin-nav .btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('#admin-view-panel .tab-content').forEach(tc => {
                tc.classList.remove('active');
                tc.classList.add('hidden');
            });

            e.currentTarget.classList.add('active');
            const targetTab = e.currentTarget.getAttribute('data-target');
            
            const tabAttiva = document.getElementById(targetTab);
            tabAttiva.classList.remove('hidden');
            tabAttiva.classList.add('active');
        });
    });

    // Gestione Chiusura Gioco e Pubblicazione Classifiche
    document.getElementById('btn-admin-publish').addEventListener('click', ELABORA_E_PUBBLICA_CLASSIFICHE);
}

// --- ATTIVAZIONE FLUSSI REAL-TIME ---
function AVVIA_MONITORAGGIO_LIVE() {
    
    // 1. Ascolto in tempo reale delle Richieste in Sospeso
    adminAscoltaRichiesteInAttesa((richieste) => {
        // Aggiorna il contatore numerico sul pulsante della barra di navigazione
        document.getElementById('admin-count-requests').innerText = richieste.length;
        
        const contenitoreRichieste = document.getElementById('admin-requests-list');
        contenitoreRichieste.innerHTML = '';

        if (richieste.length === 0) {
            contenitoreRichieste.innerHTML = `<p class="text-center text-chiaro mt-2">Nessuna richiesta in attesa. Goditi la festa! 🍹</p>`;
            return;
        }

        richieste.forEach(req => {
            // Recupera l'oggetto missione corrispondente per estrarre dettagli e punteggio base
            const infoMissione = MISSIONS.find(m => m.id === req.idMissione);
            if (!infoMissione) return;

            // Calcolo effettivo dei punti in base alla variazione della richiesta (es. +1 o -1)
            const puntiTotaliRichiesta = infoMissione.points * req.variazione;

            const card = document.createElement('div');
            card.className = `mission-card category-${infoMissione.category}`;
            card.innerHTML = `
                <div class="mission-header">
                    <span class="mission-name">🔥 ${req.nomeSquadra} <small style="font-weight:400; color:var(--testo-chiaro);">(${req.capitano})</small></span>
                    <span class="mission-points ${infoMissione.category === 'malus' ? 'bg-red' : ''}">
                        ${puntiTotaliRichiesta > 0 ? `+${puntiTotaliRichiesta}` : puntiTotaliRichiesta} pt
                    </span>
                </div>
                <div class="mission-desc" style="margin-top:5px;">
                    <strong>Missione richiesta:</strong> ${infoMissione.name}<br>
                    <span style="font-style:italic;">"${infoMissione.desc}"</span>
                </div>
                <div class="admin-card-action">
                    <button class="btn btn-approve btn-small btn-action-approve" data-id="${req.id}">APPROVA ✅</button>
                    <button class="btn btn-reject btn-small btn-action-reject" data-id="${req.id}">RIFIUTA ❌</button>
                </div>
            `;

            // Assegnazione logica ai pulsanti di azione della card
            card.querySelector('.btn-action-approve').addEventListener('click', async () => {
                await adminEseguiApprovazione(
                    req.id, 
                    req.idSquadra, 
                    req.idMissione, 
                    infoMissione.name, 
                    req.nomeSquadra, 
                    req.variazione, 
                    puntiTotaliRichiesta
                );
            });

            card.querySelector('.btn-action-reject').addEventListener('click', async () => {
                await adminEseguiRifiuto(req.id, req.idSquadra, req.idMissione, req.variazione);
            });

            contenitoreRichieste.appendChild(card);
        });
    });

    // 2. Ascolto in tempo reale delle Squadre per la Tab di Correzione/Classifica Nascosta
    adminAscoltaTutteLeSquadre((squadre) => {
        tutteLeSquadre = squadre; // Aggiorna la variabile globale d'appoggio per il calcolo finale
        
        const contenitoreSquadre = document.getElementById('admin-teams-list');
        contenitoreSquadre.innerHTML = '';

        squadre.forEach((sq, index) => {
            const cardSq = document.createElement('div');
            cardSq.className = 'card';
            cardSq.style.padding = '15px';
            cardSq.innerHTML = `
                <div style="display:flex; justify-content:space-between; font-weight:600;">
                    <span>${index + 1}. ${sq.nome} <small style="font-weight:400; color:var(--testo-chiaro);">(${sq.capitano})</small></span>
                    <span class="text-gold">${sq.punteggio || 0} pt</span>
                </div>
                <div class="quick-score-panel">
                    <span style="font-size:12px; flex:1;">Correzione rapida punti:</span>
                    <input type="number" class="input-delta-punti" placeholder="+/- Punti" step="1">
                    <button class="btn btn-primary btn-small btn-assegna-diretto" style="width:auto;">Invia</button>
                </div>
            `;

            // Gestione dell'assegnazione o sottrazione arbitraria di punti manuali
            cardSq.querySelector('.btn-assegna-diretto').addEventListener('click', async () => {
                const input = cardSq.querySelector('.input-delta-punti');
                const delta = parseInt(input.value, 10);
                
                if (isNaN(delta) || delta === 0) {
                    alert("Inserisci un valore numerico valido positivo o negativo.");
                    return;
                }

                if (confirm(`Confermi di voler applicare una variazione di ${delta} punti alla squadra "${sq.nome}"?`)) {
                    await adminAggiornaPunteggioDiretto(sq.id, delta);
                    input.value = "";
                }
            });

            contenitoreSquadre.appendChild(cardSq);
        });
    });
}

// --- ALGORITMO DI CHIUSURA GIOCO E AGGREGAZIONE DATI ---
async function ELABORA_E_PUBBLICA_CLASSIFICHE() {
    if (tutteLeSquadre.length === 0) {
        alert("Impossibile chiudere il gioco: non sono presenti squadre registrate nel database.");
        return;
    }

    if (!confirm("⚠️ SEI SICURO?\nQuesta azione interromperà il gioco per tutti e pubblicherà le classifiche finali sui telefoni degli invitati!")) {
        return;
    }

    // 1. Elaborazione Classifica Squadre (Ordinamento decrescente per punteggio)
    const classificaSquadreFinali = tutteLeSquadre.map(sq => ({
        nome: sq.nome,
        capitano: sq.capitano,
        punteggio: sq.punteggio || 0
    })).sort((a, b) => b.punteggio - a.punteggio);

    // 2. Elaborazione Classifica Capitani (Aggregazione matematica dei punteggi di tutte le loro squadre)
    const mappaCapitani = {};
    
    // Inizializzazione di sicurezza di tutti i capitani a 0 punti per mostrare anche chi non ha ricevuto squadre
    const CAPITANI_LISTA = ["Fabrizio", "Lorenzo", "Riccardo", "Sveva", "Ferrantini", "Giada", "Federica", "Adriano"];
    CAPITANI_LISTA.forEach(cap => mappaCapitani[cap] = 0);

    // Somma dei contributi di ciascuna squadra al proprio capitano di riferimento
    tutteLeSquadre.forEach(sq => {
        if (mappaCapitani[sq.capitano] !== undefined) {
            mappaCapitani[sq.capitano] += (sq.punteggio || 0);
        }
    });

    // Trasformazione della mappa in array strutturato e ordinamento decrescente
    const classificaCapitaniFinali = Object.keys(mappaCapitani).map(nomeCapitano => ({
        nome: nomeCapitano,
        punteggio: mappaCapitani[nomeCapitano]
    })).sort((a, b) => b.punteggio - a.punteggio);

    try {
        // 3. Spinta dei risultati su Cloud Firestore (Sbloccherà le viste finali di tutti i client connessi)
        await adminPubblicaClassifica(classificaCapitaniFinali, classificaSquadreFinali);
        
        // Aggiorna l'interfaccia visiva dell'admin per confermare l'avvenuto blocco
        const badgeStato = document.getElementById('admin-game-status-badge');
        badgeStato.innerText = "Classifiche Pubblicate 📢";
        badgeStato.style.backgroundColor = "var(--oro)";
        badgeStato.style.color = "var(--bianco)";
        
        alert("🏆 Classifiche finali calcolate e pubblicate con successo su tutti i dispositivi!");
    } catch (errore) {
        alert("Errore durante la pubblicazione della classifica: " + errore.message);
    }
}
