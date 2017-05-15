var declarations = {
    CreateDatabase: function(){
        return 'CREATE DATABASE IF NOT EXISTS ';
    },
    UseDatabase: function(){
        return 'USE ';
    },
    CreateTable: function(){
        return 'CREATE TABLE IF NOT EXISTS ';
    },
    InsertIntoTable: function(){
        return 'INSERT INTO ';
    }
};


var statementType = [{
    type: 'CreateDatabase',
    keyWord: '--++'
},{
    type: 'UseDatabase',
    keyWord: '--|'
},{
    type: 'CreateTable',
    keyWord: '--+'
},{
    type: 'InsertIntoTable',
    keyWord: '-->'
}];

//tokenizer split the syntax in array with type and value
function tokenizer(input)
{
    var cursor = 0, tokens = [];
    while(input.length > cursor)
    {
        var char = input[cursor];

        //declaration
        var DECLARATION = /[\-|+]/;
        if(DECLARATION.test(char))
        {
            var declare = '';
            while(DECLARATION.test(char))
            {
                declare += char;
                char = input[++cursor];
            }
            tokens.push({type: 'declaration', value: declare});
            continue;
        }

        //white space
        var WS = /\s/;
        if(WS.test(char))
        {
            cursor++;
            continue;
        }

        //strings
        var STRINGS = /[a-zA-Z_]/;
        if(STRINGS.test(char))
        {
            var stringOrWord = '';
            while(STRINGS.test(char))
            {
                stringOrWord += char;
                char = input[++cursor];
            }
            tokens.push({type: 'strings', value: stringOrWord});
            continue;
        }

        //opening parentheses
        if(char === '(')
        {
            tokens.push({type: 'paren', value: char});
            cursor++;
            continue;
        }

        //closing parentheses
        if(char === ')')
        {
            tokens.push({type: 'paren', value: char});
            cursor++;
            continue;
        }

        //delemitor
        if(char === ',')
        {
            tokens.push({type: 'Separator', value: char});
            cursor++;
            continue;
        }

        //finishing
        if(char === ';')
        {
            tokens.push({type: 'endSyntax', value: char});
            cursor++;
            continue;
        }
    }
    return tokens;
}


