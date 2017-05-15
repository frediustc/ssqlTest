module.exports = (_dir) =>
{
    const _fs = require('fs');
    const _path = require('path');
    _fs.watch(_dir, (eventType, filename) => {
      if (filename) {
          var extension = _path.extname(filename);//gget the extension of the file
          var fileName = _path.basename(filename, extension);
          console.log(_dir);
          if(extension === '.ssql')
          {
              //declare the new file name to create
              newFileName = _dir + '/' + fileName + '.sql';

              //read the file
              _fs.readFile(_dir + '/' + filename, 'utf8', (err, data) => {
                if (err) throw err;

                  //take the value of the file and compile them
                //   var tokens = tokenizer(data);
                //   var ast = parser(tokens);
                //   var newAst = transformer(ast);
                //   var output = codeGenerator(newAst);

                  //insertion the value compiled into the new file and creation of the new file

                    _fs.writeFile(newFileName, data, 'utf8', (err) => {
                      if (err) throw err;
                      console.log('The file has been compiled and saved!');
                  });
            });
          }

      } else {
        console.log('filename not provided');
      }
    });
};
