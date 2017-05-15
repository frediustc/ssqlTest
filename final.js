const tokenizer = require('./tokenizer.js');
const parser = require('./parser.js');
const compiler = require('./compiler.js');
const fs = require('fs');

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

// function traverser(ast, visitor)
// {
//     //this function will help us to go trhough each array
//     //we find in our node
//     function traverseArray(array, parent)
//     {
//         array.forEach(function(object){
//
//             //after fetching the array we boew call our
//             //traverseNode function to fetch the child object
//             //NB: traverseNode call traverseArray when the node has a parameter
//             traverseNode(object, parent);
//         });
//     }
//
//     //our traverseNode function will help us to fetch our
//     //node object and call our visitor into it
//     function traverseNode(object, parent)
//     {
//         //we first check if in our visitor we have a method
//         //for this node type
//         //NB: when you want to use variable as the name space
//         //of an object you put it into square bracket
//         var method = visitor[object.type];
//
//         //we now check if the method exist
//         if(method)
//         {
//             //then we call the method for the visitor to be executed
//             method(object, parent);
//         }
//
//         //we make a switch to call the traverseArray if required
//         switch (object.type) {
//             //we check for our man program object SSQL
//             case 'SSQL':
//                 //in this case we just fetch the array body
//                 //and we call the actual node as his parent
//                 traverseArray(object.body, object);
//                 break;
//             case 'CreateDatabase':
//             case 'CreateTable':
//             case 'ColumnName':
//             case 'ColumnNameComma':
//             case 'DataTypeOptions':
//                 //in those cases we just fetch the array params
//                 //and we call the actual node as his parent
//                 traverseArray(object.params, object);
//                 break;
//             case 'DataType':
//             case 'NumberLiteral':
//             case 'SyntaxFinished':
//                 //in this case we just break no child
//                 break;
//             default:
//                 throw new TypeError(node.type + ' is undefined');
//         }
//     }
//     traverseNode(ast, null);
// }


//our transormer
//this is where we call our traverser function using our visitor
// function transformer(ast){
//
//     //we make a clone of the original ast then it will not
//     //directly be affected by transformations
//     var newAst = {
//         type: 'SSQL',
//         body: []
//     };
//
//     //we store the ast node in an abstract namespace call _context
//     //that will send his value to the newAst body
//     //NB: remember s = storage drag n drop tutorial
//     ast._context = newAst.body;
//
//     //we now call our traverser traverser(ast, visitor)
//     //NB: the visitor take the ast node type as the name of
//     //his functions for them to be called easily
//     traverser(ast, {
//         //create database function
//         CreateDatabase: function(node, parent){
//
//             //our new expression
//             var expression = {
//                 type: 'CreateDatabase',
//                 CallExpression: {
//                     type: 'Identifier',
//                     name: node.name
//                 },
//                 arguments: []
//             };
//
//             //we store the current expression (node) arguments
//             //in an abstract representation like we did for ast
//             //NB: it work like the function work the arguments will first be
//             //analyse and then assign
//             node._context = expression.arguments;
//             parent._context.push(expression);
//         },
//         CreateTable: function(node, parent){
//
//             //our new expression
//             var expression = {
//                 type: 'CreateTable',
//                 CallExpression: {
//                     type: 'Identifier',
//                     name: node.name
//                 },
//                 arguments: []
//             };
//
//             //we store the current expression (node) arguments
//             //in an abstract representation like we did for ast
//             //NB: it work like the function work the arguments will first be
//             //analyse and then assign
//             node._context = expression.arguments;
//             parent._context.push(expression);
//         },
//         ColumnName : function(node, parent){
//             //our new expression
//             var expression = {
//                 type: 'ColumnName',
//                 CallExpression: {
//                     type: 'Identifier',
//                     name: node.name
//                 },
//                 arguments: []
//             };
//
//             //we store the current expression (node) arguments
//             //in an abstract representation like we did for ast
//             //NB: it work like the function work the arguments will first be
//             //analyse and then assign
//             node._context = expression.arguments;
//             parent._context.push(expression);
//         },
//         ColumnNameComma : function(node, parent){
//             //our new expression
//             var expression = {
//                 type: 'ColumnName',
//                 CallExpression: {
//                     type: 'Identifier',
//                     name: node.name
//                 },
//                 arguments: []
//             };
//
//             //we store the current expression (node) arguments
//             //in an abstract representation like we did for ast
//             //NB: it work like the function work the arguments will first be
//             //analyse and then assign
//             node._context = expression.arguments;
//             parent._context.push(expression);
//         },
//         DataTypeOptions : function(node, parent){
//             //our new expression
//             var expression = {
//                 type: 'DataTypeOptions',
//                 arguments: []
//             };
//
//             //we store the current expression (node) arguments
//             //in an abstract representation like we did for ast
//             //NB: it work like the function work the arguments will first be
//             //analyse and then assign
//             node._context = expression.arguments;
//             parent._context.push(expression);
//         },
//     DataType : function(node, parent){
//             //it does not have arguments so we do not need to
//             //create the variable expression to push argument
//             parent._context.push({type: 'DataType', value: node.value});
//         },
//         NumberLiteral : function(node, parent){
//             //it does not have arguments so we do not need to
//             //create the variable expression to push argument
//             parent._context.push({type: 'DataType', value: node.value});
//         },
//         SyntaxFinished : function(node, parent){
//             //it does not have arguments so we do not need to
//             //create the variable expression to push argument
//             parent._context.push({type: 'SyntaxFinished', value: node.value});
//         }
//     });
//     return newAst;
// }
//
//
// //codeGenerator function to create the new string format we want
// function codeGenerator(newAst)
// {
//     switch(newAst.type)
//     {
//         case 'SSQL':
//             return newAst.body.map(codeGenerator).join('\n');
//         case 'CreateDatabase':
//             return ('CREATE DATABASE IF NOT EXISTS ' + codeGenerator(newAst.CallExpression) + ' ' + newAst.arguments.map(codeGenerator).join(' ') + ';');
//         case 'CreateTable':
//             return ('CREATE TABLE IF NOT EXISTS ' + codeGenerator(newAst.CallExpression) + '(' + '\n\t' + newAst.arguments.map(codeGenerator).join('\n') + '\n)');
//         case 'Identifier':
//             return newAst.name;
//         case 'ColumnName':
//             return ('\n\t' + codeGenerator(newAst.CallExpression) + ' '+ newAst.arguments.map(codeGenerator).join(' '));
//         case 'ColumnNameComma':
//             return (', ' + codeGenerator(newAst.CallExpression) + ' '+ newAst.arguments.map(codeGenerator).join(' '));
//         case 'DataTypeOptions':
//             return ('(' +  newAst.arguments.map(codeGenerator).join(',') + ')');
//         case 'DataType':
//             return newAst.value;
//         case 'SyntaxFinished':
//             return newAst.value;
//         default :
//             throw new TypeError(newAst.type + ' is undefined');
//     }
// }

var stat = '(utid int<11> primary key auto_increment,utName varchar<60> not null);';
console.log(compiler(stat));
