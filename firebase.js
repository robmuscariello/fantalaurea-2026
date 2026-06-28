/* ==========================================================================
   FANTALAUREA ODONTOIATRIA 2026 — firebase.js
   FIX: indici composti, join idempotente, gestione errori, deleteDoc
   ========================================================================== */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
    getFirestore,
    doc, collection,
    setDoc, addDoc, updateDoc, deleteDoc,
    getDocs, getDoc,
    query, where, orderBy, limit,
    onSnapshot, increment, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAUaAVYoTybwI9LgJQmiG46vGehLTPBYIU",
    authDomain: "fantalaurea2026-7a2e4.firebaseapp.com",
    projectId: "fantalaurea2026-7a2e4",
    storageBucket: "fantalaurea2026-7a2e4.firebasestorage.app",
    messagingSenderId: "747759460630",
    appId: "1:747759460630:web:f6a33d07c7b1d9c52d7037"
};

let app, auth, db;

export function inizializzaConfigurazione() {
    try {
        app = initializeApp(firebaseConfig);
    } catch(e) {
        // già inizializzato (es. doppio import)
        app = initializeApp(firebaseConfig, "fantalaurea-duplicate");
    }
    auth = getAuth(app);
    db = getFirestore(app);
    console.log("✅ Firebase inizializzato");
}

export async function autenticaUtenteAnonimo() {
    try {
        const cred = await signInAnonymously(auth);
        console.log("✅ Auth anonima:", cred.user.uid);
        return cred.user;
    } catch(err) {
        console.error("❌ Auth fallita:", err);
        throw err;
    }
}

/* ------------------------------------------------------------------ */
/*  SQUADRE                                                             */
/* ------------------------------------------------------------------ */

/**
 * Carica le squadre di un capitano SENZA orderBy così non serve indice composto.
 * FIX PROBLEMA 1 & 7: rimossa orderBy che causava errore indice silenzioso.
 */
export function caricaSquadrePerCapitano(nomeCapitano, callback) {
    const q = query(
        collection(db, "squadre"),
        where("capitano", "==", nomeCapitano)
    );
    return onSnapshot(q, (snap) => {
        const squadre = [];
        snap.forEach(d => {
            const dati = d.data();
            squadre.push({ id: d.id, nome: dati.nome, membri: dati.membri || 0 });
        });
        // Ordina lato client per non richiedere indice
        squadre.sort((a, b) => a.nome.localeCompare(b.nome));
        callback(squadre);
    }, (err) => {
        console.error("❌ caricaSquadrePerCapitano:", err);
        callback([]);
    });
}

export async function creaNuovaSquadra(nomeSquadra, nomeCapitano, uidCreatore) {
    // Verifica unicità veloce (una sola query, nessun orderBy)
    const q = query(
        collection(db, "squadre"),
        where("capitano", "==", nomeCapitano),
        where("nome", "==", nomeSquadra)
    );
    const controllo = await getDocs(q);
    if (!controllo.empty) throw new Error("Nome squadra già usato per questo Capitano!");

    const docRef = doc(collection(db, "squadre"));
    await setDoc(docRef, {
        nome: nomeSquadra,
        capitano: nomeCapitano,
        membri: 1,
        punteggio: 0,
        missioniApprovate: {},
        missioniInAttesa: {},
        creatore: uidCreatore,
        timestamp: Date.now()
    });
    return docRef.id;
}

/**
 * FIX PROBLEMA 3: join idempotente.
 * Incrementa i membri SOLO se questo uid non è già nella lista uid_membri.
 * Usa arrayUnion per essere atomico e idempotente.
 */
import { arrayUnion } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

export async function uniscitiASquadraEsistente(idSquadra, uid) {
    const squadraRef = doc(db, "squadre", idSquadra);
    const snap = await getDoc(squadraRef);
    if (!snap.exists()) throw new Error("Squadra non trovata.");

    const dati = snap.data();
    const uidMembri = dati.uid_membri || [];

    if (uidMembri.includes(uid)) {
        // Già membro: non fare nulla
        console.log("ℹ️ Già membro, nessun increment.");
        return;
    }

    // Nuovo membro: aggiunge uid e incrementa
    await updateDoc(squadraRef, {
        uid_membri: arrayUnion(uid),
        membri: increment(1)
    });
}

export function ascoltaDatiSquadra(idSquadra, callback) {
    const squadraRef = doc(db, "squadre", idSquadra);
    return onSnapshot(squadraRef, (snap) => {
        if (snap.exists()) callback(snap.data());
    }, (err) => console.error("❌ ascoltaDatiSquadra:", err));
}

/* ------------------------------------------------------------------ */
/*  MISSIONI                                                            */
/* ------------------------------------------------------------------ */

