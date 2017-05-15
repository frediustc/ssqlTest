module.exports = input => {
    var
    cursor = 0,
    tokens = [],
    STRINGS = /[a-zA-Z_]/,
    _ALL = /[a-zA-Z0-9_\.]/,
    WHITESPACE = /\s/;


    while(input.length > cursor)
    {
        var char = input[cursor];

        // Declarations
        var DECLARE = /[\-]/;
        if(DECLARE.test(char))
        {
            var DECLARE_VALIDATION = /[\-|\\|\||>|\^|\*|<|+]/;
            var value = '';

            while(DECLARE_VALIDATION.test(char))
            {
                value += char;
                char = input[++cursor];
            }
            tokens.push({type: 'Declarations', value: value});
            continue;
        }


        //variable
        if(char === '@')
        {
            var value = '@';
            char =  input[++cursor];
            if(STRINGS.test(char))
            {
                while(char !== ':')
                {
                    if(_ALL.test(char))
                    {
                        value += char;
                        char = input[++cursor];
                    }
                    else if (WHITESPACE.test(char)) {
                        char = input[++cursor];
                        continue;
                    }
                    else{
                        throw new TypeError('Error compile variable declaration: ' + value);
                    }
                }

            }
            var display = false;
            tokens.forEach(function(element){
                if(element.name === value){
                    var params = element.value;
                    display = true;
                    cursor++;
                }
            });
            console.log(display.toString());
            if(!display)
            {
                while(WHITESPACE.test(char))
                {
                    char = input[++cursor];
                }
                if(char === ':')
                {
                    var params = '';
                    char =  input[++cursor];
                    while(WHITESPACE.test(char))
                    {
                        char = input[++cursor];
                    }
                    if(char !== ';')
                    {
                        while(char !== ';')
                        {
                            params += char;
                            char = input[++cursor];
                        }
                    }
                }
                tokens.push({type: 'VariableDeclaration', name: value, value: params});
            }
            else
            {
                tokens.push({type: 'VariableDisplay', name: value, value: params});
            }
            continue;

        }

        //search for parenthese
        if(char === '(' || char === ')')
        {
            tokens.push({type: 'parenthese', value: char});
            cursor++;
            continue;
        }


        //search Character

        if(STRINGS.test(char))
        {
            var _value = '';
            while(_ALL.test(char))
            {
                _value += char;
                char = input[++cursor];
            }

            tokens.push({type: 'strings', value: _value});
            continue;
        }


        //search for numbers
        var NUMBERS = /[0-9]/;
        if(NUMBERS.test(char))
        {
            var _value = '', _DOUBLE = /[0-9\.]/;
            while(_DOUBLE.test(char))
            {
                _value += char;
                char = input[++cursor];
            }

            tokens.push({type: 'numbers', value: _value});
            continue;
        }



        //skip white-space

        if(WHITESPACE.test(char))
        {
            cursor++;
            continue;
        }


        //search for separator comma for variable
        if(char === ',')
        {
            tokens.push({type: 'comma', value: char});
            cursor++;
            continue;
        }


        //search for angular bracket
        if(char === '<' || char === '>')
        {
            tokens.push({type: 'AngularBracket', value: char});
            cursor++;
            continue;
        }


        //search for single quote
        if(char === "'")
        {
            var _value = '';
            char = input[++cursor];
            while(char !== "'")
            {
                _value += char;
                char = input[++cursor];
            }
            if(char === "'")
            {
                cursor++;
            }
            tokens.push({type: 'StringsValue', value: _value});
            continue;
        }


        //search for double quotes
        if(char === '"')
        {
            var _value = '';
            char = input[++cursor];
            while(char !== '"')
            {
                _value += char;
                char = input[++cursor];
            }
            if(char === '"')
            {
                cursor++;
            }
            tokens.push({type: 'StringsValue', value: _value});
            continue;
        }


        //end line
        if(char === ';')
        {
            tokens.push({type: 'EndLine', value: char});
            cursor++;
            continue;
        }

        throw new TypeError('Undefined Character: ' + char);
    }
    return tokens;
}
