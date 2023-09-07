import {
    BehaviorSubject,
    distinctUntilChanged,
    mergeMap,
    filter,
    tap,
} from "https://esm.sh/rxjs@7.3.0";
import { openDB } from "https://esm.sh/idb@6.0.0";
import { deepEqual } from "https://esm.sh/fast-equals";
import { Transformer } from "./transformer.js";
import { SafeSubject } from "./safe-subject.js";

export class CanvasStore {
    static db = "bespeak-canvas-db";
    static storeName = "metadata-store";

    static async getAllMetadata() {
        const db = await this.getDB();
        const tx = db.transaction(this.storeName, "readonly");
        const store = tx.objectStore(this.storeName);
        const keys = await store.getAllKeys();
        const allMetadata = await Promise.all(
            keys.map((key) => store.get(key))
        );
        await tx.done;
        await db.close();
        return allMetadata;
    }

    get editor() {
        return this.canvas.editor;
    }

    get area() {
        return this.canvas.area;
    }

    constructor(canvas) {
        this.canvas = canvas;
        this.storeName = canvas.canvasId;
        this.ide = canvas.ide;

        this.lock = new BehaviorSubject(false);
        this.historyOffset = new BehaviorSubject(0);
        this.db = this.constructor.db;
        this.getDB = this.constructor.getDB.bind(this);
        this.snapshots = new SafeSubject(true);

        // Initialize the state manager
        this.init();
    }

    async init() {
        console.log("init spam");
        // Create pipeline for editor events to snapshot
        this.initEditorPipe();
        // Create pipeline for loading snapshot from IndexedDB to editor

        this.historyOffset
            .pipe(
                // tap((h) => console.log("offset changed", h)),
                mergeMap(this.loadSnapshotFromDB.bind(this)),
                distinctUntilChanged(deepEqual),
                filter((snapshot) => snapshot && !this.lock.getValue()),
                tap(() => this.lock.next(true)),
                mergeMap(this.updateEditorFromSnapshot.bind(this)),
                tap(() => this.lock.next(false))
                // tap(() => console.log("SPAM?"))
            )
            .subscribe(this.snapshots.write);

        await this.setMetadata({
            canvasId: this.canvas.canvasId,
            name: this.canvas.name,
        });
    }

    initEditorPipe() {
        this.editor?.addPipe(async (context) => {
            if (
                [
                    "nodecreated",
                    "noderemoved",
                    "connectioncreated",
                    "connectionremoved",
                ].includes(context.type)
            ) {
                if (!this.lock.getValue()) {
                    await this.createSnapshot();
                }
                this.historyOffset.next(0);

                // await this.deleteSnapshotsAfterOffset();
            }
            return context;
        });
    }

    async createSnapshot() {
        const nodes = this.editor.getNodes().map((node) => node.serialize());
        const connections = this.editor.getConnections();
        await this.saveSnapshotToDB({ nodes, connections });
        this.snapshots.write.next({ nodes, connections });
    }

    async setMetadata(metadata) {
        // Remove non-serializable properties
        const serializableMetadata = {
            canvasId: metadata.canvasId,
            name: metadata.name,
        };

        const db = await this.getDB();
        const tx = db.transaction(this.constructor.storeName, "readwrite");
        const store = tx.objectStore(this.constructor.storeName);
        try {
            await store.put(serializableMetadata, this.canvas.canvasId);
        } catch (e) {
            console.error("Failed to save metadata:", e);
        }
        await tx.done;
        await db.close();
    }

    async getMetadata() {
        const db = await this.getDB();
        const tx = db.transaction(this.constructor.storeName, "readonly");
        const store = tx.objectStore(this.constructor.storeName);
        const metadata = await store.get(this.canvas.canvasId);
        await tx.done;
        await db.close();
        return metadata;
    }

    static async getDB() {
        let db;

        // Open the database without specifying a version to get the current version
        db = await openDB(this.db);
        let dbVersion = db.version;

        const storesToCreate = [
            this.storeName,
            this.constructor.storeName,
        ].filter((e) => e);
        const newStores = storesToCreate.filter(
            (storeName) => !db.objectStoreNames.contains(storeName)
        );

        if (newStores.length) {
            db.close();

            dbVersion++;

            db = await openDB(this.db, dbVersion, {
                upgrade: (db) => {
                    newStores.forEach((storeName) => {
                        db.createObjectStore(storeName, {
                            autoIncrement: true,
                        });
                    });
                },
            });
        }
        return db;
    }

    previous() {
        const currentValue = this.historyOffset.getValue();
        this.historyOffset.next(currentValue + 1);
    }

    next() {
        const currentValue = this.historyOffset.getValue();
        if (currentValue > 0) {
            this.historyOffset.next(currentValue - 1);
        }
    }

    async saveSnapshotToDB(snapshot) {
        const db = await this.getDB();
        const tx = db.transaction(this.storeName, "readwrite");
        const store = tx.objectStore(this.storeName);
        await store.put(snapshot);
        await tx.done;
        await db.close();
    }

    async deleteSnapshotsAfterOffset() {
        const offset = this.historyOffset.getValue();
        const db = await this.getDB();
        const tx = db.transaction(this.storeName, "readwrite");
        const store = tx.objectStore(this.storeName);
        let cursor = await store.openCursor(null, "prev");
        let count = 0;
        while (cursor && count < offset) {
            cursor = await cursor.continue();
            const deleteRequest = store.delete(cursor.primaryKey);
            await new Promise((resolve, reject) => {
                deleteRequest.onsuccess = resolve;
                deleteRequest.onerror = reject;
            });
            count++;
        }
        await tx.done;
        await db.close();
    }

    async loadSnapshotFromDB(offset) {
        const db = await this.getDB();
        let cursor = await db
            .transaction(this.storeName)
            .store.openCursor(null, "prev");
        let count = 0;
        let output = cursor?.value;
        while (cursor && count < offset) {
            cursor = await cursor.continue();
            output = cursor.value;
            count++;
        }
        await db.close();
        return output;
    }

    async updateEditorFromSnapshot(snapshot) {
        const currentNodes = this.editor.getNodes();
        const currentConnections = this.editor.getConnections();

        // Remove nodes and connections not in snapshot
        await Promise.all(
            currentNodes.map(async (node) => {
                const snapshotNode = snapshot.nodes.find(
                    (n) => n.id === node.id
                );
                if (!snapshotNode) {
                    await this.editor.removeNode(node.id);
                } else {
                    // Update node inputs if they don't match snapshot
                    Object.keys(node.inputs).forEach((key) => {
                        if (
                            !deepEqual(
                                node.inputs[key].value,
                                snapshotNode.inputs[key]
                            )
                        ) {
                            node.inputs[key].subject.next(
                                snapshotNode.inputs[key]
                            );
                        }
                    });
                }
            })
        );

        await Promise.all(
            currentConnections.map(async (connection) => {
                if (!snapshot.connections.find((c) => c.id === connection.id)) {
                    await this.editor.removeConnection(connection.id);
                }
            })
        );

        // Add nodes and connections from snapshot
        await Promise.all(
            snapshot.nodes.map(async (node) => {
                if (!currentNodes.find((n) => n.id === node.id)) {
                    await this.editor.addNode(
                        await Transformer.deserialize(this.ide, node)
                    );
                }
            })
        );

        await Promise.all(
            snapshot.connections.map(async (connection) => {
                if (!currentConnections.find((c) => c.id === connection.id)) {
                    await this.editor.addConnection(connection);
                }
            })
        );

        return snapshot;
    }
}

// Usage
// const canvas = new Canvas();
// new CanvasStateManager(canvas);
