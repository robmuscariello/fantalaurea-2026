/* ==========================================================================
   FANTALAUREA ODONTOIATRIA 2026 — admin.js
   FIX: elimina squadra, preview classifica, lista missioni completate,
        gestione errori, tab navigazione robusta
   ========================================================================== */

window.IS_ADMIN_PAGE = true;

import {
    inizializzaConfigurazione,
    adminAscoltaTutteLeSquadre,
    adminAscoltaRichiesteInAttesa,
    adminEseguiApprovazione,
    adminEseguiRifiuto,
    adminAggiornaPunteggioDiretto,
    adminEliminaSquadra,
    adminPubblicaClassifica
} from './firebase.js';

import { MISSIONS, CAPITANI } from './script.js';

/* ------------------------------------------------------------------ */
/*  CONFIGURAZIONE                                                       */
/* ------------------------------------------------------------------ */

const ADMIN_PASSWORD = "Odonto2026"; // Cambia a tuo piacimento

/* ------------------------------------------------------------------ */
/*  STATO LOCALE                                                        */
/* ------------------------------------------------------------------ */

let tutteLeSquadre = [];

/* ------------------------------------------------------------------ */
/*  INIZIALIZZAZIONE                                                    */
/* ------------------------------------------------------------------ */

// --- INIZIALIZZAZIONE ---
// --- INIZIALIZZAZIONE SICURA ---
document.addEventListener("DOMContentLoaded", () => {
    // 1. Controlliamo se esiste l'elemento specifico del login admin
    const btnLogin = document.getElementById('btn-admin-login');

    if (!btnLogin) {
        // Se non siamo nella pagina Admin, usciamo immediatamente 
        console.log("App non rilevata come Pannello Admin, blocco esecuzione.");
        return;
    }

    // 2. Se siamo qui, il bottone esiste: avviamo tutto in sicurezza
    inizializzaConfigurazione();
    CONFIGURA_EVENTI_ADMIN();
    console.log("Pannello Admin caricato con successo!");
});




/* ------------------------------------------------------------------ */
/*  LOGIN E NAVIGAZIONE TAB                                             */
/* ------------------------------------------------------------------ */

function configuraEventiAdmin() {

    // Login
    const btnLogin = document.getElementById('btn-admin-login');
    const inputPwd = document.getElementById('admin-password');
    if (!btnLogin || !inputPwd) return;

    const doLogin = () => {
        if (inputPwd.value === ADMIN_PASSWORD) {
            document.getElementById('admin-view-login').classList.remove('active');
            document.getElementById('admin-view-login').classList.add('hidden');
            const pannello = document.getElementById('admin-view-panel');
            pannello.classList.remove('hidden');
            requestAnimationFrame(() => setTimeout(() => pannello.classList.add('active'), 30));
            avviaMonitoraggioLive();
        } else {
            alert("⚠️ Password errata! Accesso negato.");
            inputPwd.value = '';
            inputPwd.focus();
        }
    };

    btnLogin.addEventListener('click', doLogin);
    inputPwd.addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });

    // Navigazione tab admin
    document.querySelectorAll('.admin-nav .btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.admin-nav .btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            document.querySelectorAll('#admin-view-panel .tab-content').forEach(tc => {
                tc.style.display = 'none';
            });

            const target = document.getElementById(btn.dataset.target);
            if (target) target.style.display = 'block';

            // Aggiorna preview classifica ogni volta che si apre la tab "Fine Gioco"
            if (btn.dataset.target === 'admin-tab-control') renderizzaPreviewClassifica();
        });
    });

    // Pubblica classifica
    const btnPubblica = document.getElementById('btn-admin-publish');
    if (btnPubblica) btnPubblica.addEventListener('click', elaboraEPubblicaClassifiche);
}

/* ------------------------------------------------------------------ */
/*  MONITORAGGIO LIVE                                                   */
/* ------------------------------------------------------------------ */

