angular.module("schemaForm").run(["$templateCache", function($templateCache) {$templateCache.put("directives/decorators/bootstrap/file/file.html","<div class=\"form-group\" ng-controller=\"FileCtrl\" ng-class=\"{\'has-error\': hasError()}\">\n  <label class=\"control-label\" ng-show=\"showTitle()\">{{form.title}}</label>\n  <input ng-show=\"form.key\"\n         style=\"background-color: white\"\n         type=\"file\"\n         class=\"form-control\"\n         ng-file-select=\"onFileSelect($files)\" />\n\n  <!--ng-model=\"$$value$$\" -->\n  <span class=\"help-block\">{{ (hasError() && errorMessage(schemaError())) || form.description}}</span>\n</div>\n");}]);
angular.module('schemaForm').config(
['schemaFormProvider', 'schemaFormDecoratorsProvider', 'sfPathProvider',
  function(schemaFormProvider,  schemaFormDecoratorsProvider, sfPathProvider) {

    var file = function(name, schema, options) {
      if (schema.type === 'string' && (schema.format === 'file')) {
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
    $scope.onFileSelect = function($files) {
      //$files: an array of files selected, each file has name, size, and type.
      for (var i = 0; i < $files.length; i++) {
        var file = $files[i];
        $scope.upload = $upload.upload({
          url: '/upload', //upload.php script, node.js route, or servlet url
          method: 'POST',
          //method: 'POST' or 'PUT',
          //headers: {'header-key': 'header-value'},
          //withCredentials: true,
          //data: {
            //myObj: $scope.myModelObj
          //},
          file: file, // or list of files ($files) for html5 only
          // fileName: 'doc.jpg' or ['1.jpg', '2.jpg', ...]
          // to modify the name of the file(s)
          // customize file formData name ('Content-Disposition'),
          // server side file variable name.
          // fileFormDataName: myFile,
          // or a list of names for multiple files (html5). Default is 'file'
          // customize how data is added to formData. See #40#issuecomment-28612000 for sample code
          // formDataAppender: function(formData, key, val){}
        }).progress(function(evt) {
          console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
        }).success(function(data, status, headers, config) {
          // file is uploaded successfully
          $scope.model[$scope.form.key[0]] = data;
        });
        //.error(...)
        //.then(success, error, progress);
        // access or attach event listeners to the underlying XMLHttpRequest.
        //.xhr(function(xhr){xhr.upload.addEventListener(...)})
      }
      /* alternative way of uploading, send the file
         binary with the file's content-type.
         Could be used to upload files to CouchDB, imgur, etc...
         html5 FileReader is needed.
         It could also be used to monitor the progress of a
         normal http post/put request with large data*/
      // $scope.upload = $upload.http({...})
      // see 88#issuecomment-31366487 for sample code.
    }
  }
]);
