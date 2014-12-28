angular.module('schemaForm')

.config(
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

  schemaFormDecoratorsProvider.addMapping(
    'bootstrapDecorator',
    'file',
    'directives/decorators/bootstrap/file/file.html'
  );

  schemaFormDecoratorsProvider.createDirective(
    'file',
    'directives/decorators/bootstrap/file/file.html'
  );
}])

.directive('assureitDecoratorUpload', function($upload, $window, sfSelect, schemaForm, sfValidator) {
  return {
    template:
    '' +
    '<div ng-hide="data" class="form-control">' +
    '	<input ng-disabled="form.readonly" ng-hide="inProgress > 0" type="file" ng-file-select="upload($files)">' +
    '	<div ng-show="inProgress" class="progress">' +
    '	  <div class="progress-bar progress-bar-striped active" role="progressbar" style="width: 100%"></div>' +
    '	</div>' +
    '</div>' +
    '<div ng-show="data">' +
    '  <div style="margin: 5px; padding-right: 35px; font-weight: bold;" ng-bind-html="data.name"></div>' + 
    '  <div style="margin-right: 35px;" class="btn btn-default" ng-click="download()">הורד קובץ</div>' +
    '  <div ng-disabled="form.readonly" class="btn btn-danger" ng-click="remove()"><i class="glyphicon glyphicon-trash"></i> מחק קובץ</div>' +
    '</div>',
    restrict: 'A',
    scope: false,
    require: 'ngModel',
    link: function(scope, element, attrs, ngModel) {
      scope.inProgress = false;
      scope.data = sfSelect(scope.form.key, scope.model);

      scope.upload = function($files) {
        scope.inProgress = true;
        $upload.upload({
            url: '/upload',
            method: 'POST',
            data: {},
            file: $files,
          }).success(function(data, status, headers, config) {
            scope.inProgress = false;
            scope.data = data;
            ngModel.$setViewValue(data);
            scope.$emit('schemaFormValidate');
          })
          .error(function(err) {
            scope.inProgress = false;
            alert('There was an issue uploading your file. Please try again.');
          })
      };

      scope.remove = function() {
        ngModel.$setViewValue(undefined);
        scope.data = undefined;
      }

      scope.download = function() {
        var d = window.document.getElementById('downloads');
        if (d)
          d.src = scope.data.url;
        else
          $window.open(scope.data.url);
      }


      var error;

      scope.validateArray = function() {
        var result = sfValidator.validate(scope.form, scope.data);
        var acceptRegex;

        if(scope.form.accept){
          acceptRegex = new RegExp(scope.form.accept.replace(/,\s*/g, '|') + '$', 'i');
        }

        if(scope.form.accept && scope.data && scope.data.url && !acceptRegex.test(scope.data.url)){
          ngModel.$setViewValue(scope.data);
          error = {
            code: 302,
            schemaPath: '/',
            message: 'קובץ מסוג לא תקין. סניתן להעלות קבצים מסוג: ' + scope.form.accept
          };
          ngModel.$setValidity('schema', false);
        } else if (
          result.valid === false &&
          result.error &&
          (
            result.error.dataPath === '' ||
            result.error.dataPath === '/' + scope.form.key[scope.form.key.length - 1]
          )
        ) {
          // Set viewValue to trigger $dirty on field. If someone knows a
          // a better way to do it please tell.
          ngModel.$setViewValue(scope.data);
          error = result.error;
          ngModel.$setValidity('schema', false);

        } else {
          ngModel.$setValidity('schema', true);
        }
      };

      scope.$on('schemaFormValidate', scope.validateArray);

      scope.hasSuccess = function() {
        return ngModel.$valid && !ngModel.$pristine;
      };

      scope.hasError = function() {
        console.log('hasError', ngModel.$invalid);
        return ngModel.$invalid;
      };

      scope.schemaError = function() {
        console.log('schemaError', error);
        return error;
      };

    }
  }
});
