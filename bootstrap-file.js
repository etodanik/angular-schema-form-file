angular.module("schemaForm").run(["$templateCache", function($templateCache) {$templateCache.put("directives/decorators/bootstrap/file/file.html","<div class=\"form-group\" ng-controller=\"FileCtrl\" ng-class=\"{\'has-error\': hasError()}\">\n  <label class=\"control-label\" ng-show=\"showTitle()\">{{form.title}}</label>\n\n  <span ng-if=\"!$$value$$ && !uploading\">\n    <input ng-show=\"form.key\"\n           style=\"background-color: white\"\n           type=\"file\"\n           class=\"form-control\"\n           ng-file-select=\"onFileSelect($files)\" />\n  </span>\n  <div class=\'form-control\' ng-if=\"uploading && progress < 100\">\n    <div class=\"progress\">\n      <div class=\"progress-bar progress-bar-striped active\"  role=\"progressbar\" aria-valuenow=\"{{progress}}\" aria-valuemin=\"0\" aria-valuemax=\"100\" style=\"width: {{progress}}%\">\n        <span class=\"sr-only\">{{progress}}% Complete</span>\n      </div>\n    </div>\n  </div>\n  <span ng-if=\"$$value$$ && !uploading\">\n    <div class=\'form-control\'>\n      <a href=\"{{$$value$$.url}}\" target=\"_blank\">{{$$value$$.originalFilename}}</a>\n      <button class=\"btn btn-xs btn-danger\" ng-click=\"$$value$$ = null\">מחק קובץ</button>\n    </div>\n  </span>\n\n  <span class=\"help-block\">{{ (hasError() && errorMessage(schemaError())) || form.description}}</span>\n</div>\n");}]);
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
