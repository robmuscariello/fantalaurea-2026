/* ==========================================================================
   FANTALAUREA ODONTOIATRIA 2026 - FILE SCRIPT.JS DEFINITIVO
   ========================================================================== */

import {
    inizializzaConfigurazione,
    autenticaUtenteAnonimo,
    caricaSquadrePerCapitano,
    creaNuovaSquadra,
    uniscitiASquadraEsistente,
    ascoltaDatiSquadra,
    inviaRichiestaMissione,
    ascoltaFeedApprovazioni
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
    { id: "oratore", category: "capitano", name: "Oratore", points: 8, desc: "Discorso di laurea epico." },
    { id: "canto", category: "capitano", name: "Esame di Canto", points: 8, desc: "Canzone a scelta." },
    { id: "gloria110", category: "capitano", name: "110 e Gloria", points: 20, desc: "Massimo dei voti." },
    { id: "lacrime", category: "capitano", name: "Lacrime di Laurea", points: 10, desc: "Commozione pubblica." },
    { id: "ovazione", category: "capitano", name: "Ovazione Accademica", points: 8, desc: "Boato e applausi scroscianti." },
    { id: "giglio", category: "capitano", name: "Giglio di Barra", points: 12, desc: "Festeggiamento folkloristico." },
    { id: "saluti", category: "capitano", name: "Saluti da Casa", points: 6, desc: "Videochiamata con parenti." },
    { id: "prescelto", category: "capitano", name: "Il Prescelto", points: 8, desc: "Complimento docente fuori copione." },
    { id: "classe_completa", category: "foto", name: "La Classe al Completo", points: 8, desc: "Foto con almeno 15 compagni." },
    { id: "magnifici_otto", category: "foto", name: "I Magnifici Otto", points: 20, desc: "Foto con tutti gli 8 Capitani." },
    { id: "proclamazione_ufficiale", category: "foto", name: "Proclamazione Ufficiale", points: 10, desc: "Foto nell'istante della proclamazione." },
    { id: "calvizie", category: "foto", name: "Calvizie Honoris Causa", points: 5, desc: "Foto con prof/invitato calvo." },
    { id: "brindisi", category: "goliardia", name: "Il Brindisi", points: 5, desc: "Brindisi collettivo urlato." },
    { id: "brindisi_rima", category: "goliardia", name: "Bonus brindisi in rima", points: 3, desc: "Brindisi improvvisato in rima." },
    { id: "curva_sud", category: "goliardia", name: "Curva Sud", points: 8, desc: "Cori da stadio." },
    { id: "celebrita", category: "goliardia", name: "Momento Celebrità", points: 4, desc: "Selfie con uno sconosciuto." },
    { id: "scrocco", category: "goliardia", name: "Campioni nello Scrocco", points: 2, desc: "Scrocco cibo/bevande.", cumulable: true },
    { id: "furto_corona", category: "goliardia", name: "Furto della Corona", points: 15, desc: "Indossare corona d'alloro per 5 min." },
    { id: "amici_sempre", category: "goliardia", name: "Amici da Sempre", points: 5, desc: "Abbraccio di gruppo." },
    { id: "assemblea", category: "goliardia", name: "Assemblea Straordinaria", points: 15, desc: "20 persone per inno facoltà." },
    { id: "cronaca_gloria", category: "social", name: "Cronaca della Gloria", points: 5, desc: "Storia Instagram con tag." },
    { id: "risposte_auguri", category: "social", name: "Ogni risposta agli auguri", points: 1, desc: "Storia ricondivisa.", cumulable: true },
    { id: "just_dance", category: "social", name: "Just Dance", points: 8, desc: "Video ballo di gruppo." },
    { id: "ambasciatore", category: "speciali", name: "Ambasciatore Partenopeo", points: 5, desc: "Dialetto a non campani." },
    { id: "no_vabbe", category: "speciali", name: "No Vabbè", points: 8, desc: "Stupore collettivo." },
    { id: "cuozzo", category: "speciali", name: "Modalità Cuozzo", points: 6, desc: "Atteggiamento goliardico." },
    { id: "bocciato_orale", category: "malus", name: "Bocciato all'Orale", points: -10, desc: "Scena muta o gaffe." },
    { id: "politico18", category: "malus", name: "18 Politico", points: -15, desc: "Brindisi sotto tono." },
    { id: "ringraziamento_dimenticato", category: "malus", name: "Ringraziamento Dimenticato", points: -3, desc: "Dimenticare invitato importante.", cumulable: true },
    { id: "fuori_programma", category: "malus", name: "Fuori Programma", points: -10, desc: "Incidente logistico." },
    { id: "distrazione", category: "malus", name: "Distrazione", points: -5, desc: "Perdere oggetti personali." },
    { id: "disastro_mensa", category: "malus", name: "Disastro in Mensa", points: -4, desc: "Rovesciare cibo/bevande." },
    { id: "ritardatari", category: "malus", name: "Ritardatari", points: -2, desc: "Arrivare dopo l'orario.", cumulable: true },
    { id: "creativita_insufficiente", category: "malus", name: "Creatività Insufficiente", points: -5, desc: "Coro stonato." },
    { id: "tradimento", category: "malus", name: "Tradimento Accademico", points: -8, desc: "Parlare di esami." },
    { id: "crisi_diplomatica", category: "malus", name: "Crisi Diplomatica", points: -10, desc: "Discussione accesa." },
    { id: "assente_annuario", category: "malus", name: "Assente all'Annuario", points: -8, desc: "Andarsene prima della foto." }
];

