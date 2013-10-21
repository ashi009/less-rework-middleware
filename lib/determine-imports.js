var Path = require('path');

module.exports = function determineImports(root) {

  var imports = {};
  visitRules(root.rules);

  return Object.keys(imports).map(function(key) {
    return imports[key];
  });

  function visitRules(rules) {
    if (!rules)
      return;
    rules.forEach(function (rule) {
      if (rule.importedFilename) {
        // A import rule
        imports[rule.importedFilename] = {
          mtime: Date.now(),
          path: rule.importedFilename
        };
        return visitRules(rule.root.rules);
      }
      visitRules(rule.rules);
      findDataUris(rule.value);
    });
  }

  function findDataUris(value) {
    if (!value)
      return;
    if (Array.isArray(value))
      return value.forEach(findDataUris);
    if (value.value)
      return findDataUris(value.value);
    if (value.name == 'data-uri') {
      var args = value.args;
      var name = args[args.length - 1].value[0];
      var path = Path.resolve(name.currentFileInfo.entryPath, name.value);
      imports[path] = {
        mtime: Date.now(),
        path: path
      };
    }
  }

};
