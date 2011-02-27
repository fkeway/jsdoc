/**
	Define tags that are known in JSDoc.
	@module jsdoc/tag/dictionary/definitions

	@author Michael Mathews <micmath@gmail.com>
	@license Apache License 2.0 - See file 'LICENSE.md' in this project.
 */
(function() {
    /** Populate the given dictionary with all known JSDoc tag definitions.
        @param {module:jsdoc/tag/dictionary} dictionary
    */
    exports.defineTags = function(dictionary) {
        
        dictionary.defineTag('access', {
            mustHaveValue: true,
            onTagged: function(doclet, tag) {
                // only valid values are private and protected, public is default
                if ( /^(private|protected)$/i.test(tag.value) ) {
                    doclet.access = tag.value.toLowerCase();
                }
                else {
                    delete doclet.access; 
                }
            }
        });
        
        dictionary.defineTag('alias', {
            mustHaveValue: true,
            onTagged: function(doclet, tag) {
                doclet.alias = tag.value;
            }
        });
        
        dictionary.defineTag('lends', {
            mustHaveValue: true,
            onTagged: function(doclet, tag) {
                doclet.alias = tag.value;
                doclet.addTag('undocumented');
            }
        });
        
        dictionary.defineTag('author', {
            mustHaveValue: true,
            onTagged: function(doclet, tag) {
                doclet.author = tag.value;
            }
        });
        
        // I add on to that
        dictionary.defineTag('augments', {
            mustHaveValue: true,
            onTagged: function(doclet, tag) {
                doclet.augment( firstWordOf(tag.value) );
            }
        })
        .synonym('extends');
        
        // that adds on to me
        dictionary.defineTag('borrows', {
            mustHaveValue: true,
            onTagged: function(doclet, tag) {
                var [target, source] = parseBorrows(doclet, tag);
                doclet.borrow(target, source);
            }
        })
        .synonym('mixes');
        
        dictionary.defineTag('class', {
            onTagged: function(doclet, tag) {
                doclet.addTag('kind', 'class');
                
                // handle special case where both @class and @constructor tags exist in same doclet
                if (tag.originalTitle === 'class') {
                    var looksLikeDesc = (tag.value || '').match(/\S+\s+\S+/); // multiple words after @class?
                    if ( looksLikeDesc || /@construct(s|or)\b/i.test(doclet.comment) ) {
                        doclet.classdesc = tag.value; // treat the @class tag as a @classdesc tag instead
                        return;
                    }
                }
                
                setDocletNameToValue(doclet, tag);
            }
        })
        .synonym('constructor');
        
        dictionary.defineTag('classdesc', {
            onTagged: function(doclet, tag) {
                doclet.classdesc = tag.value;
            }
        });
        
        dictionary.defineTag('constant', {
            onTagged: function(doclet, tag) {
                setDocletKindToTitle(doclet, tag);
                setDocletNameToValue(doclet, tag);
            }
        })
        .synonym('const');
        
        dictionary.defineTag('copyright', {
            mustHaveValue: true,
            onTagged: function(doclet, tag) {
                doclet.copyright = tag.value;
            }
        });
        
        dictionary.defineTag('constructs', {
            mustHaveValue: true,
            onTagged: function(doclet, tag) {
                var ownerClassName = firstWordOf(tag.value);
                doclet.addTag('alias', ownerClassName);
                doclet.addTag('kind', 'class');
            }
        });

		dictionary.defineTag('defaultvalue', {
            onTagged: function(doclet, tag) {
                if (tag.value) {
					doclet.defaultvalue = tag.value;
				}
				else if (doclet.meta && doclet.meta.code && typeof doclet.meta.code.value !== 'undefined') {
					if (doclet.meta.code.type && /STRING|NUMBER|NAME/.test(doclet.meta.code.type)) {
						doclet.defaultvalue = doclet.meta.code.value;
						if (doclet.meta.code.type === 'STRING') {
							// TODO: handle escaped quotes in values
							doclet.defaultvalue = '"'+doclet.defaultvalue.replace(/"/g, '\\"')+'"'
						}
					}
					else if (doclet.meta.code.type === 'NULL') {
						// TODO: handle escaped quotes in values
						doclet.defaultvalue = 'null'
					}
				}
            }
        })
		.synonym('default');
        
        dictionary.defineTag('deprecated', {
            // value is optional
            onTagged: function(doclet, tag) {
                doclet.deprecated = tag.value || true;
            }
        });
        
        dictionary.defineTag('description', {
            mustHaveValue: true
        })
        .synonym('desc');
        
        dictionary.defineTag('event', {
            onTagged: function(doclet, tag) {
                setDocletKindToTitle(doclet, tag);
                setDocletNameToValue(doclet, tag);
                applyNamespace(doclet, tag);
            }
        });
        
        dictionary.defineTag('example', {
            keepsWhitespace: true,
            mustHaveValue: true,
            onTagged: function(doclet, tag) {
                if (!doclet.examples) { doclet.examples = []; }
                doclet.examples.push(tag.value);
            }
        });
        
        dictionary.defineTag('exception', {
            mustHaveValue: true,
            canHaveType: true,
            onTagged: function(doclet, tag) {
                if (!doclet.exceptions) { doclet.exceptions = []; }
                doclet.exceptions.push(tag.value);
            }
        })
        .synonym('throws');
        
        dictionary.defineTag('exports', {
            mustHaveValue: true,
            onTagged: function(doclet, tag) {
                var modName = firstWordOf(tag.value);
                
                doclet.addTag('alias', modName);
                doclet.addTag('kind', 'module');
             }
        });
        
        dictionary.defineTag('file', {
            onTagged: function(doclet, tag) {
                setNameToFile(doclet, tag);
                setDocletKindToTitle(doclet, tag);
                setDocletDescriptionToValue(doclet, tag);
                
                doclet.preserveName = true;
            }
        })
        .synonym('fileoverview')
        .synonym('overview');
        
        dictionary.defineTag('fires', {
            mustHaveValue: true,
            onTagged: function(doclet, tag) {
                if (!doclet.fires) { doclet.fires = []; }
                doclet.fires.push(tag.value);
            }
        });
        
        dictionary.defineTag('function', {
            onTagged: function(doclet, tag) {
                setDocletKindToTitle(doclet, tag);
                setDocletNameToValue(doclet, tag);
            }
        })
        .synonym('method');
        
        dictionary.defineTag('global', {
            mustNotHaveValue: true,
            onTagged: function(doclet, tag) {
                doclet.scope = 'global';
                delete doclet.memberof;
            }
        });
        
        dictionary.defineTag('ignore', {
            mustNotHaveValue: true,
            onTagged: function(doclet, tag) {
                doclet.ignore = true;
            }
        });
        
        dictionary.defineTag('inner', {
            onTagged: function(doclet, tag) {
                setDocletScopeToTitle(doclet, tag);
             }
        });
        
        dictionary.defineTag('instance', {
            onTagged: function(doclet, tag) {
                setDocletScopeToTitle(doclet, tag);  
            }
        });
        
        dictionary.defineTag('kind', {
            mustHaveValue: true
        });
        
        dictionary.defineTag('license', {
            mustHaveValue: true,
            onTagged: function(doclet, tag) {
                doclet.license = tag.value;
            }
        });
        
        dictionary.defineTag('memberof', {
            mustHaveValue: true,
            onTagged: function(doclet, tag) {
                setDocletMemberof(doclet, tag);
             }
        })
        .synonym('member');
        
        dictionary.defineTag('mixin', {
            onTagged: function(doclet, tag) {
                setDocletKindToTitle(doclet, tag);
                setDocletNameToValue(doclet, tag);
            }
        });
        
        dictionary.defineTag('module', {
            isNamespace: true,
            onTagged: function(doclet, tag) {
                setDocletKindToTitle(doclet, tag);
                setDocletNameToValue(doclet, tag);
                doclet.name || setDocletNameToFilename(doclet, tag);
             }
        });
        
        dictionary.defineTag('name', {
            mustHaveValue: true
        });
        
        dictionary.defineTag('namespace', {
            onTagged: function(doclet, tag) {
                setDocletKindToTitle(doclet, tag);
                setDocletNameToValue(doclet, tag);
            }
        });
        
        dictionary.defineTag('param', {
            mustHaveValue: true,
            canHaveType: true,
            canHaveName: true,
            onTagged: function(doclet, tag) {
                if (!doclet.params) { doclet.params = []; }
                doclet.params.push(tag.value);
            }
        })
        .synonym('argument')
        .synonym('arg');
        
        dictionary.defineTag('private', {
            mustNotHaveValue: true,
            onTagged: function(doclet, tag) {
                doclet.access = 'private';
            }
        });
        
        dictionary.defineTag('property', {
            onTagged: function(doclet, tag) {
                setDocletKindToTitle(doclet, tag);
                setDocletNameToValue(doclet, tag);
            }
        });
        
        dictionary.defineTag('protected', {
            mustNotHaveValue: true,
            onTagged: function(doclet, tag) {
                doclet.access = 'protected';
            }
        });
        
        dictionary.defineTag('public', {
            mustNotHaveValue: true,
            onTagged: function(doclet, tag) {
                delete doclet.access; // public is default
            }
        });
        
        // use this instead of old deprecated @final tag
        dictionary.defineTag('readonly', {
            mustNotHaveValue: true,
            onTagged: function(doclet, tag) {
                doclet.readonly = true;
            }
        });
        
        dictionary.defineTag('requires', {
            mustHaveValue: true,
            onTagged: function(doclet, tag) {
                var modName = firstWordOf(tag.value);
                if (modName.indexOf('module:') !== 0) {
                    modName = 'module:'+modName;
                }
                if (!doclet.requires) { doclet.requires = []; }
                doclet.requires.push(modName);
            }
        });
        
        dictionary.defineTag('returns', {
            mustHaveValue: true,
            canHaveType: true,
            onTagged: function(doclet, tag) {
                 if (!doclet.returns) { doclet.returns = []; }
                doclet.returns.push(tag.value);
            }
        })
        .synonym('return');
        
        dictionary.defineTag('see', {
            mustHaveValue: true,
            onTagged: function(doclet, tag) {
                if (!doclet.see) { doclet.see = []; }
                doclet.see.push(tag.value);
            }
        });
        
        dictionary.defineTag('since', {
            mustHaveValue: true,
            onTagged: function(doclet, tag) {
                doclet.since = tag.value;
            }
        });
        
        dictionary.defineTag('summary', {
            mustHaveValue: true,
            onTagged: function(doclet, tag) {
                doclet.summary = tag.value;
            }
        });
        
        dictionary.defineTag('this', {
            mustHaveValue: true,
            onTagged: function(doclet, tag) {
                if (!doclet.see) { doclet.see = []; }
                doclet['this'] = firstWordOf(tag.value);
            }
        });
        
        dictionary.defineTag('type', {
            mustHaveValue: true,
            canHaveType: true,
            onTagText: function(text) {
                // any text must be formatted as a type, but for back compat braces are optional
                if ( ! /^\{.+\}$/.test(text) ) {
                    text = '{ '+text+' }';
                }
                return text;
            },
            onTagged: function(doclet, tag) {
                if (tag.value.type) {
                    doclet.type = tag.value.type;
                    doclet.addTag('returns', tag.text); // for backwards compatibility we allow @type for functions to imply return type
                }
            }
        });
        
        dictionary.defineTag('typedef', {
            canHaveType: true,
            canHaveName: true,
            onTagged: function(doclet, tag) {
                setDocletKindToTitle(doclet, tag);
                
                if (tag.value) {
                    if (tag.value.name) {
                        doclet.addTag('name', tag.value.name);
                    }
                    if (tag.value.type) {
                        doclet.type = tag.value.type;
                    }
                }
            }
        });
        
        dictionary.defineTag('undocumented', {
            mustNotHaveValue: true,
            onTagged: function(doclet, tag) {
                doclet.undocumented = true;
                doclet.comment = '';
            }
        });
        
        dictionary.defineTag('variation', {
            mustHaveValue: true,
            onTagged: function(doclet, tag) {
                doclet.variation = tag.value;
            }
        });
        
        dictionary.defineTag('version', {
            mustHaveValue: true,
            onTagged: function(doclet, tag) {
                doclet.version = tag.value;
            }
        });
    }
    
    /** @private */
	function setDocletKindToTitle(doclet, tag) {
	    doclet.addTag( 'kind', tag.title );
	}
	
	function setDocletScopeToTitle(doclet, tag) {
	    doclet.addTag( 'scope', tag.title );
	}
	
	function setDocletNameToValue(doclet, tag) {
	    if (tag.text) {
	        doclet.addTag( 'name', tag.text );
	    }
	}
	
	function setDocletDescriptionToValue(doclet, tag) {
	    if (tag.value) {
	        doclet.addTag( 'description', tag.value );
	    }
	}
	
	function setNameToFile(doclet, tag) {
	    if (doclet.meta.filename) { doclet.addTag( 'name', 'file:'+doclet.meta.filename ); }
	}
	
	function setDocletMemberof(doclet, tag) {
	    doclet.setMemberof(tag.value);
	}

	function applyNamespace(doclet, tag) {
	    if (!doclet.name) return; // error?
	    
	    //doclet.displayname = doclet.name;
	    doclet.longname = app.jsdoc.name.applyNamespace(doclet.name, tag.title)
	}
	
	function setDocletNameToFilename(doclet, tag) {
	    var name = doclet.meta.filename;
	    name = name.replace(/\.js$/i, '');
	    
	    for (var i = 0, len = env.opts._.length; i < len; i++) {
	        if (name.indexOf(env.opts._[i]) === 0) {
	            name = name.replace(env.opts._[0], '');
	            break
	        }
	    }
	    doclet.name = name;
	}
	
	function parseBorrows(doclet, tag) {
	    var m = /^(\S+)(?:\s+as\s+(\S+))?$/.exec(tag.text);
	    if (m) {
	        if (m[1] && m[2]) {
	            return [ m[1], m[2] ];
	        }
	        else if (m[1]) {
	            return [ m[1] ];
	        }
	    }
	}
	
	function firstWordOf(string) {
	    var m = /^(\S+)/.exec(string);
	    if (m) { return m[1]; }
	    else { return ''; }
	}
})();