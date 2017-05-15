const statementType = require('./statementType.js');

module.exports = tokens => {
    var
    cursor = 0,
    i = 0,
    walk = () => {
        while(tokens.length > cursor)
        {
            var token = tokens[cursor];

            //variables
            if(token.type === 'VariableName')
            {
                cursor++;
                return {type: 'VariableName', name: token.name, params: [{type: 'variableValue', value: token.value}]};
            }


            //If we find a declaration
            if(token.type === 'Declarations')
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
                            if(token.type !== 'EndLine')
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
                //we return the node of value {type: someType, value: someValue,
                //params: [{type: someType, value: someValue}, {type: someType, value: someValue, params: [...], ...}]}
                return node;
            }

            //check for opening parenthese
            if(token.type === 'parenthese' && token.value === '(')
            {
                token = tokens[++cursor];
                if(token.type === 'strings')
                {
                    var node = {type: 'ColumnName', name: token.value, dataType: []};

                    token = tokens[++cursor];
                    if(token.value !== ',')
                    {
                        while(typeof token !== 'undefined')
                        {
                            if(token.type !== 'comma')
                            {

                                if(token.type !== 'parenthese')
                                {

                                    node.dataType.push(walk());
                                    token = tokens[cursor];
                                }
                                else
                                {
                                    return node;
                                }
                            }
                            else
                            {
                                return node;
                            }
                        }
                    }
                    return node;
                }
                else
                {
                    throw new TypeError('column name must be a string');
                }
            }


            //check for closing parenthese
            if(token.type === 'parenthese' && token.value === ')')
            {
                cursor++;
                continue;
            }


            //check for strings (data type in general)
            if(token.type === 'strings')
            {
                cursor++;
                return {type: 'DataType', value: token.value};
            }


            //check for strings (data type in general)
            if(token.type === 'StringsValue')
            {
                cursor++;
                return {type: 'StringsValue', value: token.value};
            }


            //check for numbers
            if(token.type === 'numbers')
            {
                cursor++;
                return {type: 'NumberLiteral', value: token.value};
            }


            //check for end lines ';'
            if(token.type === 'EndLine')
            {
                cursor++;
                return {type: 'EndLine', value: token.value};
            }


            //check for commma begining of ColumnNameComma
            if(token.type === 'comma')
            {

                token = tokens[++cursor];
                if(token.type === 'strings')
                {
                    var node = {type: 'ColumnNameComma', name: token.value, dataType: []};

                    cursor++;
                    if(tokens[cursor].value !== ',')
                    {
                        while(typeof token !== 'undefined')
                        {
                            if(token.type !== 'comma')
                            {

                                if(token.type !== 'parenthese')
                                {

                                    node.dataType.push(walk());
                                    token = tokens[cursor];
                                }
                                else
                                {
                                    return node;
                                }
                            }
                            else
                            {
                                return node;
                            }
                        }
                    }
                    return node;
                }
                else
                {
                    throw new TypeError('column name must be a string');
                }
            }


            //check for dataType options
            if(token.type === 'AngularBracket' && token.value === '<')
            {
                token = tokens[++cursor];
                var node = {type: 'dataTypeOptions', params: []};

                while(token.type !== 'AngularBracket')
                {
                    node.params.push(walk());
                    token = tokens[cursor];
                }
                cursor++;
                return node;
            }


            //show error if nothing match
            throw new TypeError('undefined token');

        }
    },
    ast = {type: 'SSQL', body: []};
    while(cursor < tokens.length)
    {
            ast.body.push(walk());
            if(typeof (ast.body[i]) === 'undefined')
            {
                ast.body.pop();
            }
            i++;
    }
    return ast;
};
