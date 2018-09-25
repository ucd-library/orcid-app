class CustomSessionParser {
	read(doc) { 
    return JSON.parse( doc.session ) 
  }

	save(doc) { 
    return {
      session: JSON.stringify( doc ),
      expires: doc.cookie ? doc.cookie.expires : null,
		  modified: Date.now()
    }
  }
}

module.exports = CustomSessionParser;