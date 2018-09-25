
/**
 * @description in memory session cache
 */
class SessionCache {

  constructor() {
    this.cachetime = 5000;
    this.data = {};
  }

  get(id) {
    if( !this.data[id] ) return null;
    this.touch(id);
    return this.data[id].data;
  }

  set(id, data, notimeout=false) {
    this.data[id] = {
      data,
      timer : this.touch(id),
      notimeout
    }; 
  }

  destroy(id) {
    if( !this.data[id] ) return;
    if( this.data[id].notimeout === true ) return;

    delete this.data[id];
  }

  touch(id, cancelNotimeout=false) {
    if( this.data[id] ) {
      clearTimeout(this.data[id].timer);
    }

    let timer = setTimeout(() => this.destroy(id), this.cachetime);

    if( this.data[id] ) {
      this.data[id].timer = timer;

      if( cancelNotimeout === true ) {
        this.data[id].notimeout = false;
      }
    }

    return timer;
  }

}

module.exports = SessionCache;