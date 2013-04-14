{
   var h = "";
   var nw= [];    
}

start 
      = body { return {header: h, networks: nw};}

skip 
     = [' '\r\n\t]*

body 
     = (net / header)*

header 
       = head:[^\n]* '\n' skip { h = h + head.join('') + '\n';
                                 return h;}

net 
    = 'network={' skip q:oneNet skip '}' skip { nw.push(q); return q;}

oneNet 
       = 'ssid=' p:name skip skipPass?  'psk=' k:key skip 
          { return {ssid: p, psk: k};}

skipPass 
       = '#psk="' [0-9a-zA-Z]* '"'  skip
 
name 
       = '"' s:[^"]* '"' {return s.join('');}

key 
    = k:[0-9a-f]*  {return k.join('');}
