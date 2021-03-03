import React, { Component, Fragment } from 'react';
import { withRouter } from "react-router-dom";
import { inject } from 'mobx-react';
import { toast } from 'react-toastify';
import ReactTooltip from 'react-tooltip';
import Moment from 'moment';

import { ScrollSync, ScrollSyncPane } from 'react-scroll-sync';
import DefineWsActualsSortGanttCharts from './DefineWsActualsSortGanttCharts';
import '../DefineWorkstream/AllWsInfoAndCharts.css';
import WsTimelineHeader from '../DefineWsTimeline/WsTimelineHeader'
import { VIEW_MODE_DAY, VIEW_MODE_MONTH, VIEW_MODE_YEAR } from '../DefineWsTimeline/DateConstants';
import { DAY_MONTH_MODE, DAY_DAY_MODE, DAY_YEAR_MODE } from '../DefineWsTimeline/DateConstants';
import DateHelper from '../DefineWsTimeline/DateHelper';

import rightIndIcon from '../../assets/project/workstream/right-ind.svg';
import downIndIcon from '../../assets/project/workstream/down-ind.svg';
import NotificationMessage from '../../components/NotificationMessage/NotificationMessage';

@inject('workstreamStore')
class DefineWsActualsSortView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            // timeline change variables
            numOfDiffDays: 1,
            singleDayWidth: 3,
            bufferDays: 30,

            // connectors and all deliverables variables
            allDelIdObj: {},

            //today view
            todayLeftPixels: 0,
            
            // new ws design state variables
            showLoadingInd: true,
            showEllipsisMenu: false,
            openMenuType: '',
            addedNewWsArray: [],
            overAllStartDate: '',
            overAllEndDate: '',
            allWsDataArray: []
        };
        this.chartContainerRef = React.createRef();

        this.isDefined = this.isDefined.bind(this);
        this.assignDateMode = this.assignDateMode.bind(this);
        this.fetchAllWsTreeDetailsSort = this.fetchAllWsTreeDetailsSort.bind(this);
    }

    componentDidMount() {
        this.fetchAllWsTreeDetailsSort();
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.selectedDateMode !== this.props.selectedDateMode) {
            this.assignDateMode();
        }
        if (this.props.selectedSortKeys.length !== 0 && prevProps.selectedSortKeys[0] !== this.props.selectedSortKeys[0]) {
            this.setState({
                showLoadingInd: true,
            })
            this.fetchAllWsTreeDetailsSort();
        }
    }

    getDayWidth = (mode) => {
        switch (mode) {
            case VIEW_MODE_DAY:
                return DAY_DAY_MODE;
            case VIEW_MODE_MONTH:
                return DAY_MONTH_MODE;
            case VIEW_MODE_YEAR:
                return DAY_YEAR_MODE;
            default:
                return DAY_MONTH_MODE;
        }
    }

    // Accepts the array and key
    groupBy = (array, key) => {
        // Return the end result
        return array.reduce((result, currentValue) => {
            // If an array already present for key, push it to the array. Else create an array and push the object
            (result[currentValue[key]] = result[currentValue[key]] || []).push(
                currentValue
            );
            // Return the current iteration `result` value, this will be taken as next iteration `result` value and accumulate
            return result;
        }, {}); // empty object is the initial value for result object
    };

    getBufferDays = (mode, diffDays, dayWidth) => {
        let buffer = 30;
        const { overAllStartDate } = this.state;
        let startdateWithBuffer = overAllStartDate;
        let startday = '';
        let temp = '';
        let originalStart = '';

        if (this.chartContainerRef && this.chartContainerRef.current) {
            let chart_viewport = this.chartContainerRef.current.clientWidth;
            buffer = Number(diffDays) - Math.ceil(chart_viewport / dayWidth);
            if (buffer > 0) {

                if (mode === 'month') {
                    buffer = 0;
                    startdateWithBuffer = Moment(overAllStartDate).subtract(buffer, 'days');
                    startday = DateHelper.getStartDate(startdateWithBuffer, mode);
                    temp = startday.startOf('day');
                    originalStart = startdateWithBuffer.diff(temp, 'days');
                    if (originalStart < 10) {
                        buffer = originalStart + startdateWithBuffer.subtract(1, 'months').daysInMonth()
                    } else {
                        buffer = originalStart;
                    }

                } else if (mode === 'year') {
                    buffer = 0;
                    startdateWithBuffer = Moment(overAllStartDate).subtract(buffer, 'days');
                    startday = DateHelper.getStartDate(startdateWithBuffer, mode);
                    temp = startday.startOf('day');
                    originalStart = startdateWithBuffer.diff(temp, 'days');
                    if (originalStart < 150) {
                        buffer = originalStart + startdateWithBuffer.subtract(1, 'years').daysInMonth()
                    } else {
                        buffer = originalStart;
                    }

                } else {
                    buffer = 1;
                }
            } else {
                buffer = Math.ceil((buffer * -1) / 2);
                if (mode === 'month') {
                    startdateWithBuffer = Moment(overAllStartDate).subtract(buffer, 'days');
                    startday = DateHelper.getStartDate(startdateWithBuffer, mode);
                    temp = startday.startOf('day');
                    originalStart = startdateWithBuffer.diff(temp, 'days');
                    buffer = buffer + originalStart;
                }

            }
        }
        return buffer;
        // switch (mode) {
        //     case VIEW_MODE_DAY:
        //       return 0;         
        //     case VIEW_MODE_MONTH:
        //       return 30;
        //     case VIEW_MODE_YEAR:
        //       return 30;
        //     default:
        //       return 30;
        //   }

    }

      setTodayPixels = (selectedDateMode, dayWidth, buffer_days) => {
        const { overAllStartDate, overAllEndDate } = this.state;
        let leftPixels = 0;
        let tempToday = DateHelper.getToday();
        if (this.isDefined(overAllStartDate) && this.isNonEmpty(overAllStartDate) && 
        this.isDefined(overAllEndDate) && this.isNonEmpty(overAllEndDate)) {
            let startdateWithBuffer = Moment(overAllStartDate).subtract(buffer_days, 'days');
            let enddateWithBuffer = Moment(overAllEndDate).add(buffer_days, 'days');
            let goFor = Moment(tempToday).isBetween(startdateWithBuffer, enddateWithBuffer);
            if (goFor) {
                
                leftPixels = DateHelper.dateToPixel(tempToday, dayWidth, startdateWithBuffer);
                if (selectedDateMode && selectedDateMode === 'day') {
                    leftPixels = leftPixels + 22
                }
                
            } 
        }
        return leftPixels;
             
    }

      setPixesForAllDates = (dayWidth, buffer_days) => {
        const { allWsDataArray } = this.state;
        let allWsDataArrayView = [];
        let allDeliverablesArray = [];
        allWsDataArrayView = JSON.parse(JSON.stringify(allWsDataArray));

        let testTop = 0; // this variable used to calculate top pixels in addition

        allWsDataArrayView.map((wsObj, wsInd) => {

            let chartObj = this.eachChartToPixelsWs(wsObj, dayWidth, buffer_days);
            wsObj.chartLeft = chartObj.chartLeft;
            wsObj.chartWidth = chartObj.chartWidth;

            testTop = testTop + 8; // 8 = chart top paddingg
            wsObj.chartTop = testTop;
            testTop = testTop + 36; // 36 = chart height(20) + chart down padding (8) + chart bottom margin (8)

            // loop over all activities
            wsObj.activities.map((actObj, actInd) => {
                let chartObj = this.eachChartToPixelsAct(actObj, dayWidth, buffer_days);
                actObj.chartLeft = chartObj.chartLeft;
                actObj.chartWidth = chartObj.chartWidth;

                testTop = testTop + 8;
                actObj.chartTop = testTop;
                testTop = testTop + 36;

                // loop over all deliverables
                actObj.deliverables.map((delObj, delInd) => {
                    let chartObj = this.eachChartToPixels(delObj, dayWidth, buffer_days);
                    delObj.chartLeft = chartObj.chartLeft;
                    delObj.chartWidth = chartObj.chartWidth;

                    testTop = testTop + 8;
                    delObj.chartTop = testTop;
                    testTop = testTop + 36;

                    // loop over all milestones
                    delObj.milestones.map((mileObj, mileInd) => {
                        this.eachMilestoneToPixels(mileObj, dayWidth, buffer_days);
                    });
                    const milestonesGroupedByDate = this.groupBy(delObj.milestones, 'timeLineDate');

                    delObj['milestonesGroup'] = milestonesGroupedByDate;

                });
                // add del array
                allDeliverablesArray = [...allDeliverablesArray, ...actObj.deliverables];
            });
        });
        const tempObj = this.groupBy(allDeliverablesArray, 'deliverableId'); // group by deli ids, use it in dependent deliverables

        // return the both wsdata array and all del array grouped by id
        let obj = {
            'allWsDataArrayView': allWsDataArrayView,
            'allDelIdObj': tempObj
        }
        return obj;
    }
    eachChartToPixelsWs = (chartObj, dayWidth, buffer_days) => {
        const { overAllStartDate } = this.state;
        let startdateWithBuffer = Moment(overAllStartDate).subtract(buffer_days, 'days');
        if (this.isDefined(chartObj.overAllWsStartType) && this.isDefined(chartObj.overAllWsEndType)) {
            let leftPixels = ((this.isDefined(chartObj.startDate) && this.isNonEmpty(chartObj.startDate)) ? DateHelper.dateToPixel(chartObj.startDate, dayWidth, startdateWithBuffer) :0);
            let rightPixels = ((this.isDefined(chartObj.endDate) && this.isNonEmpty(chartObj.endDate)) ? DateHelper.dateToPixel(chartObj.endDate, dayWidth, startdateWithBuffer) : 0);
            let widthPixels = rightPixels - leftPixels;
            chartObj['chartLeft'] = leftPixels + 'px';
            chartObj['chartRight'] = rightPixels + dayWidth;
            chartObj['chartWidth'] = ((this.isDefined(chartObj.endDate) && this.isNonEmpty(chartObj.endDate)) ? ((widthPixels + dayWidth) + 'px') : "100%");
            chartObj['timelineStartDate'] = [`${this.capitalize(chartObj.overAllWsStartType)} Start Date`, chartObj.overAllWsStartDate] 
            chartObj['timelineEndDate'] = [`${this.capitalize(chartObj.overAllWsEndType)} End Date`, chartObj.overAllWsEndDate] 
            let barLeftPixels = DateHelper.dateToPixel(chartObj.timelineStartDate[1], dayWidth, startdateWithBuffer);
            let barWidthPixels = DateHelper.dateToPixel(chartObj.timelineEndDate[1], dayWidth, startdateWithBuffer) - barLeftPixels;
            chartObj['barLeft'] = barLeftPixels + 'px';
            chartObj['barWidth'] = (barWidthPixels + dayWidth) + 'px';
        }
        else if(!this.isDefined(chartObj.overAllWsStartType) && this.isDefined(chartObj.overAllWsEndType)){
            let leftPixels = ((this.isDefined(chartObj.startDate) && this.isNonEmpty(chartObj.startDate)) ? DateHelper.dateToPixel(chartObj.startDate, dayWidth, startdateWithBuffer) :0);
            let rightPixels = ((this.isDefined(chartObj.endDate) && this.isNonEmpty(chartObj.endDate)) ? DateHelper.dateToPixel(chartObj.endDate, dayWidth, startdateWithBuffer) : 0);
            let widthPixels = rightPixels - leftPixels;
            chartObj['chartLeft'] = leftPixels + 'px';
            chartObj['chartRight'] = rightPixels + dayWidth;
            chartObj['chartWidth'] = ((this.isDefined(chartObj.endDate) && this.isNonEmpty(chartObj.endDate)) ? ((widthPixels + dayWidth) + 'px') : "100%");
            chartObj['timelineStartDate'] = this.setNewStartDate(chartObj)
            chartObj['timelineEndDate'] = [`${this.capitalize(chartObj.overAllWsEndType)} End Date`, chartObj.overAllWsEndDate]
            let barLeftPixels = (this.setNewStartDate(chartObj) !== "" ? DateHelper.dateToPixel(chartObj.timelineStartDate[1], dayWidth, startdateWithBuffer)  : 0 );
            let barWidthPixels = DateHelper.dateToPixel(chartObj.timelineEndDate[1], dayWidth, startdateWithBuffer) - barLeftPixels;
            chartObj['barLeft'] = barLeftPixels + 'px';
            chartObj['barWidth'] = (barWidthPixels + dayWidth) + 'px';
        }
        else if(this.isDefined(chartObj.overAllWsStartType) && !this.isDefined(chartObj.overAllWsEndType)){
            let leftPixels = ((this.isDefined(chartObj.startDate) && this.isNonEmpty(chartObj.startDate)) ? DateHelper.dateToPixel(chartObj.startDate, dayWidth, startdateWithBuffer) :0);
            let rightPixels = ((this.isDefined(chartObj.endDate) && this.isNonEmpty(chartObj.endDate)) ? DateHelper.dateToPixel(chartObj.endDate, dayWidth, startdateWithBuffer) : 0);
            let widthPixels = rightPixels - leftPixels;
            chartObj['chartLeft'] = leftPixels + 'px';
            chartObj['chartRight'] = rightPixels + dayWidth;
            chartObj['chartWidth'] = ((this.isDefined(chartObj.endDate) && this.isNonEmpty(chartObj.endDate)) ? ((widthPixels + dayWidth) + 'px') : "100%");
            
            chartObj['timelineStartDate'] = [`${this.capitalize(chartObj.overAllWsStartType)} Start Date`, chartObj.overAllWsStartDate]
            chartObj['timelineEndDate'] = this.setNewEndDate(chartObj)
            let barLeftPixels = DateHelper.dateToPixel(chartObj.timelineStartDate[1], dayWidth, startdateWithBuffer);
            let barWidthPixelsMinusleft =  DateHelper.dateToPixel(chartObj.timelineEndDate[1], dayWidth, startdateWithBuffer) - barLeftPixels
            let barWidthPixels = this.setNewEndDate(chartObj) === "" ? `calc(100% - ${barLeftPixels + dayWidth }px)` :( (barWidthPixelsMinusleft + dayWidth ) + 'px');
            chartObj['barLeft'] = barLeftPixels + 'px';
            chartObj['barWidth'] = barWidthPixels  ;
        }
        else if(!this.isDefined(chartObj.overAllWsStartType) && !this.isDefined(chartObj.overAllWsEndType) &&
        (this.setNewStartDate(chartObj) !== ""  && this.setNewEndDate(chartObj) !== "")){
            let leftPixels = ((this.isDefined(chartObj.startDate) && this.isNonEmpty(chartObj.startDate)) ? DateHelper.dateToPixel(chartObj.startDate, dayWidth, startdateWithBuffer) :0);
            let rightPixels = ((this.isDefined(chartObj.endDate) && this.isNonEmpty(chartObj.endDate)) ? DateHelper.dateToPixel(chartObj.endDate, dayWidth, startdateWithBuffer) : 0);
            let widthPixels = rightPixels - leftPixels;
            chartObj['chartLeft'] = leftPixels + 'px';
            chartObj['chartRight'] = rightPixels + dayWidth;
            chartObj['chartWidth'] = ((this.isDefined(chartObj.endDate) && this.isNonEmpty(chartObj.endDate)) ? ((widthPixels + dayWidth) + 'px') : "100%");
            
            chartObj['timelineStartDate'] = this.setNewStartDate(chartObj)
            chartObj['timelineEndDate'] = this.setNewEndDate(chartObj)
            let barLeftPixels = DateHelper.dateToPixel(chartObj.timelineStartDate[1], dayWidth, startdateWithBuffer);
            let barWidthPixels = DateHelper.dateToPixel(chartObj.timelineEndDate[1], dayWidth, startdateWithBuffer) - barLeftPixels;
            chartObj['barLeft'] = barLeftPixels + 'px';
            chartObj['barWidth'] = (barWidthPixels + dayWidth) + 'px';
        }
        else {
            chartObj['chartLeft'] = 0;
            chartObj['chartRight'] = 0;
            chartObj['chartWidth'] = '100%';
            chartObj['timelineStartDate'] = "";
            chartObj['timelineEndDate'] = "";
           
        }
        return chartObj;
    }
    eachChartToPixelsAct = (chartObj, dayWidth, buffer_days) => {
        const { overAllStartDate } = this.state;
        let startdateWithBuffer = Moment(overAllStartDate).subtract(buffer_days, 'days');
        if (this.isDefined(chartObj.overAllActivityStartType) && this.isDefined(chartObj.overAllActivityEndType)) {
            let leftPixels = ((this.isDefined(chartObj.startDate) && this.isNonEmpty(chartObj.startDate)) ? DateHelper.dateToPixel(chartObj.startDate, dayWidth, startdateWithBuffer) :0);
            let rightPixels = ((this.isDefined(chartObj.endDate) && this.isNonEmpty(chartObj.endDate)) ? DateHelper.dateToPixel(chartObj.endDate, dayWidth, startdateWithBuffer) : 0);
            let widthPixels = rightPixels - leftPixels;
            chartObj['chartLeft'] = leftPixels + 'px';
            chartObj['chartRight'] = rightPixels + dayWidth;
            chartObj['chartWidth'] = ((this.isDefined(chartObj.endDate) && this.isNonEmpty(chartObj.endDate)) ? ((widthPixels + dayWidth) + 'px') : "100%");
            chartObj['timelineStartDate'] = [`${this.capitalize(chartObj.overAllActivityStartType)} Start Date`, chartObj.overAllActivityStartDate]
            chartObj['timelineEndDate'] = [`${this.capitalize(chartObj.overAllActivityEndType)} End Date`, chartObj.overAllActivityEndDate]
            let barLeftPixels = DateHelper.dateToPixel(chartObj.timelineStartDate[1], dayWidth, startdateWithBuffer);
            let barWidthPixels = DateHelper.dateToPixel(chartObj.timelineEndDate[1], dayWidth, startdateWithBuffer) - barLeftPixels;
            chartObj['barLeft'] = barLeftPixels + 'px';
            chartObj['barWidth'] = (barWidthPixels + dayWidth) + 'px';
        }
        else if(!this.isDefined(chartObj.overAllActivityStartType) && this.isDefined(chartObj.overAllActivityEndType)){
            let leftPixels = ((this.isDefined(chartObj.startDate) && this.isNonEmpty(chartObj.startDate)) ? DateHelper.dateToPixel(chartObj.startDate, dayWidth, startdateWithBuffer) :0);
            let rightPixels = ((this.isDefined(chartObj.endDate) && this.isNonEmpty(chartObj.endDate)) ? DateHelper.dateToPixel(chartObj.endDate, dayWidth, startdateWithBuffer) : 0);
            let widthPixels = rightPixels - leftPixels;
            chartObj['chartLeft'] = leftPixels + 'px';
            chartObj['chartRight'] = rightPixels + dayWidth;
            chartObj['chartWidth'] = ((this.isDefined(chartObj.endDate) && this.isNonEmpty(chartObj.endDate)) ? ((widthPixels + dayWidth) + 'px') : "100%");
            chartObj['timelineStartDate'] = this.setNewStartDate(chartObj)
            chartObj['timelineEndDate'] = [`${this.capitalize(chartObj.overAllActivityEndType)} End Date`, chartObj.overAllActivityEndDate]
            let barLeftPixels = (this.setNewStartDate(chartObj) !== "" ? DateHelper.dateToPixel(chartObj.timelineStartDate[1], dayWidth, startdateWithBuffer)  : 0 );
            let barWidthPixels = DateHelper.dateToPixel(chartObj.timelineEndDate[1], dayWidth, startdateWithBuffer) - barLeftPixels;
            chartObj['barLeft'] = barLeftPixels + 'px';
            chartObj['barWidth'] = (barWidthPixels + dayWidth) + 'px';
        }
        else if(this.isDefined(chartObj.overAllActivityStartType) && !this.isDefined(chartObj.overAllActivityEndType)){
            let leftPixels = ((this.isDefined(chartObj.startDate) && this.isNonEmpty(chartObj.startDate)) ? DateHelper.dateToPixel(chartObj.startDate, dayWidth, startdateWithBuffer) :0);
            let rightPixels = ((this.isDefined(chartObj.endDate) && this.isNonEmpty(chartObj.endDate)) ? DateHelper.dateToPixel(chartObj.endDate, dayWidth, startdateWithBuffer) : 0);
            let widthPixels = rightPixels - leftPixels;
            chartObj['chartLeft'] = leftPixels + 'px';
            chartObj['chartRight'] = rightPixels + dayWidth;
            chartObj['chartWidth'] = ((this.isDefined(chartObj.endDate) && this.isNonEmpty(chartObj.endDate)) ? ((widthPixels + dayWidth) + 'px') : "100%");
            
            chartObj['timelineStartDate'] = [`${this.capitalize(chartObj.overAllActivityStartType)} Start Date`, chartObj.overAllActivityStartDate]
            chartObj['timelineEndDate'] = this.setNewEndDate(chartObj)
            let barLeftPixels = DateHelper.dateToPixel(chartObj.timelineStartDate[1], dayWidth, startdateWithBuffer);
            let barWidthPixelsMinusleft =  DateHelper.dateToPixel(chartObj.timelineEndDate[1], dayWidth, startdateWithBuffer) - barLeftPixels
            let barWidthPixels = this.setNewEndDate(chartObj) === "" ? `calc(100% - ${barLeftPixels + dayWidth}px)` : ((barWidthPixelsMinusleft + dayWidth)+ 'px' ) ;
            chartObj['barLeft'] = barLeftPixels + 'px';
            chartObj['barWidth'] = (barWidthPixels ) ;
        }
        else if(!this.isDefined(chartObj.overAllActivityStartType) && !this.isDefined(chartObj.overAllActivityEndType) &&
        (this.setNewStartDate(chartObj) !== ""  && this.setNewEndDate(chartObj) !== "")){
            let leftPixels = ((this.isDefined(chartObj.startDate) && this.isNonEmpty(chartObj.startDate)) ? DateHelper.dateToPixel(chartObj.startDate, dayWidth, startdateWithBuffer) :0);
            let rightPixels = ((this.isDefined(chartObj.endDate) && this.isNonEmpty(chartObj.endDate)) ? DateHelper.dateToPixel(chartObj.endDate, dayWidth, startdateWithBuffer) : 0);
            let widthPixels = rightPixels - leftPixels;
            chartObj['chartLeft'] = leftPixels + 'px';
            chartObj['chartRight'] = rightPixels + dayWidth;
            chartObj['chartWidth'] = ((this.isDefined(chartObj.endDate) && this.isNonEmpty(chartObj.endDate)) ? ((widthPixels + dayWidth) + 'px') : "100%");
            
            chartObj['timelineStartDate'] = this.setNewStartDate(chartObj)
            chartObj['timelineEndDate'] = this.setNewEndDate(chartObj)
            let barLeftPixels = DateHelper.dateToPixel(chartObj.timelineStartDate[1], dayWidth, startdateWithBuffer);
            let barWidthPixels = DateHelper.dateToPixel(chartObj.timelineEndDate[1], dayWidth, startdateWithBuffer) - barLeftPixels;
            chartObj['barLeft'] = barLeftPixels + 'px';
            chartObj['barWidth'] = (barWidthPixels + dayWidth) + 'px';
        }
        else {
            chartObj['chartLeft'] = 0;
            chartObj['chartRight'] = 0;
            chartObj['chartWidth'] = '100%';
            chartObj['timelineStartDate'] = "";
            chartObj['timelineEndDate'] = "";
        }
        return chartObj;
    }
   
    eachChartToPixels = (chartObj, dayWidth, buffer_days) => {
        const { overAllStartDate } = this.state;
        let startdateWithBuffer = Moment(overAllStartDate).subtract(buffer_days, 'days');
        //planned dates are present
        if (this.isDefined(chartObj.startDate) && this.isNonEmpty(chartObj.startDate)) {
            let leftPixels = DateHelper.dateToPixel(chartObj.startDate, dayWidth, startdateWithBuffer);
            let rightPixels = DateHelper.dateToPixel(chartObj.endDate, dayWidth, startdateWithBuffer);
            let widthPixels = rightPixels - leftPixels;

            chartObj['chartLeft'] = leftPixels + 'px';
            chartObj['chartRight'] = rightPixels + dayWidth;
            chartObj['chartWidth'] = (widthPixels + dayWidth) + 'px';
            chartObj['timelineStartDate'] = this.setNewStartDate(chartObj)
            chartObj['timelineEndDate'] = this.setNewEndDate(chartObj)
            let barLeftPixels = DateHelper.dateToPixel(chartObj.timelineStartDate[1], dayWidth, startdateWithBuffer);
            let barWidthPixels = DateHelper.dateToPixel(chartObj.timelineEndDate, dayWidth, startdateWithBuffer) - barLeftPixels;
            let barRightPixels = DateHelper.dateToPixel(chartObj.timelineEndDate, dayWidth, startdateWithBuffer);
            chartObj['barLeft'] = barLeftPixels + 'px';
            chartObj['barWidth'] = (barWidthPixels + dayWidth) + 'px';
            chartObj['barRight'] = barRightPixels + dayWidth;

        }
        //planned dates not present
        // start date and end date are present irrespective of actual and expected
        else if (((this.isDefined(chartObj.actualStartDate) && this.isNonEmpty(chartObj.actualStartDate)) || (this.isDefined(chartObj.expStartDate) && this.isNonEmpty(chartObj.expStartDate)))
            && ((this.isDefined(chartObj.actualEndDate) && this.isNonEmpty(chartObj.actualEndDate)) || (this.isDefined(chartObj.expEndDate) && this.isNonEmpty(chartObj.expEndDate)))) {

            chartObj['chartLeft'] = 0;
            chartObj['chartRight'] = 0;
            chartObj['chartWidth'] = '100%';
            chartObj['timelineStartDate'] = this.setNewStartDate(chartObj)
            chartObj['timelineEndDate'] = this.setNewEndDate(chartObj)
            let barLeftPixels = DateHelper.dateToPixel(chartObj.timelineStartDate[1], dayWidth, startdateWithBuffer);
            let barWidthPixels = DateHelper.dateToPixel(chartObj.timelineEndDate[1], dayWidth, startdateWithBuffer) - barLeftPixels;
            let barRightPixels = DateHelper.dateToPixel(chartObj.timelineEndDate[1], dayWidth, startdateWithBuffer);
            chartObj['barLeft'] = barLeftPixels + 'px';
            chartObj['barWidth'] = (barWidthPixels + dayWidth) + 'px';
            chartObj['barRight'] = barRightPixels + dayWidth;
        }
        // only end date is present irrespective of actual and expected
        else if (!((this.isDefined(chartObj.actualStartDate) && this.isNonEmpty(chartObj.actualStartDate)) || (this.isDefined(chartObj.expStartDate) && this.isNonEmpty(chartObj.expStartDate)))
            && ((this.isDefined(chartObj.actualEndDate) && this.isNonEmpty(chartObj.actualEndDate)) || (this.isDefined(chartObj.expEndDate) && this.isNonEmpty(chartObj.expEndDate)))) {
            chartObj['chartLeft'] = 0;
            chartObj['chartRight'] = 0;
            chartObj['chartWidth'] = '100%';
            chartObj['timelineStartDate'] = ""
            chartObj['timelineEndDate'] = this.setNewEndDate(chartObj)
            let barLeftPixels = 0;
            let barWidthPixels = DateHelper.dateToPixel(chartObj.timelineEndDate[1], dayWidth, startdateWithBuffer) - barLeftPixels;
            let barRightPixels = DateHelper.dateToPixel(chartObj.timelineEndDate[1], dayWidth, startdateWithBuffer);
            chartObj['barLeft'] = barLeftPixels + 'px';
            chartObj['barWidth'] = (barWidthPixels + dayWidth) + 'px';
            chartObj['barRight'] = barRightPixels + dayWidth;
        }
        // only start date is present irrespective of actual and expected
        else if (((this.isDefined(chartObj.actualStartDate) && this.isNonEmpty(chartObj.actualStartDate)) || (this.isDefined(chartObj.expStartDate) && this.isNonEmpty(chartObj.expStartDate)))
            && !((this.isDefined(chartObj.actualEndDate) && this.isNonEmpty(chartObj.actualEndDate)) || (this.isDefined(chartObj.expEndDate) && this.isNonEmpty(chartObj.expEndDate)))) {
            chartObj['chartLeft'] = 0;
            chartObj['chartRight'] = 0;
            chartObj['chartWidth'] = '100%';
            chartObj['timelineStartDate'] = this.setNewStartDate(chartObj)
            chartObj['timelineEndDate'] = ""
            let barLeftPixels = DateHelper.dateToPixel(chartObj.timelineStartDate[1], dayWidth, startdateWithBuffer) ;
            let barWidthPixels = `calc(100% - ${barLeftPixels + dayWidth}px)`;
            let barRightPixels = `calc(100% - ${dayWidth})`;
            chartObj['barLeft'] = barLeftPixels + 'px';
            chartObj['barWidth'] = barWidthPixels ;
            chartObj['barRight'] = barRightPixels;
        }
        // none of planned,actual,expecetd dates are present
        else {
            chartObj['chartLeft'] = 0;
            chartObj['chartRight'] = 0;
            chartObj['chartWidth'] = '100%';
            chartObj['timelineStartDate'] = "";
            chartObj['timelineEndDate'] = "";

        }

        return chartObj;
    }
    capitalize = (word) => {
        let result = (word[0].toUpperCase()).concat(word.substring(1, word.length));
        return result;
    }
    setNewStartDate = (chartObj) => {
        let tempDate = '';
        if (chartObj.actualStartDate !== "" && chartObj.actualStartDate !== null) {
            tempDate = ["Actual Start Date", chartObj.actualStartDate];

        }
        else if (chartObj.expStartDate !== "" && chartObj.expStartDate !== null) {
            tempDate = ["Expected Start Date", chartObj.expStartDate];
        }
        else if (chartObj.startDate !== "" && chartObj.startDate !== null) {
            tempDate =  ["Planned Start Date", chartObj.startDate];
        }
        else {
            tempDate = "";
        }
        return tempDate;
    }
    setNewEndDate = (chartObj) => {
        let tempDate = '';
        if (chartObj.actualEndDate !== "" && chartObj.actualEndDate !== null) {
            tempDate = ["Actual End Date", chartObj.actualEndDate];

        }
        else if (chartObj.expEndDate !== "" && chartObj.expEndDate !== null) {
            tempDate = ["Expected End Date", chartObj.expEndDate];
        }
        else if (chartObj.endDate !== "" && chartObj.endDate !== null){
            tempDate = ["Planned End Date", chartObj.endDate];
        }
        else {
            tempDate = "";
        }
        return tempDate;
    }

    eachMilestoneToPixels = (mileObj, dayWidth, buffer_days) => {
        const { overAllStartDate } = this.state;
        let startdateWithBuffer = Moment(overAllStartDate).subtract(buffer_days, 'days');

        let mileDate = '';

        if (this.isDefined(mileObj.milestoneDate) && this.isNonEmpty(mileObj.milestoneDate)) {

            if (this.isDefined(mileObj.expDate) && this.isNonEmpty(mileObj.expDate)) {

                /*
                if (new Date(mileObj.milestoneDate) > new Date(mileObj.expDate)){
                    mileDate = mileObj.milestoneDate;
                }
                else{
                */
                mileDate = mileObj.expDate;
                //}
            }
            else if (this.isDefined(mileObj.actualDate) && this.isNonEmpty(mileObj.actualDate)) {

                /*
                if (new Date(mileObj.milestoneDate) > new Date(mileObj.actualDate)){
                    mileDate = mileObj.milestoneDate;
                }
                else{
                */
                mileDate = mileObj.actualDate;
                //}
            }
            else {
                mileDate = mileObj.milestoneDate;
            }
        }

        mileObj.timeLineDate = mileDate;


        if ((this.isDefined(mileObj.milestoneDate) && this.isNonEmpty(mileObj.milestoneDate))
            || (this.isDefined(mileObj.actualDate) && this.isNonEmpty(mileObj.actualDate))
            || (this.isDefined(mileObj.expDate) && this.isNonEmpty(mileObj.expDate))
        ) {
            let leftPixels = DateHelper.dateToPixel(mileDate, dayWidth, startdateWithBuffer);

            // remove 10 px (half of icon width) to make icon to point to start of a milestone date
            leftPixels = Number(leftPixels) - 10;

            // add half of the day-width to make icon visible at the centre of milestone date
            leftPixels = leftPixels + (dayWidth / 2);

            mileObj['milestoneLeft'] = leftPixels + 'px';
            // chartObj['chartWidth']= (widthPixels + dayWidth)+ 'px';
        } else {
            mileObj['milestoneLeft'] = 0;
            // chartObj['chartWidth']= '100%';
        }

        return mileObj;
    }

    assignDateMode = () => {
        const { selectedDateMode, workstreamStore } = this.props;
        const { overAllStartDate, overAllEndDate } = this.state;
        if ((overAllStartDate && overAllStartDate !== '') && (overAllEndDate && overAllEndDate !== '') ) {
            let daysDiff = Moment(overAllEndDate).diff(Moment(overAllStartDate), 'days');
            let dayWidth = this.getDayWidth(selectedDateMode);
            let buffer_days = this.getBufferDays(selectedDateMode, daysDiff, dayWidth);
            let alteredObj = this.setPixesForAllDates(dayWidth, buffer_days);
            let todayLeftPixels = this.setTodayPixels(selectedDateMode , dayWidth, buffer_days);
            this.setState({
                numOfDiffDays: daysDiff,
                singleDayWidth: dayWidth,
                bufferDays: buffer_days,
                allWsDataArray: alteredObj.allWsDataArrayView,
                allDelIdObj: alteredObj.allDelIdObj,
                todayLeftPixels: todayLeftPixels
            });
        } else {
            workstreamStore.sumOfBoxesWidth = '100%'
        }
    }

    buildAllServiceDataToState = (serviceData) => {

        let startDate = serviceData.overAllStartDate;
        let endDate = serviceData.overAllEndDate;
        let allWsDataArrayView = [];
        allWsDataArrayView = JSON.parse(JSON.stringify(serviceData.allWsDetailsDtoList));
        allWsDataArrayView.map((wsObj, wsInd) => {

            wsObj['isWsInputEnabled'] = false;
            wsObj['isWsMenuClicked'] = false;
            wsObj['addedActivities'] = [];
            wsObj['chartLeft'] = 0;
            wsObj['chartRight'] = 0;
            wsObj['chartTop'] = 0;
            wsObj['chartWidth'] = '100%';
            wsObj['chartColor'] = this.setColour(wsObj.status)
            wsObj.activities.map((actObj, actInd) => {
                actObj['isActInputEnabled'] = false;
                actObj['isActMenuClicked'] = false;
                actObj['chartLeft'] = 0;
                actObj['chartRight'] = 0;
                actObj['chartTop'] = 0;
                actObj['chartWidth'] = '100%';
                actObj['chartColor'] = this.setColour(actObj.status)
                actObj['addedDeliverables'] = [];
                actObj.deliverables.map((delObj, delInd) => {
                    delObj['addedMilestones'] = [];
                    delObj['isDelInputEnabled'] = false;
                    delObj['chartLeft'] = 0;
                    delObj['chartRight'] = 0;
                    delObj['chartTop'] = 0;
                    delObj['chartWidth'] = '100%';
                    delObj['chartColor'] = this.setColour(delObj.status)
                    delObj.milestones.map(mileObj => {
                        mileObj['milestoneLeft'] = 0;
                        mileObj['isMenuClicked'] = false;
                    });

                    delObj['milestonesGroup'] = {};
                });
            });
        });
        this.setState({
            allWsDataArray: allWsDataArrayView,
            overAllStartDate: startDate,
            overAllEndDate: endDate,
            showLoadingInd: false
        }, () => {
            this.assignDateMode();
        });
    }
    setColour = (status) => {
        let value = "";
        switch (status) {
            case "CMP_WITHIN_DUE_DT":
                value = "#339933";
                break;
            case "CMP_AFTER_DUE_DT":
                value = "#59A14F"
                break;
            case "DELAYED":
                value = "#E15759"
                break;
            case "INPROGRESS":
                value = "#4E79A7"
                break;
            case "NOT_STARTED":
                value = "#A5A4A4"
                break;

            default:
                break;
        }
        return value
    }
    // -- Sorting -- //
    fetchAllWsTreeDetailsSort() {
        const { selectedSortKeys, workstreamStore } = this.props;
        if (selectedSortKeys.length !== 0) {
            workstreamStore.fetchAllWsTreeDetailsSort(this.props.sortBy, this.props.sortType, "actuals")
                .then(response => {

                    if (response && response.data) {
                        if (!response.error && response.data.resultCode === "OK") {
                            const resultObj = response.data.resultObj;
                            const resultArray = response.data.resultObj.allWsDetailsDtoList;
                            this.setState({
                                showLoadingInd: false
                            });
                            this.buildAllServiceDataToState(resultObj);

                            this.props.wsListArray(resultArray.length > 0);

                        } else {
                        }
                    } else {
                        this.showErrorNotification("Sorry! Something went wrong", "Error", "error");
                    }

                });
        }
    }


    // ----- START of Utility functions -------
    isDefined = (value) => {
        return value !== undefined && value !== null;
    }

    isNonEmpty = (value) => {
        return value !== '';
    }

    showErrorNotification = (message, title, type) => {
        if (type === 'error') {
            toast.error(<NotificationMessage
                title={title}
                bodytext={message}
                icon={type}
            />, {
                position: toast.POSITION.BOTTOM_RIGHT
            });
        }
        if (type === 'success') {
            toast.info(<NotificationMessage
                title={title}
                bodytext={message}
                icon={type}
            />, {
                position: toast.POSITION.BOTTOM_RIGHT
            });
        }

    }

    // ------------ END of all common handlers for save,input,keydown,doubleclick -----------

    render() {

        const todayDate = Moment(DateHelper.getToday());
        
        const { addedNewWsArray, allWsDataArray, showLoadingInd } = this.state;
        const sortable = this.props.selectedSortKeys.length === 0;

        return (
            <div className="dws-tab-content-wrapper">
                {showLoadingInd ?
                    <div className="ws-spinner-div">
                        <i className="fa fa-spinner fa-spin" style={{ height: "min-content", fontSize: '25px', color: '#ffffff' }}></i>
                    </div>
                    : ((addedNewWsArray && addedNewWsArray.length === 0) && (allWsDataArray && allWsDataArray.length === 0)) ?
                        <div className="no-ws-msg row">To begin, add&nbsp; <span className="clickable-span" id="add_ws_on_empty" onClick={() => { this.addNewWsName() }}>Workstreams</span></div>
                        :
                        <Fragment>

                            <div className="all-wda-info-main row sorted-view-main">
                                <div className="all-ws-tree-main">
                                {((this.state.overAllStartDate && this.state.overAllStartDate !== '' ) && (this.state.overAllEndDate && this.state.overAllEndDate !== '' ))?
                                        <div className="no-content-div">
                                        </div> : ''
                                    }
                                    <div className="ws-tree-wrapper">
                                        {/* saved and existing workstream data and its activities and deliverables */}
                                        {allWsDataArray && allWsDataArray.map((wsObj, wsInd) => (
                                            <div key={`ws_${wsInd}`} className="row each-ws-row">
                                                {/* existing or saved workstream only row */}
                                                <div className="col-sm-12">
                                                    <div className={`ws-name-row ${wsObj.isWsInputEnabled && sortable ? 'name-input' : 'name-label'}`}>
                                                        {/* <div className="ws-indicator">
                                                            {wsObj.activities && wsObj.activities.length > 0 ?
                                                                <img src={downIndIcon} alt="open"></img>
                                                                : <img src={rightIndIcon} alt="close"></img>
                                                            }
                                                        </div> */}
                                                        <div className="ws-name-div">
                                                            <label className="ws-name-label">
                                                                {wsObj.name.length > 0 ?
                                                                    <Fragment>
                                                                        {wsObj.name.length > 16 ?
                                                                            <Fragment><span data-tip="" data-for={`ws_name_tt_${wsInd}`} data-type="dark" data-place="right" className="ws-name-display">{wsObj.name.substr(0, 16)}...</span>
                                                                                <ReactTooltip id={`ws_name_tt_${wsInd}`}>{wsObj.name}</ReactTooltip>
                                                                            </Fragment>
                                                                            : <span className="ws-name-display">{wsObj.name}</span>
                                                                        }
                                                                    </Fragment>

                                                                    : <span className="ws-name-placeholder">Add Workstream</span>
                                                                }
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>
                                                {/* all saved  and new activities rows */}
                                                <div className="all-act-in-ws">
                                                    {/* existing or saved activities rows only */}
                                                    {wsObj && wsObj.activities && wsObj.activities.map((actObj, actInd) => (
                                                        <div key={`ws_${wsInd}_act_${actInd}`} className="act-and-del-binder">
                                                            <div className="col-sm-12">
                                                                <div className={`act-name-row ${actObj.isActInputEnabled && sortable ? 'name-input' : 'name-label'}`}>
                                                                    {/* <div className="ws-indicator">
                                                                        {actObj.deliverables && actObj.deliverables.length > 0 ?
                                                                            <img src={downIndIcon} alt="open"></img>
                                                                            : <img src={rightIndIcon} alt="close"></img>
                                                                        }
                                                                    </div> */}
                                                                    <div className="ws-name-div">
                                                                        <label className="ws-name-label">
                                                                            {actObj.name.length > 0 ?
                                                                                <Fragment>
                                                                                    {actObj && actObj.name.length > 15 ?
                                                                                        <Fragment>
                                                                                            <span data-tip="" data-for={`ws_${wsInd}_act_name_tt_${actInd}`} data-place="right" data-type="dark" className="ws-name-display">{actObj.name.substr(0, 15)}...</span>
                                                                                            <ReactTooltip id={`ws_${wsInd}_act_name_tt_${actInd}`}>{actObj.name}</ReactTooltip>
                                                                                        </Fragment>
                                                                                        : <span className="ws-name-display">{actObj.name}</span>
                                                                                    }
                                                                                </Fragment>
                                                                                : <span className="ws-name-placeholder">Add Activity</span>
                                                                            }
                                                                        </label>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            {/* del rows of a single activity */}
                                                            {/* all saved  and new activities rows */}
                                                            <div className="all-del-in-act">
                                                                {/* existing or saved deliverables rows only */}
                                                                {actObj && actObj.deliverables && actObj.deliverables.map((delObj, delInd) => (
                                                                    <div key={`ws_${wsInd}_act_${actInd}_del_${delInd}`} className="col-sm-12">
                                                                        <div className={`del-name-row ${delObj.isDelInputEnabled && sortable ? 'name-input' : 'name-label'}`}>

                                                                            <div className="ws-name-div">
                                                                                <label onDoubleClick={sortable ? () => { this.makeInputHandlerDel('del', wsInd, actInd, delInd) } : () => { }} className="ws-name-label">
                                                                                    {delObj.name.length > 0 ?
                                                                                        <Fragment>
                                                                                            {delObj.name.length > 20 ?
                                                                                                <Fragment>
                                                                                                    <span data-tip="" data-for={`ws_${wsInd}_act_${actInd}_del_name_tt_${delInd}`} data-place="right" data-type="dark" className="ws-name-display">{delObj.name.substr(0, 20)}...</span>
                                                                                                    <ReactTooltip id={`ws_${wsInd}_act_${actInd}_del_name_tt_${delInd}`}>{delObj.name}</ReactTooltip>
                                                                                                </Fragment>
                                                                                                : <span className="ws-name-display">{delObj.name}</span>
                                                                                            }


                                                                                        </Fragment>
                                                                                        : <span className="ws-name-placeholder">Add Deliverable</span>
                                                                                    }
                                                                                </label>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                ))
                                                                }
                                                            </div>
                                                        </div>
                                                    ))
                                                    }
                                                </div>
                                            </div>
                                        ))

                                        }

                                    </div>
                                </div>
                                <ScrollSync>
                                <div className="all-ws-chart-main" id="all_ws_chart_main">
                                    {(this.state.overAllStartDate && this.state.overAllStartDate !== '' && this.state.overAllEndDate && this.state.overAllEndDate !== '')?
                                    <ScrollSyncPane>
                                        <div ref={this.chartContainerRef} className="ws-timeline-header-main">
                                            <WsTimelineHeader
                                                numVisibleDays={this.state.numOfDiffDays}
                                                currentday={0}
                                                nowposition={0}
                                                overAllStartDate={this.state.overAllStartDate}
                                                bufferDays={this.state.bufferDays}
                                                dayWidth={this.state.singleDayWidth}
                                                mode={this.props.selectedDateMode}
                                            >
                                            </WsTimelineHeader>
                                            {this.state.todayLeftPixels && this.state.todayLeftPixels !== 0 ?
                                                        <div className="today-header" style={{ left: (this.state.todayLeftPixels - 4), position: 'absolute' }}>
                                                            <div data-tip="" data-for={`today_date_tt`} data-type="dark" className="caret-triangle"></div>
                                                    <ReactTooltip id={`today_date_tt`} ><span>Today : {todayDate.format('D-MMM-YYYY')}</span></ReactTooltip>
                                                        </div>
                                                        : ''
                                                    }
                                        </div>
                                        </ScrollSyncPane>
                                        : ''
                                    }
                                    <ScrollSyncPane>
                                    <DefineWsActualsSortGanttCharts  
                                        allDelIdObj={this.state.allDelIdObj}
                                        hideConnectors={this.props.hideConnectors}
                                        sortable = {sortable}
                                        addedNewWsArray={addedNewWsArray}
                                        allWsDataArray={allWsDataArray}
                                        fetchAllWsTreeDetails={this.fetchAllWsTreeDetails}
                                        deleteDeliverableHandler={this.deleteDeliverableHandler}
                                        selectedDateMode={this.props.selectedDateMode}
                                        todayLeftPixels = {this.state.todayLeftPixels}
                                    ></DefineWsActualsSortGanttCharts>
                                    </ScrollSyncPane>
                                </div>
                                </ScrollSync>
                            </div>
                        </Fragment>
                }
            </div>
        )
    }
}

export default withRouter(DefineWsActualsSortView);