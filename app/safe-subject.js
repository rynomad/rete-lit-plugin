import {
    BehaviorSubject,
    distinctUntilChanged,
    filter,
    tap,
    debounceTime,
} from "https://esm.sh/rxjs@7.3.0";
import deepEqual from "https://esm.sh/fast-deep-equal";

export class SafeSubject {
    constructor(filter = false) {
        // Initialize write and _read Behavior Subjects
        this.write = new BehaviorSubject(undefined);
        this._read = new BehaviorSubject(undefined);
        this._filter = filter;

        // Pipe write subject through filters and then to _read subject
        this.write
            .pipe(
                this.filter, // Filter out null and undefined values
                distinctUntilChanged(deepEqual)
            )
            .subscribe(
                (value) => this._read.next(value),
                (error) => this._read.error(error),
                () => this._read.complete()
            );
    }

    // Define a read getter to provide the _read subject piped with a filter
    get read() {
        return this._filter ? this._read.pipe(this.filter) : this._read;
    }

    // Define a filter getter to provide the filter function
    get filter() {
        return filter((value) => value !== null && value !== undefined);
    }

    getValue() {
        return this._read.getValue();
    }

    // Mimic the behavior of regular subjects
    pipe(...args) {
        return this.read.pipe(...args);
    }

    subscribe(...args) {
        return this.read.subscribe(...args);
    }

    next(value) {
        this.write.next(value);
    }

    error(err) {
        this.write.error(err);
    }

    complete() {
        this.write.complete();
    }

    unsubscribe() {
        this.write.unsubscribe();
        this._read.unsubscribe();
    }
}
