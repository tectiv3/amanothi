import { AsyncStorage, NativeModules } from 'react-native';
var assign = require('object-assign');
const fetchWithRetries = require('fbjs/lib/fetchWithRetries');
var EventEmitter = require('events').EventEmitter;
var Aes = NativeModules.Aes;

var _notes = null;
var _account = null;
// getReactNativeHost().getReactInstanceManager().getDevSupportManager().handleReloadJS(); //force reload


loadAccountFromStorage();

function loadAccountFromStorage() {
    return AsyncStorage.getItem('account').then(str => {
        if (!str)
            _account = {};
        else
            _account = JSON.parse(str);
        console.log("Load account:", _account);
        if (!_account.settings) {
            _account.settings = {};
        }
    });
}

function fetchStatus(response) {
    if (response.status >= 200 && response.status < 300) {
        return response
    }
    throw new Error(response.statusText)
}

function fetchError(error) {
    console.log('Request failed', error)
    if (error.response == undefined)
        throw new Error(error.message)
    if (error.response.headers.get('Content-Type') == 'application/json') {
        return error.response.json().then((json) => {
            throw new Error(json.errors)
        });
    }
    return error.response.text().then((text) => {
        throw new Error(text)
    });
}

function getParams(server, email) {
    var init = {
        body: '',
        method: 'GET'
    };

    return fetchWithRetries(server + "/auth/params?email=" + email, init)
        .then(fetchStatus)
        .then((response) => response.json())
        .catch(fetchError)
}

function fetchFromServer() {
    console.log("fetchFromServer", _account.server)
    if (_account.server == "" || _account.server == undefined) {
        console.log("no server address")
        return Promise.resolve()
    }

    if (_account.token == "" || _account.token == undefined) {
        console.log("not authorized")
        return Promise.resolve()
    }
    var myHeaders = new Headers();
    myHeaders.append("Authorization", "Bearer " + _account.token);
    var init = {
        body: '',
        method: 'POST',
        headers: myHeaders,
    };

    return fetchWithRetries(_account.server + "/items/sync", init)
        .then(fetchStatus).then((response) => response.json()).catch(fetchError)
        .then((responseData) => {
            // console.log('response object:', responseData)
            return Storage.decryptNotes(responseData.retrieved_items).then(() => {
                _account.sync_token = responseData.sync_token
                return Storage.saveAccount(_account)
            })
        })
        .catch((error) => {
            console.log(error)
        })
}

function loadNotesFromStorage() {
    console.log("loadNotesFromStorage")
    return AsyncStorage.getItem('enotes').then(str => {
        var encrypted = [];
        _notes = [];
        encrypted = JSON.parse(str);
        return Storage.decryptNotes(encrypted).catch(error => console.log(error));
    });
}

function updateNotesStorage() {
    console.log("updateNotesStorage")
    if (!_notes) return AsyncStorage.setItem('enotes', "");
    var password = _account.password;
    var promises = _notes.map((note) => encryptNote(note, password));
    return Promise.all(promises).then(function(encrypted) {
        return AsyncStorage.setItem('enotes', JSON.stringify(encrypted))
            .catch(err => {
                console.log("couldn't store note: " + err)
            });
    }).catch(function(err) {
        console.log("Failed:", err);
    });
}

function updateAccountStorage() {
    console.log('Saving account to storage', _account);
    return AsyncStorage.setItem('account', JSON.stringify(_account)).catch(
        function(err) {
            console.log("Failed:", err);
        });
}

function generateRandomKey() {
    return Math.random().toString(36).substring(2);
}

