import {
    collection, addDoc, deleteDoc, doc,
    query, where, orderBy, onSnapshot, serverTimestamp,
    setDoc, getDoc, updateDoc,
} from "firebase/firestore";
import { db } from "../config/firebase";

// ── 파밍 기록 ──────────────────────────────────
export const saveIncome = async (uid, record) => {
    await addDoc(collection(db, "users", uid, "records"), {
        ...record, kind: "income", createdAt: serverTimestamp(),
    });
};

export const saveExpense = async (uid, record) => {
    await addDoc(collection(db, "users", uid, "records"), {
        ...record, kind: "expense", createdAt: serverTimestamp(),
    });
};

export const updateRecord = async (uid, recordId, data) => {
    await updateDoc(doc(db, "users", uid, "records", recordId), {
        ...data, updatedAt: serverTimestamp(),
    });
};

export const deleteRecord = async (uid, recordId) => {
    await deleteDoc(doc(db, "users", uid, "records", recordId));
};

export const subscribeRecords = (uid, callback) => {
    const q = query(
        collection(db, "users", uid, "records"),
        orderBy("date", "desc")
    );
    return onSnapshot(q, (snapshot) => {
        callback(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });
};

// ── 즐겨찾기 ───────────────────────────────────
export const saveFavorites = async (uid, favs) => {
    await setDoc(doc(db, "users", uid, "settings", "favorites"), {
        favs, updatedAt: serverTimestamp(),
    });
};

export const getFavorites = async (uid) => {
    const snap = await getDoc(doc(db, "users", uid, "settings", "favorites"));
    return snap.exists() ? snap.data().favs : [];
};

// ── 공지사항 ───────────────────────────────────
export const subscribeNotices = (callback) => {
    const q = query(collection(db, "notices"), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snapshot) => {
        callback(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });
};

export const addNotice = async (uid, title, content, pinned = false) => {
    await addDoc(collection(db, "notices"), {
        title, content, pinned,
        authorUid: uid,
        createdAt: serverTimestamp(),
    });
};

export const updateNotice = async (noticeId, title, content, pinned) => {
    await updateDoc(doc(db, "notices", noticeId), {
        title, content, pinned, updatedAt: serverTimestamp(),
    });
};

export const deleteNotice = async (noticeId) => {
    await deleteDoc(doc(db, "notices", noticeId));
};

// ── 물욕템 보관함 (inventory) ──────────────────
export const addInventoryItem = async (uid, item) => {
    return await addDoc(collection(db, "users", uid, "inventory"), {
        ...item, sold: false, createdAt: serverTimestamp(),
    });
};

export const updateInventoryItem = async (uid, itemId, data) => {
    await updateDoc(doc(db, "users", uid, "inventory", itemId), {
        ...data, updatedAt: serverTimestamp(),
    });
};

export const deleteInventoryItem = async (uid, itemId) => {
    await deleteDoc(doc(db, "users", uid, "inventory", itemId));
};

export const subscribeInventory = (uid, callback) => {
    const q = query(
        collection(db, "users", uid, "inventory"),
        orderBy("createdAt", "desc")
    );
    return onSnapshot(q, (snapshot) => {
        callback(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });
};

// ── 유저 건의함 ────────────────────────────────
export const addInquiry = async (uid, email, title, content) => {
    return await addDoc(collection(db, "inquiries"), {
        uid, email, title, content,
        status: "open",
        adminReply: "",
        createdAt: serverTimestamp(),
    });
};

export const subscribeMyInquiries = (uid, callback) => {
    const q = query(
        collection(db, "inquiries"),
        where("uid", "==", uid),
        orderBy("createdAt", "desc")
    );
    return onSnapshot(q, (snapshot) => {
        callback(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });
};

export const subscribeAllInquiries = (callback) => {
    const q = query(collection(db, "inquiries"), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snapshot) => {
        callback(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });
};

export const replyInquiry = async (inquiryId, adminReply) => {
    await updateDoc(doc(db, "inquiries", inquiryId), {
        adminReply, status: "closed", repliedAt: serverTimestamp(),
    });
};

export const deleteInquiry = async (inquiryId) => {
    await deleteDoc(doc(db, "inquiries", inquiryId));
};

// ── 공지사항 좋아요 ────────────────────────────
export const toggleNoticeLike = async (noticeId, uid) => {
    const ref  = doc(db, "notices", noticeId, "likes", uid);
    const snap = await getDoc(ref);
    if (snap.exists()) {
        await deleteDoc(ref);
        return false; // 좋아요 취소
    } else {
        await setDoc(ref, { likedAt: serverTimestamp() });
        return true;  // 좋아요 추가
    }
};

export const subscribeNoticeLikes = (noticeId, callback) => {
    return onSnapshot(
        collection(db, "notices", noticeId, "likes"),
        (snap) => callback(snap.size, snap.docs.map(d => d.id))
    );
};