const ssql = require('./ssql/ssql.js');

// ssql.compileFrom(__dirname + '/myssql');

function comp(data)
{
    var tokens = ssql.tokenizer(data);
    var ast = ssql.parser(tokens);
    return ast;
}
var data =
`@vc : VARCHAR;
--++ dbname;
--+ usertype (user_type_id int<11> primary key auto_increment, user_type_name @vc<60> not null);`;
console.log(comp(data).body[5].dataType);