//parser take the array of token and convert it into
//more experssif array
function parser(tokens)
{
    //set the cursor to zero
    var cursor = 0;


    //create the walk function in order to be able rollback
    //the function as needed as possible
    function walk(){

        //start the loop for cursor incrementation and value
        //returning as we are using function
        while(cursor < tokens.length)
        {

            //select the current object "{type: someType, value: someValue}"
            //in a variavle called token
            token = tokens[cursor];

            //If we find a declaration
            if(token.type === 'declaration')
            {

                //create an empty node variable in order to assign
                //different type base on the obeject type
                var node = {};

                //declare a variable no Match for the case where token type does not
                //match with one of the token set in the array declared before
                var noMatch = true;

                //for each element in the array
                statementType.forEach(function(element){

                    //we check if any keyword defined in that array
                    //match with the value of the current token
                    if(element.keyWord === token.value)
                    {

                        //if it match then variable noMatch is equal to false
                        noMatch = false;

                        //As we are on a declaration we have to move to the next token
                        //that could be the name of a table, database etc...
                        token = tokens[++cursor];

                        if(token.type === 'strings')
                        {
                            //after selecting the next token we assign the value selected
                            //to the statement type (eg: createTable, createDatabase, etc...)
                            node = {type: element.type, name: token.value ,params: []};

                            //we increment again to access the next token that is suppose
                            //to be a parenthese
                            token = tokens[++cursor];

                            //while we are not declaring something or closing a syntax using ";"
                            if(token.type !== 'endSyntax')
                            {
                                //we insert the following elemet as parameters trhough
                                //the function walk declare before
                                node.params.push(walk());

                                //As the parameters are parsing through the function walk cursor
                                //is incremented then we need to redeclare toke base on the new
                                //cursor already incremented
                                token = tokens[cursor];
                            }
                        }

                        //if we the table or database name is not a string then we throw an error
                        else
                        {
                            throw new TypeError(element.type + ': name must be a string');
                        }
                    }
                });

                //after the loop if no keyword and token type match
                if(noMatch)
                {
                    //we throw a error
                    throw new TypeError(token.type + ' is undefined');
                }

                //we increment the cursor for the next value
                cursor++;
                console.log(node);
                //we return the node of value {type: someType, value: someValue,
                //params: [{type: someType, value: someValue}, {type: someType, value: someValue, params: [...], ...}]}
                return node;
            }

            //after the declaration and the table or db name its the parenthese that start the statement.
            // so we check for the opening parenthese
            if(token.type === 'paren' && token.value === '(')
            {
                var node = {};
                //we move to the next character to take the column name
                token = tokens[++cursor];

                //column name must be a string
                if(token.type === 'strings')
                {
                    //we create a node of value of type column name that can take parameters
                    node = {type: 'ColumnName', name: token.value, params: []};

                    cursor++;
                    //if we do not meet parenthese
                    while(token.value !== ')' || token.value !== ',')
                    {
                        //we add token as parameters by rolling back the function walk()
                        //then it can analyse data before insert them
                        node.params.push(walk());

                        //we redeclare token base on the new value of cursor given by walk()
                        token = tokens[cursor];
                    }
                }



                //if column name id not a string then we throw an error
                else
                {
                    throw new TypeError('Column Name must be a string');
                }
                console.log(node);
                //we return the node generated
                return node;
            }

            //comma
            if(token.type === 'Separator' && token.value === ',')
            {
                var node = {};
                //we move to the next character to take the column name
                token = tokens[++cursor];

                //column name must be a string
                if(token.type === 'strings')
                {
                    //we create a node of value of type column name that can take parameters
                    node = {type: 'ColumnNameComma', name: token.value, params: []};

                    token = tokens[++cursor];

                    //if we do not meet parenthese
                    while(token.value !== ',')
                    {
                        //we add token as parameters by rolling back the function walk()
                        //then it can analyse data before insert them
                        node.params.push(walk());
                        console.log(token);
                        //we redeclare token base on the new value of cursor given by walk()
                        token = tokens[cursor];
                    }
                }



                //if column name id not a string then we throw an error
                else
                {
                    throw new TypeError('Column Name must be a string');
                }

                //we return the node generated
                console.log(node);
                return node;
            }

            //at this step any string is a datatype
            if(token.type === 'strings')
            {
                //we increment the cursor not the value of the token
                //we increment it first because return stop the script
                cursor++;
                console.log(token.value);
                //we now return an object that contain the value of the dataType
                return {type: 'dataType', value: token.value};
            }

            //if we meet the ';' we just return an object of type SyntaxFinished
            if(token.type === 'endSyntax')
            {
                cursor++;
                console.log(token.value);
                return {type: 'SyntaxFinished', value: token.value};
            }

            if(token.value === ')' && token.type === 'paren')
            {
                cursor++;
                console.log(token.value);
                return false;
            }
            //if we do not meet any of our defined type we throw an error
            throw new TypeError(node.type + ' is not defined');
        }
    }

    var ast = {
        type: 'SSQL',
        body: []
    };

    //we now push value on our ast will we find them
    //NB: we have declared the function walk without launched it
    //NB: when walk is returning cursor is incremented
    while(cursor < tokens.length)
    {
        ast.body.push(walk());
    }

    //we can now return the final value of our ast
    return ast;
}

//our traverser will help us to convert our node into more
//expressif and meanfull objects and also call our visitor
//NB: visitor will be an object that contain function with
//with our node name
function traverser(ast, visitor)
{
    //this function will help us to go trhough each array
    //we find in our node
    function traverseArray(array, parent)
    {
        array.forEach(function(object){

            //after fetching the array we boew call our
            //traverseNode function to fetch the child object
            //NB: traverseNode call traverseArray when the node has a parameter
            traverseNode(object, parent);
        });
    }

    //our traverseNode function will help us to fetch our
    //node object and call our visitor into it
    function traverseNode(object, parent)
    {
        //we first check if in our visitor we have a method
        //for this node type
        //NB: when you want to use variable as the name space
        //of an object you put it into square bracket
        var method = visitor[object.type];

        //we now check if the method exist
        if(method)
        {
            //then we call the method for the visitor to be executed
            method(object, parent);
        }

        //we make a switch to call the traverseArray if required
        switch (object.type) {
            //we check for our man program object SSQL
            case 'SSQL':
                //in this case we just fetch the array body
                //and we call the actual node as his parent
                traverseArray(object.body, object);
                break;
            case 'CreateDatabase':
            case 'CreateTable':
            case 'ColumnName':
            case 'ColumnNameComma':
                //in those cases we just fetch the array params
                //and we call the actual node as his parent
                traverseArray(object.params, object);
                break;
            case 'dataType':
                //in this case we just break no child
                //NB: dataType could have child we just leave it empty for the momemt
                break;
            case 'SyntaxFinished':
                //in this case we just break no child thas the end of the syntax
                break;
            default:
                throw new TypeError(node.type + ' is undefined');
        }
    }
    traverseNode(ast, null);
}


