import Globals from "^/core/utils/Globals";

export function emitEvent(identifier, ...data) {
    Globals.getVueInstance().$eventHub.$emit(identifier, ...data);
}

export function listenEvent(identifier, callback) {
    Globals.getVueInstance().$eventHub.$on(identifier, callback);
}