/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *                                                                                     *
 * Copyright (C) 2015 Lukas Mayerhofer <lukas.mayerhofer@guh.guru>                     *
 *                                                                                     *
 * Permission is hereby granted, free of charge, to any person obtaining a copy        *
 * of this software and associated documentation files (the "Software"), to deal       *
 * in the Software without restriction, including without limitation the rights        *
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell           *
 * copies of the Software, and to permit persons to whom the Software is               *
 * furnished to do so, subject to the following conditions:                            *
 *                                                                                     *
 * The above copyright notice and this permission notice shall be included in all      *
 * copies or substantial portions of the Software.                                     *
 *                                                                                     *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR          *
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,            *
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE         *
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER              *
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,       *
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE       *
 * SOFTWARE.                                                                           *
 *                                                                                     *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
 
(function() {
  'use strict';

  angular
    .module('guh.ui')
    .directive('guhLineChart', guhLineChart);

    guhLineChart.$inject = ['$log', 'app', 'libs', 'DSHttpAdapter'];

    function guhLineChart($log, app, libs, DSHttpAdapter) {
      var directive = {
        bindToController: {
          deviceId: '=',
          label: '=',
          typeId: '='
        },
        controller: lineChartCtrl,
        controllerAs: 'lineChart',
        link: lineChartLink,
        restrict: 'E',
        scope: {},
        templateUrl: 'app/shared/ui/line-chart/line-chart.html',
        transclude: true
      };

      return directive;


      function lineChartCtrl() {

        /* jshint validthis: true */
        var vm = this;

        vm.dayCount = 6;
        vm.startDate = libs.moment().subtract(vm.dayCount, 'days');
        vm.endDate = libs.moment();
        vm.chartDefaults = {
          colors: {},
          options: {}
        };
        vm.chartLabels = [];
        vm.chartData = [];
        vm.chartData[0] = [];

        vm.init = init;


        function _setChartDefaults() {
          vm.chartDefaults.colors = [{
            fillColor: 'rgba(255, 255, 255, 0.2)',
            strokeColor: 'rgba(124, 192, 154, 1)',
            pointColor: 'rgba(255, 255, 255, 1)',
            pointStrokeColor: 'rgba(124, 192, 154, 1)',
            pointHighlightFill: 'rgba(255, 255, 255, 1)',
            pointHighlightStroke: 'rgba(87, 186, 174, 1)'
          }];

          vm.chartDefaults.options = {
            // Global
            animation: true,
            animationSteps: 60,
            animationEasing: 'easeOutQuart',
            showScale: true,
            scaleOverride: false,
            // Required if scaleOverride = true
            scaleSteps: null,
            scaleStepWidth: null,
            scaleStartValue: null,
            scaleLineColor: 'rgba(255, 255, 255, 0.4)',
            scaleLineWidth: 1,
            scaleShowLabels: true,
            scaleLabel: '<%=value%>',
            scaleIntegersOnly: true,
            scaleBeginAtZero: false,
            scaleFontFamily: 'Ubuntu',
            scaleFontSize: 12,
            scaleFontStyle: 'normal',
            scaleFontColor: '#676767',
            responsive: true,
            maintainAspectRatio: true,
            showTooltips: true,
            customTooltips: false,
            tooltipEvents: ['mousemove', 'touchstart', 'touchmove'],
            tooltipFillColor: 'rgba(124, 192, 154, 1)',
            tooltipFontFamily: 'Ubuntu',
            tooltipFontSize: 14,
            tooltipFontStyle: 'normal',
            tooltipFontColor: '#fff',
            tooltipTitleFontFamily: '"Ubuntu Bold"',
            tooltipTitleFontSize: 14,
            tooltipTitleFontStyle: 'normal',
            tooltipTitleFontColor: '#676767',
            tooltipYPadding: 8,
            tooltipXPadding: 8,
            tooltipCaretSize: 8,
            tooltipCornerRadius: 0,
            tooltipXOffset: 16,
            tooltipTemplate: '<%if (label){%><%=label%>: <%}%><%= value %> °C',
            multiTooltipTemplate: '<%= value %>',
            onAnimationProgress: function(){},
            onAnimationComplete: function(){},
            // Line Chart
            scaleShowGridLines: true,
            scaleGridLineColor: 'rgba(240, 240, 240, 1)',
            scaleGridLineWidth: 1,
            scaleShowHorizontalLines: true,
            scaleShowVerticalLines: true,
            bezierCurve: true,
            bezierCurveTension: 0.2,
            pointDot: true,
            pointDotRadius: 2,
            pointDotStrokeWidth: 1,
            pointHitDetectionRadius: 20,
            datasetStroke: true,
            datasetStrokeWidth: 1,
            datasetFill: true,
            legendTemplate: '<ul class="<%=name.toLowerCase()%>-legend"><% for (var i=0; i<datasets.length; i++){%><li><span style="background-color:<%=datasets[i].strokeColor%>"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>'
          };
        }

        function _loadData(startDate, endDate) {
          if(!vm.deviceId || !vm.typeId || !vm.startDate || !vm.endDate) {
            $log.log('Parameter missing.');
            return;
          }

          var filter = {
            deviceIds: [
              vm.deviceId
            ],
            timeFilters: [
              {
                endDate: vm.endDate.unix(),
                startDate: vm.startDate.unix()
              }
            ],
            typeIds: [
              vm.typeId
            ]
          };

          return DSHttpAdapter.GET(app.apiUrl + '/logs?filter=' + angular.toJson(filter));
        }

        function _getAverage(currentDayValues) {
          var sum = 0;
          var i = 0;
          var length = currentDayValues.length;

          for(i; i < length; i++) {
            sum += parseFloat(currentDayValues[i].value);
          }
          
          if(length > 0 ) {
            return sum / length;
          } else {
            return 0.0;
          }
        }

        function _createChart(logEntries) {
          var currentDate = vm.startDate;

          for(var i = 0; i <= vm.dayCount; i++) {
            if(i > 0) {
              currentDate = currentDate.add(1, 'days');
            }

            var currentDayValues = libs._.filter(logEntries, function(logEntry) {
              if(libs.moment(logEntry.timestamp).format('DDMMYYYY') === currentDate.format('DDMMYYYY')) {
                return true;
              }
            });

            vm.chartLabels.push(currentDate.format('ddd'));
            vm.chartData[0].push(Math.round(_getAverage(currentDayValues)));
          }
        }

        function init() {
          var logEntries = [];

          _setChartDefaults();

          _loadData()
            .then(function(response) {
              logEntries = response.data ? response.data : [];

              $log.log('logEntries', logEntries);

              _createChart(logEntries);
            })
            .catch(function() {
              $log.error('Can not load data.');
            });
        }

      }


      function lineChartLink(scope, element, attrs, lineChartCtrl) {
        lineChartCtrl.init();
      }
    }

}());