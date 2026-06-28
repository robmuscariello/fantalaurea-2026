/* ==========================================================================
   FANTALAUREA ODONTOIATRIA 2026 - CONFIGURAZIONE E STRATO DATI FIRESTORE
   ========================================================================== */

// Importazione degli SDK Firebase ufficiali in formato modulo tramite CDN certificata
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { 
    getAuth, 
    signInAnonymously 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { 
    getFirestore, 
    doc, 
    collection, 
    setDoc, 
    addDoc, 
    updateDoc, 
    getDocs, 
    query, 
    where, 
    orderBy, 
    limit, 
    onSnapshot, 
    increment 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// --- CONFIGURAZIONE PROGETTO FIREBASE ---
// Roberta, sostituisci questo blocco con le tue chiavi personali ottenute dalla Console Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAUaAVYoTybwI9LgJQmiG46vGehLTPBYIU",
  authDomain: "fantalaurea2026-7a2e4.firebaseapp.com",
  projectId: "fantalaurea2026-7a2e4",
  storageBucket: "fantalaurea2026-7a2e4.firebasestorage.app",
  messagingSenderId: "747759460630",
  appId: "1:747759460630:web:f6a33d07c7b1d9c52d7037"
};

let app, auth, db;

// Inizializzazione controllata dell'infrastruttura di backend
export function inizializzaConfigurazione() {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
}

// --- LOGICA DI AUTENTICAZIONE ANONIMA AUTOMATICA ---
export async function autenticaUtenteAnonimo() {
    return new Promise((resolve, reject) => {
        // Forza la persistenza nativa del browser per mantenere la sessione al riavvio
        signInAnonymously(auth)
            .then(cred => resolve(cred.user))
            .catch(err => reject(err));
    });
}

// --- INTERROGAZIONI E TRANSAZIONI SQUADRE (LATO UTENTE) ---

// Ascolta in tempo reale le squadre associate a un determinato capitano (senza mostrare punteggio)
export function caricaSquadrePerCapitano(nomeCapitano, callback) {
    const q = query(collection(db, "squadre"), where("capitano", "==", nomeCapitano));
    return onSnapshot(q, (snapshot) => {
        const squadre = [];
        snapshot.forEach(doc => {
            const dati = doc.data();
            squadre.push({
                id: doc.id,
                nome: dati.nome,
                membri: dati.membri
            });
        });
        callback(squadre);
    });
}

// Crea una nuova squadra impostando lo stato iniziale dei punteggi e delle mappe delle missioni
export async function creaNuovaSquadra(nomeSquadra, nomeCapitano, uidCreatore) {
    // Controllo di unicità del nome all'interno dello stesso capitano per evitare omonimie conflittuali
    const q = query(
        collection(db, "squadre"), 
        where("capitano", "==", nomeCapitano), 
        where("nome", "==", nomeSquadra)
    );
    const controllo = await getDocs(q);
    if (!controllo.empty) {
        throw new Error("Una squadra con questo nome esiste già per questo Capitano!");
    }

    const docRef = doc(collection(db, "squadre"));
    const nuovaSquadra = {
        nome: nomeSquadra,
        capitano: nomeCapitano,
        membri: 1,
        punteggio: 0,
        missioniApprovate: {},  // Mappa idMissione -> quantita
        missioniInAttesa: {},   // Mappa idMissione -> quantita
        creatore: uidCreatore,
        timestamp: Date.now()
    };

    await setDoc(docRef, nuovaSquadra);
    return docRef.id;
}

// Incrementa in modo atomico il contatore dei membri all'interno di una squadra esistente
export async function uniscitiASquadraEsistente(idSquadra) {
    const squadraRef = doc(db, "squadre", idSquadra);
    await updateDoc(squadraRef, {
        membri: increment(1)
    });
}

// Sincronizzazione dati in tempo reale della propria squadra (per aggiornare i punti in Dashboard)
export function ascoltaDatiSquadra(idSquadra, callback) {
    const squadraRef = doc(db, "squadre", idSquadra);
    return onSnapshot(squadraRef, (docSnap) => {
        if (docSnap.exists()) {
            callback(docSnap.data());
        }
    });
}

// --- LOGICA DI GESTIONE RICHIESTE DELLE MISSIONI ---

// Registra la richiesta nel registro delle approvazioni e aggiorna lo stato visivo temporaneo della squadra
export async function inviaRichiestaMissione(idSquadra, nomeSquadra, nomeCapitano, idMissione, variazione) {
    // 1. Aggiunge una richiesta all'interno della raccolta centrale visibile dall'Admin
    await addDoc(collection(db, "richieste"), {
        idSquadra,
        nomeSquadra,
        capitano: nomeCapitano,
        idMissione,
        variazione, // Solitamente +1, o -1 se l'utente annulla una richiesta in attesa per missioni cumulabili
        stato: "in_attesa",
        timestamp: Date.now()
    });

    // 2. Aggiorna la mappa temporanea locale dei badge "In attesa" all'interno della squadra
    const squadraRef = doc(db, "squadre", idSquadra);
    const campoInAttesa = `missioniInAttesa.${idMissione}`;
    
    await updateDoc(squadraRef, {
        [campoInAttesa]: increment(variazione)
    });
}

// --- FEED LIVE E STATO FINALE DI GIOCO ---

// Recupera le ultime 30 missioni approvate globalmente per popolare la bacheca in tempo reale
export function ascoltaFeedApprovazioni(callback) {
    const q = query(
        collection(db, "feed_approvazioni"), 
        orderBy("timestamp", "desc"), 
        limit(30)
    );
    return onSnapshot(q, (snapshot) => {
        const notifiche = [];
        snapshot.forEach(doc => {
            notifiche.push(doc.data());
        });
        callback(notifiche);
    });
}

// Ascolta lo stato del gioco centralizzato per sbloccare la visualizzazione delle classifiche finali
export function ascoltaStatoGiocoFinale(callback) {
    const configRef = doc(db, "impostazioni", "gioco");
    return onSnapshot(configRef, (docSnap) => {
        if (docSnap.exists()) {
            callback(docSnap.data());
        }
    });
}

// ==========================================================================
// FUNZIONALITÀ DEDICATE ESCLUSIVAMENTE AL PANNELLO ADMIN (UTILIZZATE IN ADMIN.JS)
// ==========================================================================

export function adminAscoltaTutteLeSquadre(callback) {
    const q = query(collection(db, "squadre"), orderBy("punteggio", "desc"));
    return onSnapshot(q, (snapshot) => {
        const squadre = [];
        snapshot.forEach(doc => {
            squadre.push({ id: doc.id, ...doc.data() });
        });
        callback(squadre);
    });
}

export function adminAscoltaRichiesteInAttesa(callback) {
    const q = query(collection(db, "richieste"), where("stato", "==", "in_attesa"), orderBy("timestamp", "asc"));
    return onSnapshot(q, (snapshot) => {
        const richieste = [];
        snapshot.forEach(doc => {
            richieste.push({ id: doc.id, ...doc.data() });
        });
        callback(richieste);
    });
}

// Aggiorna lo stato della richiesta ed esegue il calcolo dei punti sulla squadra
export async function adminEseguiApprovazione(idRichiesta, idSquadra, idMissione, nomeMissione, nomeSquadra, variazione, puntiDaAssegnare) {
    const richiestaRef = doc(db, "richieste", idRichiesta);
    const squadraRef = doc(db, "squadre", idSquadra);

    // 1. Segna la richiesta come approvata
    await updateDoc(richiestaRef, { stato: "approvato" });

    // 2. Modifica la squadra spostando il conteggio da 'in attesa' a 'approvato' e somma i punti
    const campoInAttesa = `missioniInAttesa.${idMissione}`;
    const campoApprovato = `missioniApprovate.${idMissione}`;

    await updateDoc(squadraRef, {
        [campoInAttesa]: increment(-variazione),
        [campoApprovato]: increment(variazione),
        punteggio: increment(puntiDaAssegnare)
    });

    // 3. Genera un elemento nel feed pubblico se i punti assegnati sono positivi (evita di mostrare i Malus nel feed)
    if (puntiDaAssegnare > 0) {
        await addDoc(collection(db, "feed_approvazioni"), {
            squadra: nomeSquadra,
            missione: nomeMissione,
            timestamp: Date.now()
        });
    }
}

export async function adminEseguiRifiuto(idRichiesta, idSquadra, idMissione, variazione) {
    const richiestaRef = doc(db, "richieste", idRichiesta);
    const squadraRef = doc(db, "squadre", idSquadra);

    // 1. Segna la richiesta come rifiutata
    await updateDoc(richiestaRef, { stato: "rifiutato" });

    // 2. Decrementa semplicemente il contatore delle richieste in sospeso dalla squadra
    const campoInAttesa = `missioniInAttesa.${idMissione}`;
    await updateDoc(squadraRef, {
        [campoInAttesa]: increment(-variazione)
    });
}

// Permette correzioni manuali o assegnazioni dirette di bonus/malus arbitrari dall'interfaccia di amministrazione
export async function adminAggiornaPunteggioDiretto(idSquadra, deltaPunti) {
    const squadraRef = doc(db, "squadre", idSquadra);
    await updateDoc(squadraRef, {
        punteggio: increment(deltaPunti)
    });
}

// Salva le classifiche elaborate e attiva il flag globale per mostrare i risultati su tutti i telefoni
export async function adminPubblicaClassifica(classificaCapitani, classificaSquadre) {
    const configRef = doc(db, "impostazioni", "gioco");
    await setDoc(configRef, {
        classificaPubblica: true,
        classificaCapitani,
        classificaSquadre
    });
}
