({css:[...document.styleSheets].map(s=>[...s.cssRules].map(r=>r.cssText).join('\n')).join('\n'),html:[...document.body.children].filter(e=>e.tagName!=='SCRIPT').map(e=>e.outerHTML).join('\n')})
