const EEI_PEOPLE = require('../data/eei');
const TITLES = require('../data/titles');

class AppData {

  constructor() {
    this.departments = {
      eei : {
        label : 'Energy and Efficiency Institute',
        people : EEI_PEOPLE
      }
    }

    this.titles = {};
    for( let key in TITLES ) {
      this.titles[this.cleanTitle(key)] = TITLES[key];
    }
  }


  /**
   * @method getUserDepartments
   * @description given a users UCD IAM id, provide a list of application controlled departements
   * 
   * @param {String} iamId
   * 
   * @returns {Array}
   */
  getUserDepartments(iamId) {
    let depts = [];

    for( let key in this.departments ) {
      if( this.departments[key].people[iamId] ) {
        depts.push({
          displayName : this.departments[key].label,
          startDate : new Date(this.departments[key].people[iamId].startDate)
        });
      }
    }

    return depts;
  }

  /**
   * @method cleanTitle
   * @description given a user title, return one of our cleaned up versions.
   * If no clean version is found, return given title
   * 
   * @param {String} title
   * 
   * @returns {String} 
   */
  getUserTitle(title) {
    return this.titles[this.cleanTitle(title)] || title;
  }

  cleanTitle(title='') {
    return title.replace(/\s/g, '').toLowerCase();
  }

}

module.exports = new AppData();