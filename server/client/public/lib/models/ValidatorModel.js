const config = require('../config');

let text = {
  otherId : ''
}

class ValidatorModel {

  analyze(record) {

    let results = {
      checklist : [],
      errors : [],
      total : 0
    };

    // CrossRef
    let crossRef = {
      text : 'Enable CrossRef Metadata Search',
      help : 'Link your Scopus id. Under works -> Search & Link -> CrossRef Metadata Search.'
    };
    if( this.hasCrossRefEnabled(record) ) {
      crossRef.checked = this.hasCrossRefEnabled(record);
    } else if( this.hasWorks(record) ) {
      results.errors.push({
        text : 'You have works added to your record but do not appear to have CrossRef enabled',
        help : 'Link your Scopus id. Under works -> Search & Link -> CrossRef Metadata Search.'
      })
    }
    results.checklist.push(crossRef);

    // Employment
    let employment = {
      text : 'Employment information',
      help : 'Add employment via the section title "employment"'
    };
    if( this.hasEmployment(record) ) {
      employment.checked = true;
      results.total += config.points.employment;

      if( !this.hasCorrectUcdEmployment(record) ) {
        results.errors.push({
          text : 'Incorrect employment insitution displayed.',
          help : 'Multiple options for UC Davis exist in list. "University of California (Davis, CA, academic) is the preferred option.'
        });
      }
    }
    results.checklist.push(employment);

    // Other Id
    let external = {
      text : 'External identifier linked',
      help : 'Link your Scopus id. Under works -> Search & Link -> Scopus Author ID.'
    };
    if( this.hasExternalId(record) ) {
      external.checked = true;
      results.total += config.points.externalId;
    }
    results.checklist.push(external);

    //  Works
    let works = {
      text : 'Works information',
      help : 'You have no associated works.  Please link using CrossRef.'
    };
    if( this.hasWorks(record) ) {
      works.checked = true;
      results.total += config.points.works;
    }
    results.checklist.push(works);

    // Education
    let education = {
      text : 'Education information',
      help : 'Add education via the section title "Education"'
    };
    if( this.hasEducation(record) ) {
      education.checked = true;
      results.total += config.points.education;
    }
    results.checklist.push(education);

    // Funding
    let funding = {
      text : 'Funding information',
      help : 'Add funding via the section title "Funding"'
    };
    if( this.hasFunding(record) ) {
      funding.checked = true;
      results.total += config.points.funding;
    }
    results.checklist.push(funding);

    // Keywords
    let keywords = {
      text : 'Keywords about your work',
      help : 'Set keywords that describe your work.  Click pencil icon next to "Keywords"'
    };
    if( this.hasKeywords(record) ) {
      keywords.checked = true;
      results.total += config.points.keywords;
    }
    results.checklist.push(keywords);

    // Website
    let website = {
      text : 'Your Websites(s)',
      help : 'Set your personal or research websites. Click pencil icon next to "Websites"'
    };
    if( this.hasWebsite(record) ) {
      website.checked = true;
      results.total += config.points.websites;
    }
    results.checklist.push(website);

    return results;
  }

  hasExternalId(record) {
    if( !record.person ) return false;
    if( !record.person['external-identifiers'] ) return false;
    if( !record.person['external-identifiers']['external-identifiers'] ) return false;
    if( record.person['external-identifiers']['external-identifiers'].length > 0 ) return true;
    return false;
  }

  hasEducation(record) {
    if( !record['activities-summary'] ) return false;
    if( !record['activities-summary'].educations ) return false;
    if( !record['activities-summary'].educations['education-summary'] ) return false;
    if( record['activities-summary'].educations['education-summary'].length > 0 ) return true;
    return false;
  }

  hasEmployment(record) {
    if( !record['activities-summary'] ) return false;
    if( !record['activities-summary'].employments ) return false;
    if( !record['activities-summary'].employments['employment-summary'] ) return false;
    if( record['activities-summary'].employments['employment-summary'].length > 0 ) {
      return record['activities-summary'].employments['employment-summary'];
    }
    return false;
  }

  hasCorrectUcdEmployment(record) {
    let employments = this.hasEmployment(record);
    if( !employments ) return false;

    for( let e of employments ) {
      if( !e.organization ) continue;
      if( !e.organization['disambiguated-organization'] ) continue;
      if( e.organization['disambiguated-organization']['disambiguated-organization-identifier'] === config.ucdRinggoldId &&
          e.organization['disambiguated-organization']['disambiguation-source'] === 'RINGGOLD' ) {
        return true;
      }
    }

    return false;
  }

  hasFunding(record) {
    if( !record['activities-summary'] ) return false;
    if( !record['activities-summary'].fundings ) return false;
    if( !record['activities-summary'].fundings.group ) return false;
    if( record['activities-summary'].fundings.group.length > 0 ) return true;
    return false;
  }

  hasWorks(record) {
    if( !record['activities-summary'] ) return false;
    if( !record['activities-summary'].works ) return false;
    if( !record['activities-summary'].works.group ) return false;
    if( record['activities-summary'].works.group.length > 0 ) {
      return record['activities-summary'].works.group;
    }
    return false;
  }

  hasCrossRefEnabled(record) {
    let works = this.hasWorks(record);
    if( !works ) return false;

    for( let w of works ) {
      if( !w['work-summary'] ) continue;
      for( let s of w['work-summary'] ) {
        if( !s.source ) continue;
        if( !s.source['source-orcid'] ) continue;
        if( s.source['source-orcid'].path === config.crossRefSourceId ) {
          return true;
        }
      }
    }

    return false;
  }

  hasKeywords(record) {
    if( !record.person ) return false;
    if( !record.person.keywords ) return false;
    if( !record.person.keywords.keyword ) return false;
    if( record.person.keywords.keyword.length > 0 ) return true;
    return false;
  }

  hasWebsite(record) {
    if( !record.person ) return false;
    if( !record.person['researcher-urls'] ) return false;
    if( !record.person['researcher-urls']['researcher-url'] ) return false;
    if( record.person['researcher-urls']['researcher-url'].length > 0 ) return true;
    return false;
  }

}

module.exports = new ValidatorModel();