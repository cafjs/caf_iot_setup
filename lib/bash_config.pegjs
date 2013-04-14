{
   var prop= {};
}

start
        = body { return prop}

skip
        = [' '\r\n\t]* 

body 
     = (skipComment / prop)*

skipComment
        = skip '#' [^\n]* '\n' skip

prop
        = skip name:[^=]* '=' value:[^' '\r\n\t]*  skip 
                { prop[name.join('')] = value.join('');
                  return prop;}