export async function inviaRichiestaMissione(idSquadra, nomeSquadra, nomeCapitano, idMissione, variazione) {
    await addDoc(collection(db, "richieste"), {
        idSquadra, nomeSquadra, capitano: nomeCapitano,
        idMissione, variazione,
        stato: "in_attesa",
        timestamp: Date.now()
    });

    const squadraRef = doc(db, "squadre", idSquadra);
    await updateDoc(squadraRef, {
        [`missioniInAttesa.${idMissione}`]: increment(variazione)
    });
}

/* ------------------------------------------------------------------ */
/*  FEED LIVE                                                           */
/* ------------------------------------------------------------------ */

export function ascoltaFeedApprovazioni(callback) {
    const q = query(
        collection(db, "feed_approvazioni"),
        orderBy("timestamp", "desc"),
        limit(30)
    );
    return onSnapshot(q, (snap) => {
        const notifiche = [];
        snap.forEach(d => notifiche.push(d.data()));
        callback(notifiche);
    }, (err) => console.error("❌ ascoltaFeedApprovazioni:", err));
}

export function ascoltaStatoGiocoFinale(callback) {
    const ref = doc(db, "impostazioni", "gioco");
    return onSnapshot(ref, (snap) => {
        if (snap.exists()) callback(snap.data());
    });
}

/* ================================================================== */
/*  FUNZIONI ADMIN                                                      */
/* ================================================================== */

/**
 * FIX PROBLEMA 7: rimossa orderBy per evitare indice composto mancante.
 * Ordina lato client.
 */
export function adminAscoltaTutteLeSquadre(callback) {
    const q = query(collection(db, "squadre"));
    return onSnapshot(q, (snap) => {
        const squadre = [];
        snap.forEach(d => squadre.push({ id: d.id, ...d.data() }));
        // Ordina per punteggio decrescente lato client
        squadre.sort((a, b) => (b.punteggio || 0) - (a.punteggio || 0));
        callback(squadre);
    }, (err) => console.error("❌ adminAscoltaTutteLeSquadre:", err));
}

export function adminAscoltaRichiesteInAttesa(callback) {
    // FIX: rimuovere orderBy per evitare indice composto; ordina lato client
    const q = query(
        collection(db, "richieste"),
        where("stato", "==", "in_attesa")
    );
    return onSnapshot(q, (snap) => {
        const richieste = [];
        snap.forEach(d => richieste.push({ id: d.id, ...d.data() }));
        richieste.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
        callback(richieste);
    }, (err) => console.error("❌ adminAscoltaRichiesteInAttesa:", err));
}

export async function adminEseguiApprovazione(idRichiesta, idSquadra, idMissione, nomeMissione, nomeSquadra, variazione, punti) {
    await updateDoc(doc(db, "richieste", idRichiesta), { stato: "approvato" });
    await updateDoc(doc(db, "squadre", idSquadra), {
        [`missioniInAttesa.${idMissione}`]: increment(-variazione),
        [`missioniApprovate.${idMissione}`]: increment(variazione),
        punteggio: increment(punti)
    });
    if (punti > 0) {
        await addDoc(collection(db, "feed_approvazioni"), {
            squadra: nomeSquadra,
            missione: nomeMissione,
            timestamp: Date.now()
        });
    }
}

export async function adminEseguiRifiuto(idRichiesta, idSquadra, idMissione, variazione) {
    await updateDoc(doc(db, "richieste", idRichiesta), { stato: "rifiutato" });
    await updateDoc(doc(db, "squadre", idSquadra), {
        [`missioniInAttesa.${idMissione}`]: increment(-variazione)
    });
}

export async function adminAggiornaPunteggioDiretto(idSquadra, delta) {
    await updateDoc(doc(db, "squadre", idSquadra), { punteggio: increment(delta) });
}

/**
 * FIX PROBLEMA 8: elimina una squadra e tutte le sue richieste pendenti.
 */
export async function adminEliminaSquadra(idSquadra) {
    // Elimina le richieste in attesa di questa squadra
    const q = query(
        collection(db, "richieste"),
        where("idSquadra", "==", idSquadra),
        where("stato", "==", "in_attesa")
    );
    const snap = await getDocs(q);
    const promesse = [];
    snap.forEach(d => promesse.push(deleteDoc(doc(db, "richieste", d.id))));
    await Promise.all(promesse);

    // Elimina la squadra
    await deleteDoc(doc(db, "squadre", idSquadra));
}

export async function adminPubblicaClassifica(classificaCapitani, classificaSquadre) {
    await setDoc(doc(db, "impostazioni", "gioco"), {
        classificaPubblica: true,
        classificaCapitani,
        classificaSquadre
    });
}
