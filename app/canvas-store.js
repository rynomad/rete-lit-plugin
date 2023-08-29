import {
    BehaviorSubject,
    distinctUntilChanged,
    mergeMap,
    filter,
    tap,
} from "https://esm.sh/rxjs@7.3.0";
import { openDB } from "https://esm.sh/idb@6.0.0";
import { deepEqual } from "https://esm.sh/fast-equals";

export class CanvasStore {
    static db = "bespeak-canvas-db";
    constructor(canvas) {
        this.canvas = canvas;
        this.editor = canvas.editor;
        this.area = canvas.area;
        this.storeName = `bespeak-canvas-${canvas.id}`;
        this.lock = new BehaviorSubject(false);
        this.historyOffset = new BehaviorSubject(0);

        // Initialize the state manager
        this.init();
    }

    async init() {
        // Create pipeline for editor events to snapshot
        this.editor.addPipe(async (context) => {
            if (
                [
                    "nodecreated",
                    "noderemoved",
                    "connectioncreated",
                    "connectionremoved",
                ].includes(context.type)
            ) {
                if (!this.lock.getValue()) {
                    const nodes = this.editor
                        .getNodes()
                        .map((node) => node.serialize());
                    const connections = this.editor.getConnections();
                    await this.saveSnapshotToDB({ nodes, connections });
                }

                await this.deleteSnapshotsAfterOffset();
                this.historyOffset.next(0);
            }
            return context;
        });

        // Create pipeline for loading snapshot from IndexedDB to editor
        this.historyOffset
            .pipe(
                mergeMap(this.loadSnapshotFromDB.bind(this)),
                distinctUntilChanged(deepEqual),
                filter((snapshot) => snapshot && !this.lock.getValue()),
                tap(() => this.lock.next(true)),
                mergeMap(this.updateEditorFromSnapshot.bind(this)),
                tap(() => this.lock.next(false))
            )
            .subscribe();
    }

    async getDB() {
        let db;

        // Open the database without specifying a version to get the current version
        db = await openDB(this.constructor.db);
        let dbVersion = db.version;

        if (!db.objectStoreNames.contains(this.storeName)) {
            // Close the database so it can be reopened with a higher version number
            db.close();

            // Increment the version number
            dbVersion++;

            // Reopen the database with a higher version number and create the store
            db = await openDB(this.constructor.db, dbVersion, {
                upgrade: (db) => {
                    db.createObjectStore(this.storeName, {
                        autoIncrement: true,
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
        const subject = new BehaviorSubject(null);
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
                        Transformer.deserialize(node, this.editor, this.area)
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
    }
}

// Usage
// const canvas = new Canvas();
// new CanvasStateManager(canvas);