let statoUtente = { uid: null, capitanoSelezionato: null, idSquadra: null, nomeSquadra: null, missioniApprovate: {}, missioniInAttesa: {} };

document.addEventListener("DOMContentLoaded", () => {
    inizializzaConfigurazione();
    avviaFlussoApplicazione();
});

function cambiaVista(idVista) {
    const vista = document.getElementById(idVista);
    if (!vista) return;
    document.querySelectorAll('.view').forEach(v => { v.classList.remove('active'); v.classList.add('hidden'); });
    vista.classList.remove('hidden');
    setTimeout(() => vista.classList.add('active'), 50);
}

async function avviaFlussoApplicazione() {
    setTimeout(async () => {
        try {
            const u = await autenticaUtenteAnonimo();
            statoUtente.uid = u.uid;
            const saved = localStorage.getItem("fantalaurea_2026_team");
            if (saved) {
                const d = JSON.parse(saved);
                statoUtente.idSquadra = d.idSquadra;
                statoUtente.nomeSquadra = d.nomeSquadra;
                agganciaAscoltatoreSquadra(d.idSquadra);
                attivaFeedEStatoGlobale();
                cambiaVista('view-dashboard');
            } else {
                cambiaVista('view-welcome');
            }
        } catch (e) { cambiaVista('view-welcome'); }
    }, 1000);

    // Gestione Eventi Bottoni
    document.getElementById('btn-start').addEventListener('click', () => cambiaVista('view-rules'));
    document.getElementById('btn-continue-rules').addEventListener('click', () => { generaGrigliaCapitani(); cambiaVista('view-captains'); });
    document.getElementById('btn-create-team').addEventListener('click', gestisciCreazioneSquadra);
}

function generaGrigliaCapitani() {
    const g = document.getElementById('captains-grid');
    g.innerHTML = '';
    CAPITANI.forEach(c => {
        const div = document.createElement('div');
        div.className = 'captain-card';
        div.innerHTML = `<div class="captain-avatar">🎓</div><div class="captain-name">${c}</div>`;
        div.onclick = () => selezionaCapitano(c);
        g.appendChild(div);
    });
}

async function selezionaCapitano(nome) {
    statoUtente.capitanoSelezionato = nome;
    document.getElementById('selected-captain-name').innerText = nome;
    cambiaVista('view-teams');
    caricaSquadrePerCapitano(nome, (s) => {
        const l = document.getElementById('teams-list');
        l.innerHTML = '';
        s.forEach(sq => {
            const el = document.createElement('div');
            el.className = 'team-item';
            el.innerHTML = `<div>🔥 ${sq.nome}</div><div>${sq.membri} membri</div>`;
            el.onclick = () => gestisciAdesioneSquadra(sq.id, sq.nome);
            l.appendChild(el);
        });
    });
}

