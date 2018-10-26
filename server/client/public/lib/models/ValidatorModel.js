const config = require('../config');
const {BaseModel} = require('@ucd-lib/cork-app-utils');

/**
 * @class ValidatorModel
 * @description static class that exposes the analyze method which responds with data
 * to render the checklist view
 */
class ValidatorModel extends BaseModel {

  constructor() {
    super();
    this.register('ValidatorModel');
  }

  getAppEmployments(record) {
    return (this.hasEmployment(record) || [])
      .filter(e => e.source['source-name'].value === config.ucdSource);
  }

  /**
   * @method analyze
   * @description analyze a users ORCiD record, results can be used to render checklist view
   * 
   * @param {Object} record Users ORCiD record
   * 
   * @returns {Object}
   */
  analyze(record) {

    let results = {
      checklist : [],
      warnings : [],
      errors : [],
      total : 0
    };

    // CrossRef
    let crossRef = {
      id: 'crossRef',
      text : 'Enable CrossRef to automatically import works',
      help : 'Find and automatically import your publications. <a href="/help/crossref">[Step-by-Step Guide]</a>'
    };
    if( this.hasCrossRefEnabled(record) ) {
      crossRef.checked = this.hasCrossRefEnabled(record);
    }
    results.checklist.push(crossRef);

    // Employment
    let employment = {
      id : 'employment',
      text : 'Verified employment information',
      help : 'Your latest UC Davis position will be displayed in a consistent, discoverable manner. Click the plus button to get started.'
    };
    if( this.hasAppUcdEmployment(record) ) {
      employment.checked = true;
      results.total += config.points.employment;
    } 
    results.checklist.push(employment);

    // Other Id
    let external = {
      id : 'externalId',
      text : 'External identifier linked',
      help : 'Add your Scopus Author ID or ResearcherID as another way to import your works. '+
              '<a href="https://support.orcid.org/hc/en-us/articles/360006894854-Add-person-identifiers-other-identifiers-to-your-ORCID-record" target="_blank">[Step-by-Step Guide]</a>'
    };
    if( this.hasExternalId(record) ) {
      external.checked = true;
      results.total += config.points.externalId;
    }
    results.checklist.push(external);

    //  Works
    let works = {
      id : 'works',
      text : 'Works information',
      help : 'We recommend using CrossRef Metadata Search to import your publications '+
              '<a href="https://support.orcid.org/hc/en-us/articles/360006973653" target="_blank">[Step-by-Step Guide]</a>'
    };
    if( this.hasWorks(record) ) {
      works.checked = true;
      results.total += config.points.works;
    }
    results.checklist.push(works);

    // Education
    let education = {
      id : 'education',
      text : 'Education information',
      help : 'Add your undergraduate and graduate institutions. '+
              '<a href="https://support.orcid.org/hc/en-us/articles/360006973933-Add-an-education-or-qualification-to-your-ORCID-record" target="_blank">[Step-by-Step Guide]</a>'
    };
    if( this.hasEducation(record) ) {
      education.checked = true;
      results.total += config.points.education;
    }
    results.checklist.push(education);

    // Funding
    let funding = {
      id : 'funding',
      text : 'Funding information',
      help : 'Automatically import information about your grants using ÜberWizard. '+
            '<a href="https://support.orcid.org/hc/en-us/articles/360006897214-Add-funding-information-to-your-ORCID-record" target="_blank">[Step-by-Step Guide]</a>'
    };
    if( this.hasFunding(record) ) {
      funding.checked = true;
      results.total += config.points.funding;
    }
    results.checklist.push(funding);

    // Keywords
    let keywords = {
      id : 'keywords',
      text : 'Keywords about your work',
      help : 'Use keywords that describe your research work and interests. '+
              '<a href="https://support.orcid.org/hc/en-us/articles/360006971533-Add-keywords-to-your-ORCID-record" target="_blank">[Step-by-Step Guide]</a>'
    };
    if( this.hasKeywords(record) ) {
      keywords.checked = true;
      results.total += config.points.keywords;
    }
    results.checklist.push(keywords);

    // Website
    let website = {
      id : 'website',
      text : 'Your websites(s)',
      help : 'Adding links to your Twitter, blog, lab website, GitHub, etc., helps unify different aspects of your scholarship. '+
              '<a href="https://support.orcid.org/hc/en-us/articles/360006973833-Add-links-to-personal-websites-to-your-ORCID-record" target="_blank">[Step-by-Step Guide]</a>'
    };
    if( this.hasWebsite(record) ) {
      website.checked = true;
      results.total += config.points.websites;
    }
    results.checklist.push(website);

    return results;
  }

