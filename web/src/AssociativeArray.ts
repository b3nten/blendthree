export class AssociativeArray<T> {
    array: T[] = [];
    reference = new Map<string, number>();
    constructor(obj?: Record<string, T>) {
        if(obj)
        for(const [key, value] of Object.entries(obj)) {
            this.set(key, value)
        }
    }
    set(key: string, value: T) {
        const i = this.array.length;
        this.array.push(value);
        this.reference.set(key, i);
    }
    get(key: string) {
        return this.array[this.reference.get(key)];
    }
    has(key: string) {
        return this.reference.has(key);
    }
    delete(key: string) {
        const i = this.reference.get(key);
        this.reference.delete(key);
        this.array[i] = this.array[this.array.length - 1];
        this.array.pop();
    }
    map = this.array.map.bind(this.array);
    forEach = this.array.forEach.bind(this.array);
    filter = this.array.filter.bind(this.array);
    [Symbol.iterator]() {
        return this.array[Symbol.iterator]();
    }
}