async function gestisciAdesioneSquadra(idSquadra, nomeSquadra) {
    console.log("Tentativo di accesso alla squadra:", idSquadra); // Questo ti dice in console se il click funziona
    
    // 1. Salvo immediatamente il dato locale
    localStorage.setItem("fantalaurea_2026_team", JSON.stringify({idSquadra, nomeSquadra}));
    
    try {
        // 2. Forza subito il cambio vista (senza aspettare Firebase, così l'utente vede movimento)
        cambiaVista('view-dashboard');
        
        // 3. Eseguo la logica in background
        await uniscitiASquadraEsistente(idSquadra);
        agganciaAscoltatoreSquadra(idSquadra);
        attivaFeedEStatoGlobale();
        
        console.log("Successo: Utente entrato in squadra.");
    } catch (e) {
        console.error("Errore durante l'accesso alla squadra:", e);
        alert("Errore tecnico: " + e.message);
        // Se c'è errore, torno indietro alla lista squadre per permettere un nuovo tentativo
        cambiaVista('view-teams'); 
    }
}



async function gestisciCreazioneSquadra() {
    const btn = document.getElementById('btn-create-team');
    const nome = document.getElementById('new-team-name').value.trim();
    
    if (!nome) return alert("Inserisci un nome!");
    
    // Disabilito il bottone per evitare click multipli
    btn.disabled = true;
    const testoOriginale = btn.innerText;
    btn.innerText = "Creazione in corso...";

    try {
        const id = await creaNuovaSquadra(nome, statoUtente.capitanoSelezionato, statoUtente.uid);
        localStorage.setItem("fantalaurea_2026_team", JSON.stringify({idSquadra: id, nomeSquadra: nome}));
        agganciaAscoltatoreSquadra(id);
        attivaFeedEStatoGlobale();
        cambiaVista('view-dashboard');
    } catch (e) {
        alert("Errore: " + e.message);
        // In caso di errore, riabilito il bottone
        btn.disabled = false;
        btn.innerText = testoOriginale;
    }
}


function agganciaAscoltatoreSquadra(id) {
    ascoltaDatiSquadra(id, (d) => {
        if (!d) return;
        document.getElementById('dash-team-name').innerText = d.nome;
        document.getElementById('dash-team-score').innerText = d.punteggio || 0;
        statoUtente.missioniApprovate = d.missioniApprovate || {};
        statoUtente.missioniInAttesa = d.missioniInAttesa || {};
        renderizzaPannelloMissioni();
    });
}

function attivaFeedEStatoGlobale() {
    ascoltaFeedApprovazioni((notifiche) => {
        const c = document.getElementById('feed-container');
        if(!c) return;
        c.innerHTML = '';
        notifiche.forEach((n, i) => {
            if (i === 0 && (Date.now() - n.timestamp) < 10000) creaToastNotifica(n.squadra, n.missione);
            const el = document.createElement('div');
            el.className = 'feed-item';
            el.innerHTML = `🏆 <strong>"${n.squadra}"</strong> ha completato <strong>"${n.missione}"</strong>!`;
            c.appendChild(el);
        });
    });
}

function renderizzaPannelloMissioni() {
    const container = document.getElementById('missions-container');
    if(!container) return;
    container.innerHTML = '';
    Object.keys(CATEGORIE).forEach(cat => {
        const section = document.createElement('div');
        section.className = 'category-section';
        section.innerHTML = `<h3 class="category-title">${CATEGORIE[cat]}</h3>`;
        MISSIONS.filter(m => m.category === cat).forEach(m => {
            const card = document.createElement('div');
            card.className = 'mission-card';
            const count = statoUtente.missioniApprovate[m.id] || 0;
            const waiting = statoUtente.missioniInAttesa[m.id] || 0;
            
            card.innerHTML = `
                <div class="mission-name">${m.name} (${m.points} pt)</div>
                <div class="mission-desc">${m.desc}</div>
                <button class="btn-richiedi" data-id="${m.id}">${count > 0 ? 'Completata ✅' : (waiting > 0 ? 'In attesa ⏳' : 'Richiedi')}</button>
            `;
            if (count === 0 && waiting === 0) card.querySelector('.btn-richiedi').onclick = () => eseguiRichiesta(m.id);
            section.appendChild(card);
        });
        container.appendChild(section);
    });
}

async function eseguiRichiesta(id) {
    try {
        await inviaRichiestaMissione(statoUtente.idSquadra, statoUtente.nomeSquadra, statoUtente.capitanoSelezionato, id, 1);
        alert("Richiesta inviata!");
    } catch (e) { alert(e.message); }
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