function avviaMonitoraggioLive() {

    // ── RICHIESTE IN ATTESA ─────────────────────────────────────────
    adminAscoltaRichiesteInAttesa((richieste) => {
        const badge = document.getElementById('admin-count-requests');
        if (badge) badge.innerText = richieste.length;

        const c = document.getElementById('admin-requests-list');
        if (!c) return;
        c.innerHTML = '';

        if (richieste.length === 0) {
            c.innerHTML = `<p class="text-center text-chiaro mt-2">Nessuna richiesta in attesa. Goditi la festa! 🍹</p>`;
            return;
        }

        richieste.forEach(req => {
            const infoMissione = MISSIONS.find(m => m.id === req.idMissione);
            if (!infoMissione) return;

            const punti = infoMissione.points * req.variazione;
            const isMalus = infoMissione.category === 'malus';

            const card = document.createElement('div');
            card.className = `mission-card category-${infoMissione.category}`;
            card.innerHTML = `
                <div class="mission-header">
                    <span class="mission-name">
                        🔥 ${req.nomeSquadra}
                        <small style="font-weight:400; color:var(--testo-chiaro);">(${req.capitano})</small>
                    </span>
                    <span class="mission-points" style="${isMalus ? 'background:#FEE2E2;color:var(--malus)' : ''}">
                        ${punti > 0 ? '+' : ''}${punti} pt
                    </span>
                </div>
                <div class="mission-desc" style="margin-top:6px;">
                    <strong>${infoMissione.name}</strong><br>
                    <em>"${infoMissione.desc}"</em>
                </div>
                <div class="admin-card-action">
                    <button class="btn btn-approve btn-small">APPROVA ✅</button>
                    <button class="btn btn-reject  btn-small">RIFIUTA ❌</button>
                </div>
            `;

            card.querySelector('.btn-approve').addEventListener('click', async () => {
                card.style.opacity = '0.5';
                card.style.pointerEvents = 'none';
                try {
                    await adminEseguiApprovazione(
                        req.id, req.idSquadra, req.idMissione,
                        infoMissione.name, req.nomeSquadra,
                        req.variazione, punti
                    );
                } catch(e) { alert("Errore approvazione: " + e.message); }
            });

            card.querySelector('.btn-reject').addEventListener('click', async () => {
                card.style.opacity = '0.5';
                card.style.pointerEvents = 'none';
                try {
                    await adminEseguiRifiuto(req.id, req.idSquadra, req.idMissione, req.variazione);
                } catch(e) { alert("Errore rifiuto: " + e.message); }
            });

            c.appendChild(card);
        });
    });

    // ── TUTTE LE SQUADRE ────────────────────────────────────────────
    adminAscoltaTutteLeSquadre((squadre) => {
        tutteLeSquadre = squadre;
        renderizzaSquadreAdmin(squadre);
    });
}

/* ------------------------------------------------------------------ */
/*  RENDER SQUADRE (FIX PROBLEMI 7 & 8 & 9)                            */
/* ------------------------------------------------------------------ */