  /**
   * @method hasExternalId
   * @description does the record have any external identifiers associated to it
   * 
   * @param {Object} record Orcid record
   * 
   * @returns {Boolean}
   */
  hasExternalId(record) {
    if( !record.person ) return false;
    if( !record.person['external-identifiers'] ) return false;
    if( !record.person['external-identifiers']['external-identifier'] ) return false;
    if( record.person['external-identifiers']['external-identifier'].length > 0 ) return true;
    return false;
  }

  /**
   * @method hasEducation
   * @description does the record have any education information associated to it
   * 
   * @param {Object} record Orcid record
   * 
   * @returns {Boolean}
   */
  hasEducation(record) {
    if( !record['activities-summary'] ) return false;
    if( !record['activities-summary'].educations ) return false;
    if( !record['activities-summary'].educations['education-summary'] ) return false;
    if( record['activities-summary'].educations['education-summary'].length > 0 ) return true;
    return false;
  }

  /**
   * @method hasEmployment
   * @description does the record have any employment information associated to it
   * 
   * @param {Object} record Orcid record
   * 
   * @returns {Boolean}
   */
  hasEmployment(record) {
    if( !record['activities-summary'] ) return false;
    if( !record['activities-summary'].employments ) return false;
    if( !record['activities-summary'].employments['employment-summary'] ) return false;
    if( record['activities-summary'].employments['employment-summary'].length > 0 ) {
      return record['activities-summary'].employments['employment-summary'];
    }
    return false;
  }

  /**
   * @method hasCorrectUcdEmployment
   * @description does the record have ucd employment information associated to it
   * 
   * @param {Object} record Orcid record
   * 
   * @returns {Boolean}
   */
  hasAppUcdEmployment(record) {
    let employments = this.hasEmployment(record);
    if( !employments ) return false;

    for( let e of employments ) {
      if( !e.source ) continue;
      if( !e.source['source-client-id'] ) continue;
      if( e.source['source-client-id']['path'] === APP_CONFIG.clientId ) {
        return true;
      }
    }

    return false;
  }

  /**
   * @method hasFunding
   * @description does the record have funding information associated to it
   * 
   * @param {Object} record Orcid record
   * 
   * @returns {Boolean}
   */
  hasFunding(record) {
    if( !record['activities-summary'] ) return false;
    if( !record['activities-summary'].fundings ) return false;
    if( !record['activities-summary'].fundings.group ) return false;
    if( record['activities-summary'].fundings.group.length > 0 ) return true;
    return false;
  }

  /**
   * @method hasWorks
   * @description does the record have works information associated to it
   * 
   * @param {Object} record Orcid record
   * 
   * @returns {Boolean}
   */
  hasWorks(record) {
    if( !record['activities-summary'] ) return false;
    if( !record['activities-summary'].works ) return false;
    if( !record['activities-summary'].works.group ) return false;
    if( record['activities-summary'].works.group.length > 0 ) {
      return record['activities-summary'].works.group;
    }
    return false;
  }

  /**
   * @method hasCrossRefEnabled
   * @description attempts to see if any works have been added by cross ref.
   * If so, we know cross ref has been enabled
   * 
   * @param {Object} record Orcid record
   * 
   * @returns {Boolean}
   */
  hasCrossRefEnabled(record) {
    let works = this.hasWorks(record);
    if( !works ) return false;

    for( let w of works ) {
      if( !w['work-summary'] ) continue;
      for( let s of w['work-summary'] ) {
        if( !s.source ) continue;
        if( !s.source['source-client-id'] ) continue;
        if( s.source['source-client-id'].path === config.crossRefSourceId ) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * @method hasKeywords
   * @description does the record have keyword information associated to it
   * 
   * @param {Object} record Orcid record
   * 
   * @returns {Boolean}
   */
  hasKeywords(record) {
    if( !record.person ) return false;
    if( !record.person.keywords ) return false;
    if( !record.person.keywords.keyword ) return false;
    if( record.person.keywords.keyword.length > 0 ) return true;
    return false;
  }

  /**
   * @method hasWebsite
   * @description does the record have website information associated to it
   * 
   * @param {Object} record Orcid record
   * 
   * @returns {Boolean}
   */
  hasWebsite(record) {
    if( !record.person ) return false;
    if( !record.person['researcher-urls'] ) return false;
    if( !record.person['researcher-urls']['researcher-url'] ) return false;
    if( record.person['researcher-urls']['researcher-url'].length > 0 ) return true;
    return false;
  }

}

module.exports = new ValidatorModel();