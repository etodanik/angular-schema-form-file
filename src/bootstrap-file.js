angular.module('schemaForm').config(
['schemaFormProvider', 'schemaFormDecoratorsProvider', 'sfPathProvider',
  function(schemaFormProvider,  schemaFormDecoratorsProvider, sfPathProvider) {

    var file = function(name, schema, options) {
      if (schema.type === 'object' && schema.format === 'file') {
        var f = schemaFormProvider.stdFormObj(name, schema, options);
        f.key  = options.path;
        f.type = 'file';
        options.lookup[sfPathProvider.stringify(options.path)] = f;
        return f;
      }
    };

    schemaFormProvider.defaults.string.unshift(file);

    //Add to the bootstrap directive
    schemaFormDecoratorsProvider.addMapping(
      'bootstrapDecorator',
      'file',
      'directives/decorators/bootstrap/file/file.html'
    );

    schemaFormDecoratorsProvider.createDirective(
      'file',
      'directives/decorators/bootstrap/file/file.html'
    );
  }
]);

angular.module('schemaForm').controller(
'FileCtrl',
['$scope', '$upload',
  function($scope, $upload) {
    $scope.uploading = false;
    $scope.onFileSelect = function($files) {
      $scope.uploading = true;
      for (var i = 0; i < $files.length; i++) {
        var file = $files[i];
        $scope.upload = $upload.upload({
          url: '/upload',
          method: 'POST',
          file: file,
        }).progress(function(evt) {
          $scope.progress = parseInt(100.0 * evt.loaded / evt.total);
        }).success(function(data, status, headers, config) {
          // file is uploaded successfully
          $scope.model[$scope.form.key[0]] = data;
          $scope.uploading = false;
        });
      }
    }
  }
]);