//our transormer
//this is where we call our traverser function using our visitor
function transformer(ast){

    //we make a clone of the original ast then it will not
    //directly be affected by transformations
    var newAst = {
        type: 'SSQL',
        body: []
    };

    //we store the ast node in an abstract namespace call _context
    //that will send his value to the newAst body
    //NB: remember s = storage drag n drop tutorial
    ast._context = newAst.body;

    //we now call our traverser traverser(ast, visitor)
    //NB: the visitor take the ast node type as the name of
    //his functions for them to be called easily
    traverser(ast, {
        //create database function
        CreateDatabase: function(node, parent){

            //our new expression
            var expression = {
                type: 'CreateDatabase',
                CallExpression: {
                    type: 'Identifier',
                    name: node.name
                },
                arguments: []
            };

            //we store the current expression (node) arguments
            //in an abstract representation like we did for ast
            //NB: it work like the function work the arguments will first be
            //analyse and then assign
            node._context = expression.arguments;
            parent._context.push(expression);
        },
        CreateTable: function(node, parent){

            //our new expression
            var expression = {
                type: 'CreateTable',
                CallExpression: {
                    type: 'Identifier',
                    name: node.name
                },
                arguments: []
            };

            //we store the current expression (node) arguments
            //in an abstract representation like we did for ast
            //NB: it work like the function work the arguments will first be
            //analyse and then assign
            node._context = expression.arguments;
            parent._context.push(expression);
        },
        ColumnName : function(node, parent){
            //our new expression
            var expression = {
                type: 'ColumnName',
                CallExpression: {
                    type: 'Identifier',
                    name: node.name
                },
                arguments: []
            };

            //we store the current expression (node) arguments
            //in an abstract representation like we did for ast
            //NB: it work like the function work the arguments will first be
            //analyse and then assign
            node._context = expression.arguments;
            parent._context.push(expression);
        },
        ColumnNameComma : function(node, parent){
            //our new expression
            var expression = {
                type: 'ColumnName',
                CallExpression: {
                    type: 'Identifier',
                    name: node.name
                },
                arguments: []
            };

            //we store the current expression (node) arguments
            //in an abstract representation like we did for ast
            //NB: it work like the function work the arguments will first be
            //analyse and then assign
            node._context = expression.arguments;
            parent._context.push(expression);
        },
        dataType : function(node, parent){
            //it does not have arguments so we do not need to
            //create the variable expression to push argument
            parent._context.push({type: 'DataType', value: node.value});
        },
        SyntaxFinished : function(node, parent){
            //it does not have arguments so we do not need to
            //create the variable expression to push argument
            parent._context.push({type: 'SyntaxFinished', value: node.value});
        }
    });
    return newAst;
}


//codeGenerator function to create the new string format we want
function codeGenerator(newAst)
{
    switch(newAst.type)
    {
        case 'SSQL':
            return newAst.body.map(codeGenerator).join('\n');
        case 'CreateDatabase':
            return ('CREATE DATABASE IF NOT EXISTS ' + codeGenerator(newAst.CallExpression) + ' ' + newAst.arguments.map(codeGenerator).join(' ') + ';');
        case 'CreateTable':
            return ('CREATE TABLE IF NOT EXISTS ' + codeGenerator(newAst.CallExpression) + '(' + '\n\t' + newAst.arguments.map(codeGenerator).join('\n') + '\n);');
        case 'Identifier':
            return newAst.name;
        case 'ColumnName':
            return (codeGenerator(newAst.CallExpression) + ' '+ newAst.arguments.map(codeGenerator).join(' '));
        case 'ColumnNameComma':
            return (', ' + codeGenerator(newAst.CallExpression) + ' '+ newAst.arguments.map(codeGenerator).join(' '));
        case 'DataType':
            return newAst.value;
        default :
            throw new TypeError(newAst.type + ' is undefined');
    }
}

//compiler function to compile everything
function compiler(input)
{
    var tokens = tokenizer(input);
    var ast = parser(tokens);
    var newAst = transformer(ast);
    var output = codeGenerator(newAst);
    return output;
}
var stat = '--++ dbname; --+ usertype (utid int primary key utName varchar);';
console.log(compiler(stat));