function generateUUID() {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(
        c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    return uuid;
}

async function decryptItem(cipher, key) {
    var result = null;
    try {
        result = await Aes.decrypt(cipher, key);
    } catch (e) {
        //doesn't catch reject
        console.log(e);
    }
    return result;
}

function encryptionComponentsFromString(string, baseKey, encryptionKey, authKey) {
    var encryptionVersion = string.substring(0, 3);
    if (encryptionVersion === "001") {
        return {
            contentCiphertext: string.substring(3),
            encryptionVersion: encryptionVersion,
            ciphertextToAuth: string,
            iv: null,
            authHash: null,
            encryptionKey: baseKey,
            authKey: authKey
        }
    } else {
        let components = string.split(":");
        return {
            encryptionVersion: components[0],
            authHash: components[1],
            iv: components[2],
            contentCiphertext: components[3],
            ciphertextToAuth: [components[0], components[2], components[3]].join(":"),
            encryptionKey: encryptionKey,
            authKey: authKey
        }
    }
}

async function getKeys() {
    if (!_account.encryptionKey) {
        try {
            _account.encryptionKey = await Aes.hmac256(_account.mk, toHex("e"));
            _account.authKey = await Aes.hmac256(_account.mk, toHex("a"));
        } catch (e) {
            console.log("key generation error")
        }
    }
    return {
        mk: _account.mk,
        encryptionKey: _account.encryptionKey,
        authKey: _account.authKey
    };
}

async function decryptText({ciphertextToAuth, contentCiphertext, encryptionKey, iv, authHash, authKey} = {}, requiresAuth) {
    if (requiresAuth && !authHash) {
        console.error("Auth hash is required.");
        return;
    }

    console.log("authHash:", authHash);
    if (authHash) {
        try {
            let hash = await Aes.hmac256(ciphertextToAuth, authKey);
            console.log("hmac:", hash);
            if (authHash !== hash) {
                console.log("Hmac doesn't match.")
                return ""
            }
        } catch (e) {
            console.log("Hmac error", e);
        }
    }

    return await Aes.decrypt(contentCiphertext, encryptionKey)
}

function decryptNote(note, key) {
    return new Promise(function(resolve, reject) {
        console.log("note_enc:", note.enc_item_key, "key:", key);
        var encryptedItemKey = note.enc_item_key;
        var requiresAuth = true;
        if (encryptedItemKey.startsWith("002") === false) {
            // legacy encryption type, has no prefix
            encryptedItemKey = "001" + encryptedItemKey;
            requiresAuth = false;
        }
        getKeys().then(async(result) => {
            var keys = result
            var keyParams = encryptionComponentsFromString(encryptedItemKey, keys.mk, keys.encryptionKey, keys.authKey);
            // console.log("keyParams", keyParams);
            try {
                var item_key = await decryptText(keyParams, requiresAuth);
            } catch (e) {
                return reject("key decrypt error");
            }
            if (!item_key) {
                return reject("key decrypt error");
            }
            console.log("item_key after decryptText:", item_key);

            // decrypt content
            var ek = item_key.substring(0, 64);
            var ak = item_key.substring(64);
            var itemParams = encryptionComponentsFromString(note.content, ek, ek, ak);
            console.log("itemParams", itemParams, note.auth_hash);
            if (!itemParams.authHash) {
                itemParams.authHash = note.auth_hash;
            }
            try {
                var content = await decryptText(itemParams, false);
            } catch (e) {
                return reject("text decrypt error")
            }
            if (!content) {
                return reject("text decrypt error")
            }
            var json = JSON.parse(content);
            note.text = json.text
            note.title = json.title
            console.log(content, note);
            resolve(note)
        })
    /*
            Aes.decrypt(note.enc_item_key, key).then(async(note_key) => {
                console.log("Decrypted note key:", note_key)
                console.log("note:", note);
                try {
                    let hash = await Aes.hmac256(note.content, key);
                    if (hash !== note.hash) {
                        console.log("Hmac doesn't match.")
                        reject("Hmac doesn't match");
                    }
                    return Aes.decrypt(note.content, note_key)
                        .then((result) => resolve(result))
                        .catch((err) => console.log("Decrypt error:", err));
                } catch (e) {
                    reject("Hash error");
                }
            }).catch((err) => console.log("Decrypt error:", err));
            */
    });
}

async function encryptNote(note, key) {
    //if key is still to be set, throw an alert
    if (!note.uuid) {
        note.uuid = generateUUID();
    }
    var note_key = generateRandomKey();
    note.key = await Aes.encrypt(note_key, key);

    var p = new Promise(function(resolve, reject) {
        Aes.encrypt("e001" + JSON.stringify(note), note_key).then(
            cipher => {
                var copy = {};
                copy.uuid = note.uuid;
                copy.content = cipher;
                copy.key = note.key;
                copy.updated_at = note.updated_at;
                Aes.hmac256(copy.content, key).then(hash => {
                    copy.hash = hash;
                    resolve(copy);
                });
            });
    });
    return p;
}

function toHex(str) {
    var hex = '';
    for (var i = 0; i < str.length; i++) {
        hex += '' + str.charCodeAt(i).toString(16);
    }
    return hex;
}

var Storage = assign({}, EventEmitter.prototype, {

    getAll: function() {
        if (!_notes) {
            console.log("Get notes call.");
            loadNotesFromStorage().then(fetchFromServer).then(updateNotesStorage);
            return [];
        } else {
            return _notes;
        }
    },

    getAccount: function() {
        return _account;
    },

    saveAccount: function(data) {
        if (data.password != _account.password && data.password != "") {
            console.log("password changed", data)
            return Aes.pbkdf2(data.password, data.params.pw_salt).then((hash) => {
                console.log("pw hash:", hash)
                data.password = hash.substring(0, 64);
                data.mk = hash.substring(64);
                data.settings = _account.settings;
                data.params = _account.params;
                _account = data;
                console.log('account:', _account);
            }).then(updateAccountStorage).then(() => {
                console.log('Re-encrypting notes');
                updateNotesStorage(data.password);
            }).catch(err => {
                console.log("couldn't store account: ", err)
            });
        } else {
            data.settings = _account.settings;
            data.params = _account.params;
            _account = data;
            return updateAccountStorage().catch(err => {
                console.log("account save error: ", err)
            })
        }
    },

    registerUser: function(data) {
        return Storage.saveAccount({
            password: data.password,
            email: data.email,
            server: data.server
        }).then(() => {
            var init = {
                body: JSON.stringify({
                    email: _account.email,
                    password: _account.password,
                    pw_alg: "sha256",
                    pw_cost: 5000,
                    pw_func: 'pbkdf2',
                    pw_key_size: 512,
                    pw_salt: _account.salt
                }),
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
            };
            return fetchWithRetries(_account.server + "/auth", init)
                .then(fetchStatus).then((response) => response.json())
                .then((responseData) => {
                    console.log('ResponseData:', responseData)
                }).catch(fetchError)
        })
    },

    loginUser: function(data) {
        return getParams(data.server, data.email).then((params) => {
            console.log("on login, before save account", params);
            return Storage.saveAccount({
                password: data.password,
                email: data.email,
                server: data.server,
                params: params
            })
        }).then(() => {
            var init = {
                body: JSON.stringify({
                    email: _account.email,
                    password: _account.password
                }),
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
            };
            return fetchWithRetries(_account.server + "/auth/sign_in", init)
                .then(fetchStatus).then((response) => response.json())
                .then((responseData) => {
                    _account.token = responseData.token
                    return Storage.saveAccount(_account).then(fetchFromServer).then(updateNotesStorage).then(() => this.emitChange());
                }).catch(fetchError)
        })
    },

    logoutUser: function() {
        return Storage.saveAccount({
            password: "",
            email: "",
            server: _account.server,
            params: []
        }).then(() => {
            _notes = [];
            updateNotesStorage().then(() => this.emitChange()).catch(fetchError)
        });
    },

    saveSetting: function(item, value) {
        _account.settings[item] = value;
        return updateAccountStorage();
    },

    createNote: function(note) {
        note.created_at = new Date().toISOString();
        note.updated_at = note.created_at;
        note.uuid = generateUUID();
        note.deleted = false;
        _notes.push(note);
        this.emitChange();
        return updateNotesStorage();
    },

    updateNote: function(note) {
        for (var i = 0; i < _notes.length; i++) {
            if (_notes[i].uuid == note.uuid) {
                note.updated_at = new Date().toISOString();
                _notes[i] = note;
                break;
            }
        }
        this.emitChange();
        return updateNotesStorage();
    },

    deleteNote: function(note) {
        for (var i = 0; i < _notes.length; i++) {
            if (_notes[i].uuid == note.uuid) {
                _notes[i] = note;
                break;
            }
        }
        this.emitChange();
        return updateNotesStorage();
    },

    decryptNotes: function(encrypted) {
        var promises = []
        if (!encrypted) return Promise.resolve()
        encrypted.forEach(function(note) {
            if (!note.deleted && note.content_type == "Note") {
                promises.push(decryptNote(note, _account.mk));
            }
        })
        return Promise.all(promises).then((results) => {
            results.forEach(function(item) {
                _notes.push(item);
            })
            Storage.emitChange()
        })
    },

    emitChange: function() {
        console.log("Change fire!");
        this.emit('change');
    },

    addChangeListener: function(callback) {
        this.on('change', callback);
    },

    removeChangeListener: function(callback) {
        this.removeListener('change', callback);
    }
});

export default Storage;
