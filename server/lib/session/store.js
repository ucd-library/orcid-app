const session = require('express-session');
const SessionCache = require('./cache');
const cache = new SessionCache();

class FirestoreStore extends session.Store {
		constructor( options ) {
			// Default options
			const _options = Object.assign( {
				collection: 'sessions',
				database:   undefined,
				parser:     null
			}, options );

			if ( _options.database === undefined || _options.database.collection === undefined ) {
				throw new Error( 'Please pass firestore instance as options.database' );
			}

			super();

			this._db     = _options.database;
			this._colRef = this._db.collection( _options.collection );
			this._parser = _options.parser;
		}

		async all( cb ) {
			try {
				let snapshot = await this._colRef.get();
				const docs = snapshot.docs.map( doc => this._parser.read( doc.data() ) );
				cb(null, docs);
			} catch(e) {
				cb(e);
			}
		}

		async destroy( sid, cb ) {
			try {
				await this._colRef.doc(sid).delete();
				cache.destroy(sid);
				cb(null);
			} catch(e) {
				cb(e);
			}
		}

		async clear( cb ) {
			try {
				let snapshot = await this._colRef.get();
				for( let doc of snapshot.docs ) {
					await doc.ref.delete();
				}
				cb(null);
			} catch(e) {
				cb(e);
			}
		}

		async length( cb ) {
			try {
				let snapshot = await this._colRef.get();
				cb(null, snapshot.docs.length);
			} catch(e) {
				cb(e);
			}
		}

		async get(sid, cb) {
			let cdata = cache.get(sid);
			if( cdata ) {
				cdata = this._parser.read(cdata);
				return cb(null, cdata);
			}

			try {
				let doc = await this._colRef.doc(sid).get();
				if( doc.exists === true ) {
					let raw = doc.data();
					const session = this._parser.read(raw);
					cache.set(sid, raw);

					cb(null, session);
				} else {
					cb(null, null);
				}
			} catch(e) {
				cb(null, e);
			}
		}

		async set(sid, session, cb) {
			let data = this._parser.save(session);
			cache.set(sid, data, true);

			try {
				await this._colRef.doc(sid).set(data)
				cache.touch(sid, true);
				cb(null); 
			} catch(e) {
				cb(e);
			}
		}

		touch(sid, session, cb) {
			cache.touch(sid)
			cb();
		}
	};

module.exports = FirestoreStore;