function renderizzaSquadreAdmin(squadre) {
    const c = document.getElementById('admin-teams-list');
    if (!c) return;
    c.innerHTML = '';

    if (squadre.length === 0) {
        c.innerHTML = `<p class="text-center text-chiaro mt-2">Nessuna squadra registrata.</p>`;
        return;
    }

    squadre.forEach((sq, index) => {
        const missioniCompletate = Object.entries(sq.missioniApprovate || {})
            .filter(([, v]) => v > 0)
            .map(([id, v]) => {
                const m = MISSIONS.find(x => x.id === id);
                return m ? `<li>${m.name}${v > 1 ? ` ×${v}` : ''}</li>` : '';
            }).join('');

        const card = document.createElement('div');
        card.className = 'card';
        card.style.cssText = 'padding:15px; margin-bottom:12px;';
        card.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
                <div>
                    <span style="font-weight:700; font-size:15px;">${medagliaPosto(index)} ${sq.nome}</span>
                    <br>
                    <small style="color:var(--testo-chiaro);">Capitano: ${sq.capitano} · ${sq.membri || 0} membri</small>
                </div>
                <span style="font-size:22px; font-weight:700; color:var(--oro-dark);">${sq.punteggio || 0} pt</span>
            </div>

            <!-- Missioni completate -->
            <details style="margin-top:10px;">
                <summary style="cursor:pointer; font-size:13px; color:var(--verde-laurea); font-weight:600;">
                    📋 Missioni completate (${Object.values(sq.missioniApprovate || {}).reduce((a,b)=>a+b,0)})
                </summary>
                <ul style="margin:8px 0 0 16px; font-size:13px; line-height:1.8; color:var(--testo-scuro);">
                    ${missioniCompletate || '<li><em>Nessuna ancora approvata.</em></li>'}
                </ul>
            </details>

            <!-- Correzione rapida punti -->
            <div class="quick-score-panel" style="margin-top:10px;">
                <span style="font-size:12px; flex:1; color:var(--testo-chiaro);">Correzione punti:</span>
                <input type="number" class="input-delta-punti" placeholder="+/- pt" step="1" style="width:80px; text-align:center;">
                <button class="btn btn-primary btn-small btn-assegna" style="width:auto;">Invia</button>
            </div>

            <!-- Elimina squadra -->
            <button class="btn btn-small btn-elimina-squadra" style="background:var(--malus); color:#fff; margin-top:8px; width:100%;">
                🗑️ Elimina Squadra
            </button>
        `;

        // Correzione punti
        card.querySelector('.btn-assegna').addEventListener('click', async () => {
            const input = card.querySelector('.input-delta-punti');
            const delta = parseInt(input.value, 10);
            if (isNaN(delta) || delta === 0) { alert("Inserisci un valore numerico valido."); return; }
            if (confirm(`Applicare ${delta > 0 ? '+' : ''}${delta} pt a "${sq.nome}"?`)) {
                try {
                    await adminAggiornaPunteggioDiretto(sq.id, delta);
                    input.value = '';
                } catch(e) { alert("Errore: " + e.message); }
            }
        });

        // Elimina squadra — FIX PROBLEMA 8
        card.querySelector('.btn-elimina-squadra').addEventListener('click', async () => {
            if (confirm(`⚠️ Eliminare definitivamente la squadra "${sq.nome}"?\nQuesta azione non è reversibile.`)) {
                try {
                    await adminEliminaSquadra(sq.id);
                } catch(e) { alert("Errore eliminazione: " + e.message); }
            }
        });

        c.appendChild(card);
    });
}

/* ------------------------------------------------------------------ */
/*  PREVIEW CLASSIFICA IN TEMPO REALE (FIX PROBLEMA 9)                 */
/* ------------------------------------------------------------------ */

function renderizzaPreviewClassifica() {
    const c = document.getElementById('admin-preview-classifica');
    if (!c) return;
    c.innerHTML = '';

    if (tutteLeSquadre.length === 0) {
        c.innerHTML = `<p class="text-center text-chiaro">Nessuna squadra.</p>`;
        return;
    }

    // Classifica capitani (aggregazione lato client)
    const mappaCapitani = {};
    CAPITANI.forEach(cap => mappaCapitani[cap] = 0);
    tutteLeSquadre.forEach(sq => {
        if (mappaCapitani[sq.capitano] !== undefined)
            mappaCapitani[sq.capitano] += (sq.punteggio || 0);
    });

    const classCapitani = Object.entries(mappaCapitani)
        .map(([nome, pt]) => ({ nome, punteggio: pt }))
        .sort((a, b) => b.punteggio - a.punteggio);

    // Render classifica capitani
    const h1 = document.createElement('h4');
    h1.className = 'title-green';
    h1.style.marginBottom = '8px';
    h1.textContent = '🎓 Classifica Capitani (Anteprima)';
    c.appendChild(h1);

    classCapitani.forEach((cap, i) => {
        const el = document.createElement('div');
        el.className = 'team-item';
        el.style.marginBottom = '6px';
        el.innerHTML = `
            <span>${medagliaPosto(i)} <strong>${cap.nome}</strong></span>
            <span class="text-gold font-bold">${cap.punteggio} pt</span>
        `;
        c.appendChild(el);
    });

    // Render classifica squadre
    const h2 = document.createElement('h4');
    h2.className = 'title-green';
    h2.style.cssText = 'margin-top:16px; margin-bottom:8px;';
    h2.textContent = '🔥 Classifica Squadre (Anteprima)';
    c.appendChild(h2);

    tutteLeSquadre.forEach((sq, i) => {
        const el = document.createElement('div');
        el.className = 'team-item';
        el.style.marginBottom = '6px';
        el.innerHTML = `
            <span>${medagliaPosto(i)} ${sq.nome} <small style="color:var(--testo-chiaro);">(${sq.capitano})</small></span>
            <span class="text-gold font-bold">${sq.punteggio || 0} pt</span>
        `;
        c.appendChild(el);
    });
}

/* ------------------------------------------------------------------ */
/*  PUBBLICA CLASSIFICA FINALE                                          */
/* ------------------------------------------------------------------ */

async function elaboraEPubblicaClassifiche() {
    if (tutteLeSquadre.length === 0) {
        alert("Nessuna squadra nel database.");
        return;
    }

    if (!confirm("⚠️ SEI SICURO?\nQuesta azione mostrerà le classifiche finali su tutti i telefoni degli invitati e bloccherà il gioco!")) return;

    const classificaSquadre = tutteLeSquadre.map(sq => ({
        nome: sq.nome,
        capitano: sq.capitano,
        punteggio: sq.punteggio || 0
    })).sort((a, b) => b.punteggio - a.punteggio);

    const mappaCapitani = {};
    CAPITANI.forEach(cap => mappaCapitani[cap] = 0);
    tutteLeSquadre.forEach(sq => {
        if (mappaCapitani[sq.capitano] !== undefined)
            mappaCapitani[sq.capitano] += (sq.punteggio || 0);
    });

    const classificaCapitani = Object.entries(mappaCapitani)
        .map(([nome, punteggio]) => ({ nome, punteggio }))
        .sort((a, b) => b.punteggio - a.punteggio);

    try {
        await adminPubblicaClassifica(classificaCapitani, classificaSquadre);
        const badge = document.getElementById('admin-game-status-badge');
        if (badge) {
            badge.textContent = "Classifiche Pubblicate 📢";
            badge.style.backgroundColor = "var(--oro)";
            badge.style.color = "#fff";
        }
        alert("🏆 Classifiche pubblicate con successo su tutti i dispositivi!");
    } catch(e) {
        alert("Errore pubblicazione: " + e.message);
    }
}

/* ------------------------------------------------------------------ */
/*  UTILITY                                                             */
/* ------------------------------------------------------------------ */

function medagliaPosto(i) {
    return ['🥇', '🥈', '🥉'][i] || `${i + 1}.`;
}
